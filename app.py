#!/usr/bin/env python3
import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse

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
