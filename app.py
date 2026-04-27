#!/usr/bin/env python3
import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen

BASE_DIR = Path(__file__).resolve().parent
WEB_DIR = BASE_DIR / "public"
DB_PATH = Path(os.environ.get("IC_DB_PATH", str(BASE_DIR / "ic_teams.sqlite")))
HOST = os.environ.get("IC_HOST", "0.0.0.0")
PORT = int(os.environ.get("IC_PORT", "8080"))
ALLOWED_STATIC_FILES = {
    "app.js",
    "index.html",
    "bg-home.jpg",
    "favicon.ico",
    "favicon.png",
    "fonts/manrope-400.ttf",
    "fonts/manrope-500.ttf",
    "fonts/manrope-700.ttf",
    "fonts/manrope-800.ttf",
    "logo-tcw.png",
    "matches.json",
    "style.css",
}
ENTRY_PAGE_URL = "https://comp.swisstennis.ch/ic{year_suffix}/servlet/EntryPage?ClubName=1298&outputFormat=JSON"
TEAM_RESULTS_URL = "https://comp.swisstennis.ch/ic{year_suffix}/servlet/TeamResults?TeamId={team_id}&Lang=de&outputFormat=JSON"
ENCOUNT_RESULTS_URL = "https://comp.swisstennis.ch/ic{year_suffix}/servlet/EncountResults?EncountId={encount_id}&Lang=de&outputFormat=JSON"
WAIDCUP_DB_CANDIDATES = [
    Path(os.environ.get("WAIDCUP_DB_PATH", "")).expanduser() if os.environ.get("WAIDCUP_DB_PATH") else None,
    Path("/home/stephan/Dokumente/Waidcup/data/tcw_tasks.db"),
    Path("/mnt/Appspool/apps/waidcup/data/tcw_tasks.db"),
]
WAIDCUP_PUBLIC_API_URL = os.environ.get(
    "WAIDCUP_PUBLIC_API_URL",
    "http://192.168.178.94:3101/public-api/tournament-registrations",
)


def content_type(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".html":
        return "text/html; charset=utf-8"
    if ext == ".css":
        return "text/css; charset=utf-8"
    if ext == ".js":
        return "application/javascript; charset=utf-8"
    if ext == ".json":
        return "application/json; charset=utf-8"
    if ext == ".svg":
        return "image/svg+xml"
    if ext == ".png":
        return "image/png"
    if ext in (".jpg", ".jpeg"):
        return "image/jpeg"
    if ext == ".ico":
        return "image/x-icon"
    if ext == ".txt":
        return "text/plain; charset=utf-8"
    if ext == ".ttf":
        return "font/ttf"
    return "application/octet-stream"


def current_year_str() -> str:
    return str(datetime.now().year)


def normalized_year(year: str | None) -> str:
    value = str(year or "").strip()
    return value if value.isdigit() and len(value) == 4 else current_year_str()


def year_suffix(year: str | None) -> str:
    value = normalized_year(year)
    return "" if value == current_year_str() else value


def load_teams() -> dict:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    team_rows = cur.execute(
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

    players_by_team = {}
    player_rows = cur.execute(
        """
        SELECT id, team_id, name, klassierung, myTennisID, captain_status
        FROM players
        """
    ).fetchall()

    for row in player_rows:
        players_by_team.setdefault(row["team_id"], []).append(
            {
                "id": row["id"],
                "name": row["name"],
                "klassierung": row["klassierung"] or "",
                "myTennisID": row["myTennisID"] or "",
                "captain_status": int(row["captain_status"]),
            }
        )

    conn.close()

    def ranking_order(value: str):
        s = (value or "").strip().upper()
        if not s:
            return (9, 999)
        if s.startswith("N") and s[1:].isdigit():
            return (0, int(s[1:]))
        if s.startswith("R") and s[1:].isdigit():
            return (1, int(s[1:]))
        return (8, 999)

    def player_key(p):
        captain_rank = {1: 0, 2: 1, 0: 2}.get(p["captain_status"], 3)
        klass_rank = ranking_order(p.get("klassierung", ""))
        return (captain_rank, klass_rank, p["name"].casefold())

    out = {"damen": [], "herren": []}

    for t in team_rows:
        gender_key = "damen" if t["gender"] == "Damen" else "herren"
        title = f"{t['gender']} {t['category']} {t['liga']}".strip()
        players = sorted(players_by_team.get(t["id"], []), key=player_key)

        out[gender_key].append(
            {
                "id": t["id"],
                "title": title,
                "gender": t["gender"],
                "category": t["category"],
                "liga": t["liga"],
                "teamziel": t["teamziel"],
                "trainingstag": t["trainingstag"],
                "players": players,
            }
        )

    return out


def load_ranking_changes() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    table_exists = cur.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='ranking_changes'"
    ).fetchone()
    if not table_exists:
        conn.close()
        return []

    rows = cur.execute(
        """
        SELECT id, player_id, player_name, myTennisID, old_klassierung, new_klassierung, changed_at
        FROM ranking_changes
        """
    ).fetchall()
    conn.close()

    def ranking_order(value: str) -> tuple[int, int]:
        s = (value or "").strip().upper()
        if not s:
            return (9, 999)
        if s.startswith("N") and s[1:].isdigit():
            return (0, int(s[1:]))
        if s.startswith("R") and s[1:].isdigit():
            return (1, int(s[1:]))
        return (8, 999)

    def month_key(value: str) -> str:
        raw = (value or "").strip()
        if not raw:
            return ""
        normalized = raw.replace("T", " ")
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                return datetime.strptime(normalized, fmt).strftime("%Y-%m")
            except ValueError:
                continue
        return normalized.split(" ", 1)[0][:7]

    items = [
        {
            "id": row["id"],
            "player_id": row["player_id"],
            "player_name": row["player_name"],
            "myTennisID": row["myTennisID"] or "",
            "old_klassierung": row["old_klassierung"] or "",
            "new_klassierung": row["new_klassierung"] or "",
            "changed_at": row["changed_at"] or "",
        }
        for row in rows
    ]

    items.sort(key=lambda item: item["player_name"].casefold())
    items.sort(key=lambda item: ranking_order(item["new_klassierung"]))
    items.sort(key=lambda item: month_key(item["changed_at"]), reverse=True)
    return items


def split_ic_liga_name(value: str) -> tuple[str, str, str]:
    label = str(value or "").strip()
    if not label:
        return ("", "", "")
    if label.endswith(" Damen"):
        return ("Damen", label[: -len(" Damen")].strip(), label)
    if label.endswith(" Herren"):
        return ("Herren", label[: -len(" Herren")].strip(), label)
    return ("", label, label)


def ic_sort_key(label: str) -> tuple[int, int, int, str]:
    gender, prefix, full = split_ic_liga_name(label)
    gender_rank = 0 if gender == "Damen" else 1 if gender == "Herren" else 9

    upper_prefix = prefix.upper()
    liga_rank = 99
    if "NLC" in upper_prefix:
        liga_rank = 0
    elif "1L" in upper_prefix:
        liga_rank = 1
    elif "2L" in upper_prefix:
        liga_rank = 2
    elif "3L" in upper_prefix:
        liga_rank = 3
    elif "NLB" in upper_prefix:
        liga_rank = 4
    elif "NLA" in upper_prefix:
        liga_rank = 5

    age_rank = 0
    if prefix and not prefix[0].isdigit():
        age_rank = 0
    else:
        digits = "".join(ch for ch in prefix if ch.isdigit())
        age_rank = int(digits) if digits else 0

    return (gender_rank, liga_rank, age_rank, full.casefold())


def load_ic_teams(year: str | None = None) -> list[dict]:
    req = Request(
        ENTRY_PAGE_URL.format(year_suffix=year_suffix(year)),
        headers={
            "User-Agent": "TCW-Interclub/1.0",
            "Accept": "application/json",
        },
    )
    with urlopen(req, timeout=20) as response:
        raw = response.read()
    payload = json.loads(raw.decode("utf-8"))
    raw_teams = payload.get("I2cm", {}).get("Mitglied", {}).get("icTeamSet", {}).get("IcTeam", [])
    teams = raw_teams if isinstance(raw_teams, list) else ([raw_teams] if raw_teams else [])

    items = []
    for item in teams:
        liga = item.get("icLigue", {}).get("IcLigue", {}).get("lgName", "").strip() or "–"
        group_number = item.get("icTeamPoolSet", {}).get("IcTeamPool", {}).get("icPool", {}).get("IcPool", {}).get("poolName2")
        gender, prefix, _ = split_ic_liga_name(liga)
        items.append(
            {
                "teamId": int(item.get("teamId") or 0),
                "liga": liga,
                "label": liga,
                "gender": gender,
                "prefix": prefix,
                "group": str(group_number) if group_number not in (None, "") else "",
            }
        )

    return sorted([item for item in items if item["teamId"] > 0], key=lambda item: ic_sort_key(item["liga"]))


def load_team_results(team_id: int, year: str | None = None) -> dict:
    if team_id <= 0:
        raise ValueError("Invalid TeamId")

    req = Request(
        TEAM_RESULTS_URL.format(team_id=team_id, year_suffix=year_suffix(year)),
        headers={
            "User-Agent": "TCW-Interclub/1.0",
            "Accept": "application/json",
        },
    )
    with urlopen(req, timeout=20) as response:
        raw = response.read()
    return json.loads(raw.decode("utf-8"))


def load_encount_results(encount_id: int, year: str | None = None) -> dict:
    if encount_id <= 0:
        raise ValueError("Invalid EncountId")

    req = Request(
        ENCOUNT_RESULTS_URL.format(encount_id=encount_id, year_suffix=year_suffix(year)),
        headers={
            "User-Agent": "TCW-Interclub/1.0",
            "Accept": "application/json",
        },
    )
    with urlopen(req, timeout=20) as response:
        raw = response.read()
    return json.loads(raw.decode("utf-8"))


def find_waidcup_db_path() -> Path | None:
    for candidate in WAIDCUP_DB_CANDIDATES:
        if candidate and candidate.is_file():
            return candidate
    return None


def read_waidcup_registrations_from_db(db_path: Path) -> list[dict]:
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    events = cur.execute(
        """
        SELECT e.event_id, e.event_name, e.source_descr, e.updated_at, c.sort_order
        FROM tournament_registration_events e
        LEFT JOIN tournament_registration_event_config c ON c.event_id = e.event_id
        ORDER BY COALESCE(c.sort_order, 999), e.event_id
        """
    ).fetchall()

    players = cur.execute(
        """
        SELECT event_id, player_key, player_name, player_name_2, player_url, player_url_2,
               confirmed, ranking, ranking_2, registered_on, note, sort_order
        FROM tournament_registration_players
        ORDER BY event_id ASC, sort_order ASC, player_name COLLATE NOCASE ASC
        """
    ).fetchall()
    conn.close()

    players_by_event_id: dict[int, list[dict]] = {}
    for row in players:
        players_by_event_id.setdefault(row["event_id"], []).append(
            {
                "player_key": row["player_key"],
                "player_name": row["player_name"],
                "player_name_2": row["player_name_2"] or "",
                "player_url": row["player_url"] or "",
                "player_url_2": row["player_url_2"] or "",
                "confirmed": 1 if int(row["confirmed"] or 0) == 1 else 0,
                "ranking": row["ranking"] or "",
                "ranking_2": row["ranking_2"] or "",
                "registered_on": row["registered_on"] or "",
                "note": row["note"] or "",
                "sort_order": int(row["sort_order"] or 0),
            }
        )

    return [
        {
            "event_id": row["event_id"],
            "event_name": row["event_name"],
            "source_descr": row["source_descr"] or "",
            "updated_at": row["updated_at"],
            "players": players_by_event_id.get(row["event_id"], []),
        }
        for row in events
    ]


def load_waidcup_registrations() -> dict:
    db_path = find_waidcup_db_path()
    if db_path:
        return {
            "source": "db",
            "events": read_waidcup_registrations_from_db(db_path),
        }

    req = Request(
        WAIDCUP_PUBLIC_API_URL,
        headers={
            "User-Agent": "TCW-Interclub/1.0",
            "Accept": "application/json",
        },
    )
    with urlopen(req, timeout=20) as response:
        raw = response.read()
    payload = json.loads(raw.decode("utf-8"))
    return {
        "source": "api",
        "events": payload.get("events", []),
    }


class Handler(BaseHTTPRequestHandler):
    def _send(self, status: int, body: bytes, ctype: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/health":
            self._send(200, b'{"ok":true}', "application/json; charset=utf-8")
            return

        if path == "/api/teams":
            try:
                payload = json.dumps(load_teams(), ensure_ascii=False).encode("utf-8")
                self._send(200, payload, "application/json; charset=utf-8")
            except Exception as exc:
                print(f"/api/teams failed: {exc}")
                payload = json.dumps({"error": "Interner Serverfehler"}).encode("utf-8")
                self._send(500, payload, "application/json; charset=utf-8")
            return

        if path == "/api/ranking-changes":
            try:
                payload = json.dumps({"items": load_ranking_changes()}, ensure_ascii=False).encode("utf-8")
                self._send(200, payload, "application/json; charset=utf-8")
            except Exception as exc:
                print(f"/api/ranking-changes failed: {exc}")
                payload = json.dumps({"error": "Interner Serverfehler"}).encode("utf-8")
                self._send(500, payload, "application/json; charset=utf-8")
            return

        if path == "/api/waidcup-registrations":
            try:
                payload = json.dumps(load_waidcup_registrations(), ensure_ascii=False).encode("utf-8")
                self._send(200, payload, "application/json; charset=utf-8")
            except Exception as exc:
                print(f"/api/waidcup-registrations failed: {exc}")
                payload = json.dumps({"error": "Interner Serverfehler"}).encode("utf-8")
                self._send(500, payload, "application/json; charset=utf-8")
            return

        if path == "/api/ic/teams":
            try:
                year = query.get("year", [None])[0]
                payload = json.dumps({"items": load_ic_teams(year)}, ensure_ascii=False).encode("utf-8")
                self._send(200, payload, "application/json; charset=utf-8")
            except Exception as exc:
                print(f"{path} failed: {exc}")
                payload = json.dumps({"error": "Interner Serverfehler"}).encode("utf-8")
                self._send(500, payload, "application/json; charset=utf-8")
            return

        if path.startswith("/api/ic/team/"):
            try:
                team_id = int(path.rsplit("/", 1)[-1])
                year = query.get("year", [None])[0]
                payload = json.dumps(load_team_results(team_id, year), ensure_ascii=False).encode("utf-8")
                self._send(200, payload, "application/json; charset=utf-8")
            except Exception as exc:
                print(f"{path} failed: {exc}")
                payload = json.dumps({"error": "Interner Serverfehler"}).encode("utf-8")
                self._send(500, payload, "application/json; charset=utf-8")
            return

        if path.startswith("/api/ic/encount/"):
            try:
                encount_id = int(path.rsplit("/", 1)[-1])
                year = query.get("year", [None])[0]
                payload = json.dumps(load_encount_results(encount_id, year), ensure_ascii=False).encode("utf-8")
                self._send(200, payload, "application/json; charset=utf-8")
            except Exception as exc:
                print(f"{path} failed: {exc}")
                payload = json.dumps({"error": "Interner Serverfehler"}).encode("utf-8")
                self._send(500, payload, "application/json; charset=utf-8")
            return

        if path == "/":
            rel = "index.html"
        else:
            rel = path.lstrip("/")

        if rel not in ALLOWED_STATIC_FILES:
            self._send(404, b"Not Found", "text/plain; charset=utf-8")
            return

        target = (WEB_DIR / rel).resolve()

        try:
            target.relative_to(WEB_DIR.resolve())
        except Exception:
            self._send(403, b"Forbidden", "text/plain; charset=utf-8")
            return

        if not target.exists() or not target.is_file():
            self._send(404, b"Not Found", "text/plain; charset=utf-8")
            return

        self._send(200, target.read_bytes(), content_type(target))

    def log_message(self, fmt, *args):
        return


if __name__ == "__main__":
    print(f"Serving on {HOST}:{PORT}, db={DB_PATH}")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.serve_forever()
