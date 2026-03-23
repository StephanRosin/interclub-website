#!/usr/bin/env python3
import argparse
import importlib.util
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path


def load_search_module(path: Path):
    spec = importlib.util.spec_from_file_location("mytennis_player_search", str(path))
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Kann Suchscript nicht laden: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if not hasattr(module, "search_players"):
        raise RuntimeError("Suchscript enthält keine Funktion 'search_players'")
    return module


def ssh_python(host: str, script: str, args: list[str]) -> str:
    cmd = ["ssh", "-F", "/dev/null", host, "python3", "-"] + args
    proc = subprocess.run(cmd, input=script, text=True, capture_output=True)
    if proc.returncode != 0:
        raise RuntimeError(f"SSH/Python Fehler:\nSTDOUT:\n{proc.stdout}\nSTDERR:\n{proc.stderr}")
    return proc.stdout


def fetch_players_without_id(host: str, db_path: str, limit: int):
    script = r'''
import json, sqlite3, sys

db_path = sys.argv[1]
limit = int(sys.argv[2])
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
rows = cur.execute(
    """
    SELECT id, name
    FROM players
    WHERE trim(coalesce(myTennisID, '')) = ''
    ORDER BY id
    LIMIT ?
    """,
    (limit,)
).fetchall()
conn.close()
print(json.dumps([{"id": r["id"], "name": r["name"]} for r in rows], ensure_ascii=False))
'''
    out = ssh_python(host, script, [db_path, str(limit)])
    return json.loads(out)


def update_player(host: str, db_path: str, player_id: int, klassierung: str, url: str):
    script = r'''
import sqlite3, sys

db_path = sys.argv[1]
player_id = int(sys.argv[2])
klassierung = sys.argv[3]
url = sys.argv[4]

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute(
    "UPDATE players SET klassierung=?, myTennisID=? WHERE id=?",
    (klassierung, url, player_id),
)
conn.commit()
conn.close()
print("ok")
'''
    ssh_python(host, script, [db_path, str(player_id), klassierung, url])


def split_name_parts(full_name: str):
    parts = [p for p in str(full_name).strip().split() if p]
    if len(parts) < 2:
        return None
    return parts


def normalize_for_search(value: str) -> str:
    value = str(value or "").strip()
    norm = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in norm if not unicodedata.combining(ch))


def normalize_key(value: str) -> str:
    return normalize_for_search(value).casefold().strip()


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

        # lower tuple = better match
        exact_full = 0 if key == target else 1
        exact_first_last_only = 0 if (first == target_first and last_only == target_last_only) else 1
        exact_first_rest = 0 if (first == target_first and last == target_rest) else 1
        same_last = 0 if (last_only and last_only == target_last_only) else 1
        same_first = 0 if (first and first == target_first) else 1
        return (exact_full, exact_first_last_only, exact_first_rest, same_last, same_first)

    return sorted(hits, key=score)[0]


def build_queries(name_parts: list[str]):
    first = name_parts[0]
    last_only = name_parts[-1]
    rest = " ".join(name_parts[1:])

    # Priority order: first+last-only (e.g. Laura Sîrbu), then full remainder.
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


def main():
    p = argparse.ArgumentParser(description="Füllt myTennisID + klassierung aus Suchscript in Remote-SQLite")
    p.add_argument("--ssh-host", default="truenas_admin@192.168.178.94")
    p.add_argument("--db-path", default="/mnt/apps/interclub-website/ic_teams.sqlite")
    p.add_argument("--search-script", default="/home/stephan/Downloads/mytennis_player_search.py")
    p.add_argument("--limit", type=int, default=3)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    search_script = Path(args.search_script)
    if not search_script.exists():
        raise SystemExit(f"Suchscript nicht gefunden: {search_script}")

    search_mod = load_search_module(search_script)
    players = fetch_players_without_id(args.ssh_host, args.db_path, args.limit)

    if not players:
        print("Keine Spieler ohne myTennisID gefunden.")
        return

    print(f"Bearbeite {len(players)} Spieler (Limit={args.limit})")

    updated = 0
    skipped = 0

    for entry in players:
        pid = entry["id"]
        name = entry["name"]
        parts = split_name_parts(name)

        if not parts:
            print(f"- [{pid}] {name}: übersprungen (Name nicht aufteilbar)")
            skipped += 1
            continue

        try:
            # Query both original and normalized spelling, then choose best name match.
            hits = []
            seen_urls = set()
            queries = build_queries(parts)

            for qv, qn in queries:
                q_hits = search_mod.search_players(vorname=qv, nachname=qn, limit=50)
                for h in q_hits:
                    url_key = str(h.get("url") or h.get("URL") or "")
                    if url_key in seen_urls:
                        continue
                    seen_urls.add(url_key)
                    hits.append(h)
        except Exception as exc:
            print(f"- [{pid}] {name}: Suche fehlgeschlagen: {exc}")
            skipped += 1
            continue

        if not hits:
            print(f"- [{pid}] {name}: kein Treffer")
            skipped += 1
            continue

        best = choose_best_hit(name, hits)
        if not best:
            print(f"- [{pid}] {name}: kein brauchbarer Treffer")
            skipped += 1
            continue
        klass = str(best.get("classification") or best.get("Kategorie") or "").strip().upper()
        url = str(best.get("url") or best.get("URL") or "").strip()

        if not url:
            print(f"- [{pid}] {name}: erster Treffer ohne URL")
            skipped += 1
            continue

        if args.dry_run:
            print(f"- [{pid}] {name} -> klassierung='{klass}', myTennisID='{url}' (dry-run)")
            updated += 1
            continue

        update_player(args.ssh_host, args.db_path, pid, klass, url)
        print(f"- [{pid}] {name} -> klassierung='{klass}', myTennisID='{url}'")
        updated += 1

    print(f"Fertig. Aktualisiert: {updated}, Übersprungen: {skipped}")


if __name__ == "__main__":
    main()
