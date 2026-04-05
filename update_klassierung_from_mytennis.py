#!/usr/bin/env python3
import argparse
import importlib.util
import json
import re
import subprocess
import unicodedata
from pathlib import Path


def load_search_module(path: Path):
    spec = importlib.util.spec_from_file_location("mytennis_player_search", str(path))
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Kann Suchscript nicht laden: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if not hasattr(module, "search_players"):
        raise RuntimeError("Suchscript enthaelt keine Funktion 'search_players'")
    return module


def ssh_python(host: str, script: str, args: list[str]) -> str:
    cmd = ["ssh", "-F", "/dev/null", host, "python3", "-"] + args
    proc = subprocess.run(cmd, input=script, text=True, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(f"SSH/Python Fehler:\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}")
    return proc.stdout


def local_python(script: str, args: list[str]) -> str:
    proc = subprocess.run(
        ["python3", "-", *args],
        input=script,
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Lokaler Python Fehler:\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}")
    return proc.stdout


def run_db_python(host: str | None, script: str, args: list[str]) -> str:
    if host:
        return ssh_python(host, script, args)
    return local_python(script, args)


def ensure_history_table(host: str | None, db_path: str):
    script = r'''
import sqlite3, sys

db_path = sys.argv[1]
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute(
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
conn.commit()
conn.close()
print("ok")
'''
    run_db_python(host, script, [db_path])


def fetch_players_with_id(host: str, db_path: str, limit: int | None):
    script = r'''
import json, sqlite3, sys

db_path = sys.argv[1]
limit = int(sys.argv[2])
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

query = """
    SELECT id, name, myTennisID, klassierung
    FROM players
    WHERE trim(coalesce(myTennisID, '')) <> ''
    ORDER BY id
"""
params = []
if limit > 0:
    query += "\nLIMIT ?"
    params.append(limit)

rows = cur.execute(query, params).fetchall()
conn.close()
print(json.dumps([
    {
        "id": r["id"],
        "name": r["name"],
        "myTennisID": r["myTennisID"],
        "klassierung": r["klassierung"] or "",
    }
    for r in rows
], ensure_ascii=False))
'''
    out = run_db_python(host, script, [db_path, str(limit or 0)])
    return json.loads(out)


def update_klassierung(
    host: str | None,
    db_path: str,
    player_id: int,
    player_name: str,
    mytennis_url: str,
    old_klassierung: str,
    new_klassierung: str,
):
    script = r'''
import sqlite3, sys

db_path = sys.argv[1]
player_id = int(sys.argv[2])
player_name = sys.argv[3]
mytennis_url = sys.argv[4]
old_klassierung = sys.argv[5]
new_klassierung = sys.argv[6]

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute(
    "UPDATE players SET klassierung=? WHERE id=?",
    (new_klassierung, player_id),
)
cur.execute(
    """
    INSERT INTO ranking_changes(player_id, player_name, myTennisID, old_klassierung, new_klassierung)
    VALUES (?, ?, ?, ?, ?)
    """,
    (player_id, player_name, mytennis_url, old_klassierung, new_klassierung),
)
conn.commit()
conn.close()
print("ok")
'''
    run_db_python(
        host,
        script,
        [db_path, str(player_id), player_name, mytennis_url, old_klassierung, new_klassierung],
    )


def split_name_parts(full_name: str):
    parts = [p for p in str(full_name).strip().split() if p]
    if len(parts) < 2:
        return None
    return parts


def normalize_for_search(value: str) -> str:
    value = str(value or "").strip()
    norm = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in norm if not unicodedata.combining(ch))


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
    for vorname, nachname in raw:
        for qv, qn in (
            (vorname, nachname),
            (normalize_for_search(vorname), normalize_for_search(nachname)),
        ):
            key = (qv, qn)
            if key in seen:
                continue
            seen.add(key)
            queries.append(key)
    return queries


def normalize_url(value: str) -> str:
    return str(value or "").strip().rstrip("/")


def find_hit_by_url(hits: list[dict], expected_url: str):
    target = normalize_url(expected_url)
    for hit in hits:
        hit_url = normalize_url(hit.get("url") or hit.get("URL") or "")
        if hit_url and hit_url == target:
            return hit
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Aktualisiert Klassierungen ueber MyTennis, wenn die gefundene URL zur gespeicherten myTennisID passt."
    )
    parser.add_argument("--ssh-host", default="truenas_admin@192.168.178.94")
    parser.add_argument("--local-db", action="store_true", help="DB lokal statt ueber SSH aktualisieren")
    parser.add_argument("--db-path", default="/mnt/apps/interclub-website/ic_teams.sqlite")
    parser.add_argument("--search-script", default="/home/stephan/Downloads/mytennis_player_search.py")
    parser.add_argument("--limit", type=int, default=0, help="0 = alle Spieler mit myTennisID")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    search_script = Path(args.search_script)
    if not search_script.exists():
        raise SystemExit(f"Suchscript nicht gefunden: {search_script}")

    search_mod = load_search_module(search_script)
    db_host = None if args.local_db else args.ssh_host
    ensure_history_table(db_host, args.db_path)
    players = fetch_players_with_id(db_host, args.db_path, args.limit if args.limit > 0 else None)

    if not players:
        print("Keine Spieler mit myTennisID gefunden.")
        return

    print(f"Bearbeite {len(players)} Spieler")

    updated = 0
    skipped = 0
    unchanged = 0

    for entry in players:
        player_id = entry["id"]
        name = entry["name"]
        current_url = str(entry.get("myTennisID") or "").strip()
        current_rank = str(entry.get("klassierung") or "").strip().upper()
        parts = split_name_parts(name)

        if not parts:
            print(f"- [{player_id}] {name}: uebersprungen (Name nicht aufteilbar)")
            skipped += 1
            continue

        hits = []
        seen_urls = set()

        try:
            for vorname, nachname in build_queries(parts):
                query_hits = search_mod.search_players(vorname=vorname, nachname=nachname, limit=50)
                for hit in query_hits:
                    url_key = normalize_url(hit.get("url") or hit.get("URL") or "")
                    if not url_key or url_key in seen_urls:
                        continue
                    seen_urls.add(url_key)
                    hits.append(hit)
        except Exception as exc:
            print(f"- [{player_id}] {name}: Suche fehlgeschlagen: {exc}")
            skipped += 1
            continue

        if not hits:
            print(f"- [{player_id}] {name}: kein Treffer")
            skipped += 1
            continue

        match = find_hit_by_url(hits, current_url)
        if not match:
            print(f"- [{player_id}] {name}: keine URL-Uebereinstimmung fuer {current_url}")
            skipped += 1
            continue

        new_rank = str(match.get("classification") or match.get("Kategorie") or "").strip().upper()
        if not new_rank:
            print(f"- [{player_id}] {name}: Treffer ohne Klassierung")
            skipped += 1
            continue

        if new_rank == current_rank:
            unchanged += 1
            continue

        if args.dry_run:
            print(f"- [{player_id}] {name}: {current_rank or '-'} -> {new_rank} (dry-run)")
            updated += 1
            continue

        update_klassierung(
            db_host,
            args.db_path,
            player_id,
            name,
            current_url,
            current_rank,
            new_rank,
        )
        print(f"- [{player_id}] {name}: {current_rank or '-'} -> {new_rank}")
        updated += 1

    print(f"Fertig. Aktualisiert: {updated}, Unveraendert: {unchanged}, Uebersprungen: {skipped}")


if __name__ == "__main__":
    main()
