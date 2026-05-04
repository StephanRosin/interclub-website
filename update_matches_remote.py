#!/usr/bin/env python3
import argparse
import subprocess
import sys
from datetime import datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
IMPORT_SCRIPT = BASE_DIR / "import_clubresult.py"
DEFAULT_JSON = PUBLIC_DIR / "matches.json"
DEFAULT_REMOTE = "truenas_admin@192.168.178.94"
DEFAULT_REMOTE_DIR = "/mnt/apps/interclub-website"


def run(cmd: list[str], **kwargs) -> None:
    subprocess.run(cmd, check=True, **kwargs)


def update_remote(year: str, remote: str, remote_dir: str) -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    run([sys.executable, str(IMPORT_SCRIPT), "--year", year, "--output", str(DEFAULT_JSON)])
    tar_cmd = [
        "tar",
        "czf",
        "-",
        "-C",
        str(BASE_DIR),
        str(DEFAULT_JSON.relative_to(BASE_DIR)),
    ]
    ssh_cmd = ["ssh", "-F", "/dev/null", remote, f"tar xzf - -C {remote_dir}"]

    tar_proc = subprocess.Popen(tar_cmd, stdout=subprocess.PIPE)
    try:
        run(ssh_cmd, stdin=tar_proc.stdout)
    finally:
        if tar_proc.stdout:
            tar_proc.stdout.close()
        tar_proc.wait()


def main() -> int:
    parser = argparse.ArgumentParser(description="Importiert ClubResult-JSON und aktualisiert matches.json auf TrueNAS.")
    parser.add_argument("source", nargs="?", default="", help="Optional: Jahr (2026) oder veralteter PDF-Pfad")
    parser.add_argument("--year", default="", help="Jahr der Interclub-Saison")
    parser.add_argument("--remote", default=DEFAULT_REMOTE, help="SSH-Ziel")
    parser.add_argument("--remote-dir", default=DEFAULT_REMOTE_DIR, help="Zielordner auf dem Server")
    args = parser.parse_args()

    year = (args.year or "").strip()
    source = (args.source or "").strip()
    if not year and source.isdigit() and len(source) == 4:
        year = source
        source = ""
    if not year:
        year = str(datetime.now().year)

    if source:
        source_path = Path(source).expanduser()
        if source_path.exists():
            print(f"Hinweis: {source_path} wird ignoriert, es wird direkt die SwissTennis-API verwendet.")
        else:
            raise FileNotFoundError(f"Unbekannter Parameter oder Datei nicht gefunden: {source}")

    update_remote(year, args.remote, args.remote_dir)
    print(f"JSON importiert für Jahr: {year}")
    print(f"Aktualisiert auf: {args.remote}:{args.remote_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
