#!/usr/bin/env python3
import json
import os
import re
import sqlite3
import unicodedata
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR
DB_PATH = Path(os.environ.get("IC_DB_PATH", str(BASE_DIR / "ic_teams.sqlite")))
HOST = os.environ.get("IC_ADMIN_HOST", "0.0.0.0")
PORT = int(os.environ.get("IC_ADMIN_PORT", "8081"))

SEARCH_URL = "https://high-scalability.microservices.swisstennis.ch/main-index-query"
PLAYER_URL = "https://www.mytennis.ch/de/spieler/{player_id}"
SEARCH_HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://www.mytennis.ch",
    "Referer": "https://www.mytennis.ch/",
    "User-Agent": "Mozilla/5.0",
}


def db_connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


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


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/health":
            return json_response(self, 200, {"ok": True})

        if path == "/api/teams":
            return json_response(self, 200, {"items": list_teams()})

        if path == "/api/players":
            return json_response(self, 200, {"items": list_players()})

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

        return json_response(self, 404, {"error": "Not Found"})

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    print(f"Admin UI on {HOST}:{PORT}, db={DB_PATH}")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.serve_forever()
