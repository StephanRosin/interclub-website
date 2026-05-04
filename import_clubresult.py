#!/usr/bin/env python3
import argparse
import json
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DEFAULT_OUTPUT = PUBLIC_DIR / "matches.json"
CLUB_ID = 1298
MONTHS_DE = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
]


def current_year_str() -> str:
    return str(datetime.now().year)


def normalized_year(year: str | None) -> str:
    value = str(year or "").strip()
    return value if value.isdigit() and len(value) == 4 else current_year_str()


def year_suffix(year: str | None) -> str:
    value = normalized_year(year)
    return "" if value == current_year_str() else value


def club_result_url(year: str | None) -> str:
    return (
        f"https://comp.swisstennis.ch/ic{year_suffix(year)}/servlet/ClubResult"
        f"?ClubName={CLUB_ID}&Lang=de&outputFormat=JSON"
    )


def fetch_json(year: str | None) -> dict:
    req = Request(
        club_result_url(year),
        headers={
            "User-Agent": "TCW-Interclub/1.0",
            "Accept": "application/json",
        },
    )
    with urlopen(req, timeout=20) as response:
        raw = response.read()
    return json.loads(raw.decode("utf-8"))


def clean_text(value: str | None) -> str:
    return " ".join(str(value or "").replace("\xa0", " ").split())


def format_updated_at(today: dict | None, fallback_year: str) -> str:
    today = today or {}
    day = today.get("day")
    month = today.get("month")
    year = today.get("year") or fallback_year
    if not isinstance(day, int) or not isinstance(month, int) or not 0 <= month < 12:
        return ""
    return f"{day}. {MONTHS_DE[month]} {year}"


def format_date(schedule: dict | None) -> str:
    schedule = schedule or {}
    day = schedule.get("Day")
    month = schedule.get("Month")
    if not isinstance(day, int) or not isinstance(month, int) or not 0 <= month < 12:
        return ""
    return f"{day} {MONTHS_DE[month]}"


def format_time(schedule: dict | None) -> str:
    schedule = schedule or {}
    hour = schedule.get("Hour")
    minute = schedule.get("Minute")
    if not isinstance(hour, int) or not isinstance(minute, int):
        return ""
    return f"{hour:02d}:{minute:02d}"


def format_result(item: dict) -> str:
    validated = int(item.get("validated") or 0) == 1
    if not validated:
        return "–:–"
    text = clean_text(item.get("Result", {}).get("Text"))
    return text.replace(" : ", ":") if text else "–:–"


def parse_matches(payload: dict, year: str) -> tuple[list[dict], str]:
    encounts = payload.get("I2cm", {}).get("Encounts", {}).get("Encount", [])
    encounts = encounts if isinstance(encounts, list) else ([encounts] if encounts else [])

    matches = []
    for item in encounts:
        schedule = item.get("Schedule", {}) or {}
        matches.append(
            {
                "date": format_date(schedule),
                "time": format_time(schedule),
                "liga": clean_text(item.get("Ligue", {}).get("Text")),
                "runde": str(item.get("nbRound") or ""),
                "home": clean_text(item.get("HomeTeam", {}).get("content")),
                "away": clean_text(item.get("VisitTeam", {}).get("content")),
                "result": format_result(item),
                "encountId": int(item.get("id") or 0),
                "validated": 1 if int(item.get("validated") or 0) == 1 else 0,
                "year": year,
                "home_is_own": 1 if bool(item.get("home")) else 0,
                "_sort": (
                    int(schedule.get("Month") or 99),
                    int(schedule.get("Day") or 99),
                    int(schedule.get("Hour") or 99),
                    int(schedule.get("Minute") or 99),
                    int(item.get("nbRound") or 99),
                ),
            }
        )

    matches.sort(key=lambda row: row["_sort"])
    for row in matches:
        row.pop("_sort", None)

    updated_at = format_updated_at(payload.get("I2cm", {}).get("Today"), year)
    return matches, updated_at


def build_payload(year: str) -> dict:
    payload = fetch_json(year)
    matches, updated_at = parse_matches(payload, year)
    if not matches:
        raise RuntimeError("Keine Spieltermine über die SwissTennis-API gefunden.")
    return {
        "source": "clubresult-json",
        "club_id": CLUB_ID,
        "year": year,
        "updated_at": updated_at,
        "matches": matches,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Importiert SwissTennis ClubResult-JSON und erzeugt matches.json.")
    parser.add_argument("--year", default=current_year_str(), help="Jahr der Interclub-Saison, z.B. 2026")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Zielpfad für matches.json")
    args = parser.parse_args()

    year = normalized_year(args.year)
    output_path = Path(args.output).expanduser()
    payload = build_payload(year)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"API: {club_result_url(year)}")
    print(f"JSON: {output_path}")
    print(f"Jahr: {year}")
    print(f"Stand: {payload.get('updated_at') or '-'}")
    print(f"Einträge: {len(payload['matches'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
