#!/usr/bin/env python3
import json
import os
import re
import sqlite3
import subprocess
import unicodedata
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from training_seed import DEFAULT_TRAINING_SLOTS, TRAINING_DAYS

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR
DB_PATH = Path(os.environ.get("IC_DB_PATH", str(BASE_DIR / "ic_teams.sqlite")))
HOST = os.environ.get("IC_ADMIN_HOST", "0.0.0.0")
PORT = int(os.environ.get("IC_ADMIN_PORT", "8081"))
UPDATE_KLASSIERUNG_SCRIPT = BASE_DIR / "update_klassierung_from_mytennis.py"
SEARCH_SCRIPT = BASE_DIR / "mytennis_player_search.py"

SEARCH_URL = "https://high-scalability.microservices.swisstennis.ch/main-index-query"
PLAYER_URL = "https://www.mytennis.ch/de/spieler/{player_id}"
SEARCH_HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://www.mytennis.ch",
    "Referer": "https://www.mytennis.ch/",
    "User-Agent": "Mozilla/5.0",
}
DAY_ORDER = {day: index for index, day in enumerate(TRAINING_DAYS)}
EVENING_START = "18:00"
EVENING_END = "22:00"


def db_connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def ensure_schema():
    conn = db_connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS ranking_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            player_name TEXT NOT NULL,
            myTennisID TEXT NOT NULL DEFAULT '',
            old_klassierung TEXT NOT NULL DEFAULT '',
            new_klassierung TEXT NOT NULL DEFAULT '',
            changed_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS training_slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day TEXT NOT NULL,
            time_from TEXT NOT NULL,
            time_to TEXT NOT NULL,
            court_number INTEGER NOT NULL,
            team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
            label_override TEXT NOT NULL DEFAULT '',
            UNIQUE(day, time_from, time_to, court_number)
        )
        """
    )

    slot_count = conn.execute("SELECT COUNT(*) FROM training_slots").fetchone()[0]
    if slot_count == 0:
        for slot in DEFAULT_TRAINING_SLOTS:
            team_id = None
            label_override = str(slot.get("label", "")).strip()
            team_title = str(slot.get("team_title", "")).strip()
            if team_title:
                row = conn.execute(
                    """
                    SELECT id
                    FROM teams
                    WHERE trim(gender || ' ' || category || ' ' || liga) = ?
                    """,
                    (team_title,),
                ).fetchone()
                if row:
                    team_id = int(row["id"])
                    label_override = ""
                else:
                    label_override = team_title

            conn.execute(
                """
                INSERT OR IGNORE INTO training_slots(day, time_from, time_to, court_number, team_id, label_override)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    slot["day"],
                    slot["time_from"],
                    slot["time_to"],
                    int(slot["court_number"]),
                    team_id,
                    label_override,
                ),
            )
    conn.commit()
    conn.close()


def search_players(vorname: str = "", nachname: str = "", limit: int = 50):
    keyword = f"{vorname} {nachname}".strip()
    payload = {"keyword": keyword, "offset": 0, "limit": limit}
    req = Request(
        SEARCH_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers=SEARCH_HEADERS,
        method="POST",
    )
    with urlopen(req, timeout=10) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    hits = body.get("hits", {}).get("hits", [])
    players = []
    for hit in hits:
        src = hit.get("_source", {})
        if src.get("type") != "player":
            continue
        players.append(
            {
                "id": str(src.get("rawId", "")),
                "name": src.get("title", "–"),
                "classification": src.get("classification", ""),
                "url": PLAYER_URL.format(player_id=src.get("rawId", "")),
            }
        )
    return players


def normalize_for_search(value: str) -> str:
    value = str(value or "").strip()
    norm = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in norm if not unicodedata.combining(ch))


def normalize_key(value: str) -> str:
    return normalize_for_search(value).casefold().strip()


def split_name_parts(full_name: str):
    parts = [p for p in str(full_name).strip().split() if p]
    if len(parts) < 2:
        return None
    return parts


def expand_last_name_variants(value: str):
    raw = str(value or "").strip()
    variants = []

    def add(item: str):
        item = str(item or "").strip()
        if item and item not in variants:
            variants.append(item)

    add(raw)
    add(normalize_for_search(raw))

    collapsed = re.sub(r"[-'’]", "", raw)
    add(collapsed)
    add(normalize_for_search(collapsed))

    parts = [p for p in re.split(r"[-'’]", raw) if p]
    if len(parts) > 1:
        add(parts[-1])
        add(normalize_for_search(parts[-1]))

    return variants


def build_queries(name_parts: list[str]):
    first = name_parts[0]
    last_only = name_parts[-1]
    rest = " ".join(name_parts[1:])
    raw = []

    for variant in expand_last_name_variants(last_only):
        raw.append((first, variant))
    if rest and rest != last_only:
        for variant in expand_last_name_variants(rest):
            raw.append((first, variant))

    queries = []
    seen = set()
    for v, n in raw:
        for qv, qn in ((v, n), (normalize_for_search(v), normalize_for_search(n))):
            key = (qv, qn)
            if key in seen:
                continue
            seen.add(key)
            queries.append(key)
    return queries


def choose_best_hit(full_name: str, hits: list[dict]):
    if not hits:
        return None
    target = normalize_key(full_name)
    target_parts = target.split()
    target_first = target_parts[0] if target_parts else ""
    target_last_only = target_parts[-1] if len(target_parts) > 1 else ""
    target_rest = " ".join(target_parts[1:]) if len(target_parts) > 1 else ""

    def score(hit: dict):
        name = str(hit.get("name") or "").strip()
        key = normalize_key(name)
        parts = key.split()
        first = parts[0] if parts else ""
        last = " ".join(parts[1:]) if len(parts) > 1 else ""
        last_only = parts[-1] if len(parts) > 1 else ""
        return (
            0 if key == target else 1,
            0 if (first == target_first and last_only == target_last_only) else 1,
            0 if (first == target_first and last == target_rest) else 1,
            0 if (last_only and last_only == target_last_only) else 1,
            0 if (first and first == target_first) else 1,
        )

    return sorted(hits, key=score)[0]


def enrich_player(player_id: int):
    conn = db_connect()
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    row = cur.execute("SELECT id, name FROM players WHERE id=?", (player_id,)).fetchone()
    if row is None:
        conn.close()
        return None

    full_name = row["name"]
    parts = split_name_parts(full_name)
    if not parts:
        conn.close()
        return None

    hits = []
    seen_urls = set()
    for qv, qn in build_queries(parts):
        try:
            q_hits = search_players(vorname=qv, nachname=qn, limit=50)
        except Exception:
            continue
        for h in q_hits:
            url_key = str(h.get("url") or h.get("URL") or "")
            if url_key in seen_urls:
                continue
            seen_urls.add(url_key)
            hits.append(h)

    best = choose_best_hit(full_name, hits)
    if not best:
        conn.close()
        return None

    klass = str(best.get("classification") or best.get("Kategorie") or "").strip().upper()
    url = str(best.get("url") or best.get("URL") or "").strip()
    if not url:
        conn.close()
        return None

    cur.execute(
        "UPDATE players SET klassierung=?, myTennisID=? WHERE id=?",
        (klass, url, player_id),
    )
    conn.commit()
    conn.close()
    return {"klassierung": klass, "myTennisID": url}


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-cache")
    handler.end_headers()
    handler.wfile.write(body)


def read_json(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length > 0 else b"{}"
    return json.loads(raw.decode("utf-8"))


def list_teams():
    conn = db_connect()
    cur = conn.cursor()
    rows = cur.execute(
        """
        SELECT id, gender, category, liga, teamziel, trainingstag
        FROM teams
        ORDER BY CASE gender WHEN 'Damen' THEN 0 ELSE 1 END,
                 CASE upper(replace(liga, ' ', ''))
                   WHEN 'NLA' THEN 0
                   WHEN 'NLB' THEN 1
                   WHEN 'NLC' THEN 2
                   WHEN '1.LIGA' THEN 3
                   WHEN '2.LIGA' THEN 4
                   WHEN '3.LIGA' THEN 5
                   ELSE 99
                 END,
                 CASE
                   WHEN category = 'Aktiv' THEN 0
                   WHEN category GLOB '[0-9]*+' THEN CAST(replace(category, '+', '') AS INTEGER)
                   ELSE 999
                 END,
                 category,
                 liga
        """
    ).fetchall()
    conn.close()

    out = []
    for r in rows:
        out.append(
            {
                "id": r["id"],
                "display_name": f"{r['gender']} {r['category']} {r['liga']}".strip(),
                "gender": r["gender"],
                "category": r["category"],
                "liga": r["liga"],
                "teamziel": r["teamziel"],
                "trainingstag": r["trainingstag"],
            }
        )
    return out


def list_players():
    conn = db_connect()
    cur = conn.cursor()
    rows = cur.execute(
        """
        SELECT p.id, p.name, p.klassierung, p.myTennisID, p.team_id, p.captain_status,
               t.gender, t.category, t.liga
        FROM players p
        JOIN teams t ON t.id = p.team_id
        ORDER BY t.gender, t.category, t.liga,
                 CASE p.captain_status WHEN 1 THEN 0 WHEN 2 THEN 1 ELSE 2 END,
                 CASE
                   WHEN upper(p.klassierung) GLOB 'N[0-9]*' THEN 0
                   WHEN upper(p.klassierung) GLOB 'R[0-9]*' THEN 1
                   ELSE 9
                 END,
                 CAST(substr(upper(p.klassierung), 2) AS INTEGER),
                 lower(p.name)
        """
    ).fetchall()
    conn.close()

    out = []
    for r in rows:
        out.append(
            {
                "id": r["id"],
                "name": r["name"],
                "klassierung": r["klassierung"] or "",
                "myTennisID": r["myTennisID"] or "",
                "team_id": r["team_id"],
                "captain_status": int(r["captain_status"]),
                "team_display": f"{r['gender']} {r['category']} {r['liga']}".strip(),
            }
        )
    return out


def list_ranking_changes():
    ensure_schema()
    conn = db_connect()
    cur = conn.cursor()
    rows = cur.execute(
        """
        SELECT id, player_id, player_name, myTennisID, old_klassierung, new_klassierung, changed_at
        FROM ranking_changes
        ORDER BY datetime(changed_at) DESC, id DESC
        """
    ).fetchall()
    conn.close()

    out = []
    for r in rows:
        out.append(
            {
                "id": r["id"],
                "player_id": r["player_id"],
                "player_name": r["player_name"],
                "myTennisID": r["myTennisID"] or "",
                "old_klassierung": r["old_klassierung"] or "",
                "new_klassierung": r["new_klassierung"] or "",
                "changed_at": r["changed_at"],
            }
        )
    return out


def list_training_slots():
    ensure_schema()
    conn = db_connect()
    cur = conn.cursor()
    rows = cur.execute(
        """
        SELECT ts.id, ts.day, ts.time_from, ts.time_to, ts.court_number, ts.team_id, ts.label_override,
               t.gender, t.category, t.liga
        FROM training_slots ts
        LEFT JOIN teams t ON t.id = ts.team_id
        ORDER BY CASE ts.day
                   WHEN 'Montag' THEN 0
                   WHEN 'Dienstag' THEN 1
                   WHEN 'Mittwoch' THEN 2
                   WHEN 'Donnerstag' THEN 3
                   WHEN 'Freitag' THEN 4
                   ELSE 99
                 END,
                 ts.time_from,
                 ts.time_to,
                 ts.court_number,
                 ts.id
        """
    ).fetchall()
    conn.close()

    out = []
    for r in rows:
        display = f"{r['gender']} {r['category']} {r['liga']}".strip() if r["team_id"] else (r["label_override"] or "")
        out.append(
            {
                "id": r["id"],
                "day": r["day"],
                "time_from": r["time_from"],
                "time_to": r["time_to"],
                "court_number": int(r["court_number"]),
                "team_id": int(r["team_id"]) if r["team_id"] else None,
                "label_override": r["label_override"] or "",
                "display_label": display,
            }
        )
    return out


def validate_team(data):
    required = ["gender", "category", "liga", "teamziel", "trainingstag"]
    for key in required:
        if not str(data.get(key, "")).strip():
            return f"Feld '{key}' ist erforderlich."
    if data.get("gender") not in ("Damen", "Herren"):
        return "gender muss 'Damen' oder 'Herren' sein."
    return None


def validate_player(data):
    if not str(data.get("name", "")).strip():
        return "Feld 'name' ist erforderlich."
    try:
        team_id = int(data.get("team_id"))
    except Exception:
        return "team_id ist ungültig."
    try:
        captain_status = int(data.get("captain_status"))
    except Exception:
        return "captain_status ist ungültig."
    if captain_status not in (0, 1, 2):
        return "captain_status muss 0, 1 oder 2 sein."
    if team_id <= 0:
        return "team_id ist ungültig."
    return None


def validate_ranking_change(data):
    if not str(data.get("player_name", "")).strip():
        return "Feld 'player_name' ist erforderlich."
    if not str(data.get("changed_at", "")).strip():
        return "Feld 'changed_at' ist erforderlich."
    return None


def validate_training_slot(data):
    day = str(data.get("day", "")).strip()
    time_from = str(data.get("time_from", "")).strip()
    time_to = str(data.get("time_to", "")).strip()
    label_override = str(data.get("label_override", "")).strip()
    team_raw = data.get("team_id")

    if day not in TRAINING_DAYS:
        return "Ungültiger Tag."
    if not re.fullmatch(r"\d{2}:\d{2}", time_from):
        return "time_from muss HH:MM sein."
    if not re.fullmatch(r"\d{2}:\d{2}", time_to):
        return "time_to muss HH:MM sein."
    if time_from >= time_to:
        return "time_to muss nach time_from liegen."
    try:
        court_number = int(data.get("court_number"))
    except Exception:
        return "court_number ist ungültig."
    if court_number < 1 or court_number > 4:
        return "court_number muss zwischen 1 und 4 liegen."
    if team_raw in (None, "", 0, "0"):
        if not label_override:
            return "Ohne Team ist ein Freitext erforderlich."
    else:
        try:
            team_id = int(team_raw)
        except Exception:
            return "team_id ist ungültig."
        if team_id <= 0:
            return "team_id ist ungültig."
    return None


def validate_training_grid_item(data):
    day = str(data.get("day", "")).strip()
    time_from = str(data.get("time_from", "")).strip()
    time_to = str(data.get("time_to", "")).strip()
    label_override = str(data.get("label_override", "")).strip()
    team_raw = data.get("team_id")

    if day not in TRAINING_DAYS:
        return "Ungültiger Tag."
    if not re.fullmatch(r"\d{2}:\d{2}", time_from):
        return "time_from muss HH:MM sein."
    if not re.fullmatch(r"\d{2}:\d{2}", time_to):
        return "time_to muss HH:MM sein."
    if time_from >= time_to:
        return "time_to muss nach time_from liegen."
    try:
        court_number = int(data.get("court_number"))
    except Exception:
        return "court_number ist ungültig."
    if court_number < 1 or court_number > 4:
        return "court_number muss zwischen 1 und 4 liegen."
    if time_from < EVENING_START or time_to > EVENING_END:
        return "Trainingsgrid erlaubt nur Slots zwischen 18:00 und 22:00."
    if team_raw not in (None, "", 0, "0"):
        try:
            team_id = int(team_raw)
        except Exception:
            return "team_id ist ungültig."
        if team_id <= 0:
            return "team_id ist ungültig."
    elif label_override:
        return None
    return None


def save_training_grid(items):
    ensure_schema()
    conn = db_connect()
    cur = conn.cursor()

    for day in TRAINING_DAYS:
        cur.execute(
            """
            DELETE FROM training_slots
            WHERE day=? AND time_from >= ? AND time_to <= ?
            """,
            (day, EVENING_START, EVENING_END),
        )

    for item in items:
        err = validate_training_grid_item(item)
        if err:
            conn.rollback()
            conn.close()
            raise ValueError(err)

        team_raw = item.get("team_id")
        label_override = str(item.get("label_override", "")).strip()
        team_id = None
        if team_raw not in (None, "", 0, "0"):
            team_id = int(team_raw)
            label_override = ""
        elif not label_override:
            continue

        cur.execute(
            """
            INSERT INTO training_slots(day, time_from, time_to, court_number, team_id, label_override)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                str(item["day"]).strip(),
                str(item["time_from"]).strip(),
                str(item["time_to"]).strip(),
                int(item["court_number"]),
                team_id,
                label_override,
            ),
        )

    conn.commit()
    conn.close()


def run_klassierung_update() -> dict:
    if not UPDATE_KLASSIERUNG_SCRIPT.exists():
        raise RuntimeError(f"Script nicht gefunden: {UPDATE_KLASSIERUNG_SCRIPT}")
    if not SEARCH_SCRIPT.exists():
        raise RuntimeError(f"Suchscript nicht gefunden: {SEARCH_SCRIPT}")

    cmd = [
        "python3",
        str(UPDATE_KLASSIERUNG_SCRIPT),
        "--local-db",
        "--db-path",
        str(DB_PATH),
        "--search-script",
        str(SEARCH_SCRIPT),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    output = (proc.stdout or "").strip()
    if proc.stderr:
        output = f"{output}\n{proc.stderr.strip()}".strip()
    if proc.returncode != 0:
        raise RuntimeError(output or f"Script fehlgeschlagen (Exit {proc.returncode})")
    return {"ok": True, "output": output or "Keine Ausgabe"}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/health":
            return json_response(self, 200, {"ok": True})

        if path == "/api/teams":
            return json_response(self, 200, {"items": list_teams()})

        if path == "/api/players":
            return json_response(self, 200, {"items": list_players()})

        if path == "/api/ranking-changes":
            return json_response(self, 200, {"items": list_ranking_changes()})

        if path == "/api/training-slots":
            return json_response(self, 200, {"items": list_training_slots()})

        if path in ("/", "/admin", "/admin/"):
            html = (WEB_DIR / "admin.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/api/teams":
            data = read_json(self)
            err = validate_team(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            cur = conn.cursor()
            try:
                cur.execute(
                    """
                    INSERT INTO teams(gender, category, liga, teamziel, trainingstag)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        data["gender"].strip(),
                        data["category"].strip(),
                        data["liga"].strip(),
                        data["teamziel"].strip(),
                        data["trainingstag"].strip(),
                    ),
                )
                conn.commit()
            except sqlite3.IntegrityError as e:
                conn.close()
                return json_response(self, 409, {"error": f"DB-Fehler: {e}"})
            conn.close()
            return json_response(self, 201, {"ok": True})

        if path == "/api/players":
            data = read_json(self)
            err = validate_player(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            cur = conn.cursor()
            try:
                cur.execute(
                    """
                    INSERT INTO players(name, klassierung, myTennisID, team_id, captain_status)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        data["name"].strip(),
                        str(data.get("klassierung", "")).strip().upper(),
                        str(data.get("myTennisID", "")).strip(),
                        int(data["team_id"]),
                        int(data["captain_status"]),
                    ),
                )
                conn.commit()
                player_id = cur.lastrowid
            except sqlite3.IntegrityError as e:
                conn.close()
                return json_response(self, 409, {"error": f"DB-Fehler: {e}"})
            conn.close()
            # Auto-enrich on create when no URL was provided manually.
            if not str(data.get("myTennisID", "")).strip():
                enrich_player(int(player_id))
            return json_response(self, 201, {"ok": True})

        if path == "/api/actions/update-klassierung":
            try:
                return json_response(self, 200, run_klassierung_update())
            except Exception as exc:
                return json_response(self, 500, {"error": str(exc)})

        if path == "/api/training-slots":
            data = read_json(self)
            err = validate_training_slot(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            try:
                conn.execute(
                    """
                    INSERT INTO training_slots(day, time_from, time_to, court_number, team_id, label_override)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        str(data["day"]).strip(),
                        str(data["time_from"]).strip(),
                        str(data["time_to"]).strip(),
                        int(data["court_number"]),
                        int(data["team_id"]) if data.get("team_id") not in (None, "", 0, "0") else None,
                        "" if data.get("team_id") not in (None, "", 0, "0") else str(data.get("label_override", "")).strip(),
                    ),
                )
                conn.commit()
            except sqlite3.IntegrityError as e:
                conn.close()
                return json_response(self, 409, {"error": f"DB-Fehler: {e}"})
            conn.close()
            return json_response(self, 201, {"ok": True})

        if path == "/api/training-slots/bulk":
            data = read_json(self)
            items = data.get("items")
            if not isinstance(items, list):
                return json_response(self, 400, {"error": "items muss eine Liste sein."})
            try:
                save_training_grid(items)
            except ValueError as exc:
                return json_response(self, 400, {"error": str(exc)})
            except sqlite3.IntegrityError as exc:
                return json_response(self, 409, {"error": f"DB-Fehler: {exc}"})
            return json_response(self, 200, {"ok": True})

        return json_response(self, 404, {"error": "Not Found"})

    def do_PUT(self):
        path = urlparse(self.path).path

        if path.startswith("/api/teams/"):
            team_id = path.rsplit("/", 1)[-1]
            if not team_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Team-ID"})
            data = read_json(self)
            err = validate_team(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            cur = conn.cursor()
            try:
                cur.execute(
                    """
                    UPDATE teams
                    SET gender=?, category=?, liga=?, teamziel=?, trainingstag=?
                    WHERE id=?
                    """,
                    (
                        data["gender"].strip(),
                        data["category"].strip(),
                        data["liga"].strip(),
                        data["teamziel"].strip(),
                        data["trainingstag"].strip(),
                        int(team_id),
                    ),
                )
                conn.commit()
            except sqlite3.IntegrityError as e:
                conn.close()
                return json_response(self, 409, {"error": f"DB-Fehler: {e}"})
            conn.close()
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/players/"):
            player_id = path.rsplit("/", 1)[-1]
            if not player_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Spieler-ID"})
            data = read_json(self)
            err = validate_player(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            cur = conn.cursor()
            old = cur.execute("SELECT name FROM players WHERE id=?", (int(player_id),)).fetchone()
            old_name = old[0] if old else ""
            new_name = data["name"].strip()
            name_changed = old_name != new_name
            try:
                if name_changed:
                    # Name change: clear enrichment fields first, then re-enrich automatically.
                    cur.execute(
                        """
                        UPDATE players
                        SET name=?, klassierung='', myTennisID='', team_id=?, captain_status=?
                        WHERE id=?
                        """,
                        (
                            new_name,
                            int(data["team_id"]),
                            int(data["captain_status"]),
                            int(player_id),
                        ),
                    )
                else:
                    cur.execute(
                        """
                        UPDATE players
                        SET name=?, klassierung=?, myTennisID=?, team_id=?, captain_status=?
                        WHERE id=?
                        """,
                        (
                            new_name,
                            str(data.get("klassierung", "")).strip().upper(),
                            str(data.get("myTennisID", "")).strip(),
                            int(data["team_id"]),
                            int(data["captain_status"]),
                            int(player_id),
                        ),
                    )
                conn.commit()
            except sqlite3.IntegrityError as e:
                conn.close()
                return json_response(self, 409, {"error": f"DB-Fehler: {e}"})
            conn.close()
            if name_changed:
                enrich_player(int(player_id))
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/ranking-changes/"):
            change_id = path.rsplit("/", 1)[-1]
            if not change_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Änderungs-ID"})
            data = read_json(self)
            err = validate_ranking_change(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            cur = conn.cursor()
            cur.execute(
                """
                UPDATE ranking_changes
                SET player_name=?, myTennisID=?, old_klassierung=?, new_klassierung=?, changed_at=?
                WHERE id=?
                """,
                (
                    str(data.get("player_name", "")).strip(),
                    str(data.get("myTennisID", "")).strip(),
                    str(data.get("old_klassierung", "")).strip().upper(),
                    str(data.get("new_klassierung", "")).strip().upper(),
                    str(data.get("changed_at", "")).strip(),
                    int(change_id),
                ),
            )
            conn.commit()
            conn.close()
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/training-slots/"):
            slot_id = path.rsplit("/", 1)[-1]
            if not slot_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Slot-ID"})
            data = read_json(self)
            err = validate_training_slot(data)
            if err:
                return json_response(self, 400, {"error": err})

            conn = db_connect()
            try:
                conn.execute(
                    """
                    UPDATE training_slots
                    SET day=?, time_from=?, time_to=?, court_number=?, team_id=?, label_override=?
                    WHERE id=?
                    """,
                    (
                        str(data["day"]).strip(),
                        str(data["time_from"]).strip(),
                        str(data["time_to"]).strip(),
                        int(data["court_number"]),
                        int(data["team_id"]) if data.get("team_id") not in (None, "", 0, "0") else None,
                        "" if data.get("team_id") not in (None, "", 0, "0") else str(data.get("label_override", "")).strip(),
                        int(slot_id),
                    ),
                )
                conn.commit()
            except sqlite3.IntegrityError as e:
                conn.close()
                return json_response(self, 409, {"error": f"DB-Fehler: {e}"})
            conn.close()
            return json_response(self, 200, {"ok": True})

        return json_response(self, 404, {"error": "Not Found"})

    def do_DELETE(self):
        path = urlparse(self.path).path

        if path.startswith("/api/teams/"):
            team_id = path.rsplit("/", 1)[-1]
            if not team_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Team-ID"})
            conn = db_connect()
            conn.execute("DELETE FROM teams WHERE id=?", (int(team_id),))
            conn.commit()
            conn.close()
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/players/"):
            player_id = path.rsplit("/", 1)[-1]
            if not player_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Spieler-ID"})
            conn = db_connect()
            conn.execute("DELETE FROM players WHERE id=?", (int(player_id),))
            conn.commit()
            conn.close()
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/ranking-changes/"):
            change_id = path.rsplit("/", 1)[-1]
            if not change_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Änderungs-ID"})
            conn = db_connect()
            conn.execute("DELETE FROM ranking_changes WHERE id=?", (int(change_id),))
            conn.commit()
            conn.close()
            return json_response(self, 200, {"ok": True})

        if path.startswith("/api/training-slots/"):
            slot_id = path.rsplit("/", 1)[-1]
            if not slot_id.isdigit():
                return json_response(self, 400, {"error": "Ungültige Slot-ID"})
            conn = db_connect()
            conn.execute("DELETE FROM training_slots WHERE id=?", (int(slot_id),))
            conn.commit()
            conn.close()
            return json_response(self, 200, {"ok": True})

        return json_response(self, 404, {"error": "Not Found"})

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    ensure_schema()
    print(f"Admin UI on {HOST}:{PORT}, db={DB_PATH}")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.serve_forever()
