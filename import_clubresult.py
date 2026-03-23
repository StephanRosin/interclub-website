#!/usr/bin/env python3
import json
import re
import subprocess
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DEFAULT_OUTPUT = PUBLIC_DIR / "matches.json"

LINE_RE = re.compile(
    r"^(?P<prefix>.*?\S)\s{2,}(?P<runde>\d+)\s+(?P<home>.+?)\s{2,}(?P<away>.+?)\s*$"
)
STAMP_RE = re.compile(r"\b\d{1,2}\s+\w+\s+\d{4}\b")
DATE_RE = re.compile(r"^(?P<date>\d{1,2}\s+\w+)\b")
TIME_RE = re.compile(r"^(?P<time>\d{2}:\d{2})\b")


def extract_text(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout


def normalize_stamp(value: str) -> str:
    parts = value.split()
    if len(parts) != 3:
        return value
    return f"{parts[0]}. {parts[1]} {parts[2]}"


def default_input_path() -> Path:
    local_pdf = BASE_DIR / "ClubResult.pdf"
    if local_pdf.exists():
        return local_pdf
    return Path.home() / "Downloads" / "ClubResult.pdf"


def parse_matches(text: str) -> tuple[list[dict], str]:
    matches = []
    current_date = ""
    stamps = STAMP_RE.findall(text)
    updated_at = normalize_stamp(stamps[-1]) if stamps else ""

    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            continue
        if line.startswith("Spielpläne und Resultate:") or line == "Gruppenspiele":
            continue
        if line.startswith("Datum") or line.startswith("Seite "):
            continue
        if line == "\f":
            continue

        match = LINE_RE.match(line)
        if not match:
            continue

        prefix = match.group("prefix")
        date_match = DATE_RE.match(prefix.lstrip())
        if date_match and prefix[: len(prefix) - len(prefix.lstrip())] == "":
            current_date = " ".join(date_match.group("date").split())
            prefix = prefix[date_match.end():]
        if not current_date:
            continue

        prefix = prefix.lstrip()
        time = ""
        time_match = TIME_RE.match(prefix)
        if time_match:
            time = time_match.group("time")
            prefix = prefix[time_match.end():]

        entry = {
            "date": current_date,
            "time": time,
            "liga": " ".join(prefix.split()),
            "runde": match.group("runde"),
            "home": " ".join(match.group("home").split()),
            "away": " ".join(match.group("away").split()),
        }
        matches.append(entry)

    return matches, updated_at


def build_payload(pdf_path: Path) -> dict:
    text = extract_text(pdf_path)
    matches, updated_at = parse_matches(text)
    if not matches:
        raise RuntimeError("Keine Spieltermine im PDF gefunden.")
    return {
        "source": pdf_path.name,
        "updated_at": updated_at,
        "matches": matches,
    }


def main() -> int:
    pdf_path = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else default_input_path()
    output_path = Path(sys.argv[2]).expanduser() if len(sys.argv) > 2 else DEFAULT_OUTPUT

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF nicht gefunden: {pdf_path}")

    payload = build_payload(pdf_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"PDF: {pdf_path}")
    print(f"JSON: {output_path}")
    print(f"Stand: {payload.get('updated_at') or '-'}")
    print(f"Einträge: {len(payload['matches'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
