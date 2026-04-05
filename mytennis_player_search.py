#!/usr/bin/env python3
"""
mytennis.ch Spielersuche
========================
Sucht Spieler über die swisstennis Microservices API.
Kein Login erforderlich!

Installation:
    Keine Zusatzpakete erforderlich

Verwendung:
    python mytennis_player_search.py
    python mytennis_player_search.py -v Stephan -n Rosin
    python mytennis_player_search.py -n Federer
"""

import argparse
import json
import sys
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------

SEARCH_URL = "https://high-scalability.microservices.swisstennis.ch/main-index-query"
PLAYER_URL = "https://www.mytennis.ch/de/spieler/{player_id}"

HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://www.mytennis.ch",
    "Referer": "https://www.mytennis.ch/",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
}


# ---------------------------------------------------------------------------
# Suche
# ---------------------------------------------------------------------------

def search_players(vorname: str = "", nachname: str = "", limit: int = 5) -> list[dict]:
    keyword = f"{vorname} {nachname}".strip()

    payload = {
        "keyword": keyword,
        "offset": 0,
        "limit": limit,
    }

    req = Request(
        SEARCH_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers=HEADERS,
        method="POST",
    )

    try:
        with urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
    except Exception as e:
        print(f"❌ API-Fehler: {e}")
        sys.exit(1)

    hits = json.loads(body).get("hits", {}).get("hits", [])

    players = []
    for hit in hits:
        src = hit.get("_source", {})

        if src.get("type") != "player":
            continue
        print(hit)
        players.append({
            "id":             str(src.get("rawId", "")),
            "name":           src.get("title", "–"),
            "club":	      src.get("club", ""),
            "classification": src.get("classification", ""),   # z.B. "Aktive"
            "license":        str(src.get("number", "")),       # Lizenznummer
            "url":            PLAYER_URL.format(player_id=src.get("rawId", "")),
        })

    return players


# ---------------------------------------------------------------------------
# Ausgabe
# ---------------------------------------------------------------------------

def print_results(players: list[dict], keyword: str):
    print(f"\n🔍 Ergebnis für: {keyword}")
    print("=" * 60)

    if not players:
        print("❌  Keine Spieler gefunden.")
        print("    Tipp: Nur Nachname verwenden (z.B. -n Rosin)")
        return

    print(f"✅  {len(players)} Spieler gefunden:\n")
    for i, p in enumerate(players, 1):
        print(f"  [{i}] {p['name']}")
        if p["classification"]: print(f"       Kategorie: {p['classification']}")
        if p["license"]:        print(f"       Lizenz:    {p['license']}")
        if p["club"]:           print(f"       Club:    {p['club']}")

        print(f"       🔗 URL:     {p['url']}\n")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="mytennis.ch Spieler-Link-Finder (kein Login nötig)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--vorname",  "-v", default="", help="Vorname")
    parser.add_argument("--nachname", "-n", default="", help="Nachname")
    parser.add_argument("--limit",    "-l", type=int, default=50,
                        help="Max. Anzahl Ergebnisse (default: 50)")
    args = parser.parse_args()

    vorname  = args.vorname  or input("Vorname (leer lassen = egal): ").strip()
    nachname = args.nachname or input("Nachname: ").strip()

    if not vorname and not nachname:
        print("❌ Mindestens Vor- oder Nachname angeben.")
        sys.exit(1)

    players = search_players(vorname, nachname, limit=args.limit)
    print_results(players, f"{vorname} {nachname}".strip())


if __name__ == "__main__":
    main()
