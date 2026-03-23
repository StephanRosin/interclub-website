#!/usr/bin/env python3
import argparse
import shutil
import subprocess
import sys
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
IMPORT_SCRIPT = BASE_DIR / "import_clubresult.py"
DEFAULT_PDF = Path.home() / "Downloads" / "ClubResult.pdf"
DEFAULT_JSON = PUBLIC_DIR / "matches.json"
DEFAULT_REMOTE = "truenas_admin@192.168.178.94"
DEFAULT_REMOTE_DIR = "/mnt/apps/interclub-website"


def run(cmd: list[str], **kwargs) -> None:
    subprocess.run(cmd, check=True, **kwargs)


def update_remote(pdf_path: Path, remote: str, remote_dir: str) -> None:
    local_pdf = BASE_DIR / "ClubResult.pdf"
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    if pdf_path != local_pdf:
        shutil.copy2(pdf_path, local_pdf)

    run([sys.executable, str(IMPORT_SCRIPT), str(local_pdf), str(DEFAULT_JSON)])
    tar_cmd = [
        "tar",
        "czf",
        "-",
        "-C",
        str(BASE_DIR),
        local_pdf.name,
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
    parser = argparse.ArgumentParser(description="Importiert ClubResult.pdf und aktualisiert matches.json auf TrueNAS.")
    parser.add_argument("pdf", nargs="?", default=str(DEFAULT_PDF), help="Pfad zur ClubResult.pdf")
    parser.add_argument("--remote", default=DEFAULT_REMOTE, help="SSH-Ziel")
    parser.add_argument("--remote-dir", default=DEFAULT_REMOTE_DIR, help="Zielordner auf dem Server")
    args = parser.parse_args()

    pdf_arg_given = len(sys.argv) > 1 and not sys.argv[1].startswith("--")
    pdf_path = Path(args.pdf).expanduser().resolve()
    if not pdf_path.exists() and not pdf_arg_given:
        print("Keine aktuelle Datei vorhanden")
        return 0
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF nicht gefunden: {pdf_path}")

    update_remote(pdf_path, args.remote, args.remote_dir)
    print(f"PDF importiert: {pdf_path}")
    print(f"Aktualisiert auf: {args.remote}:{args.remote_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
