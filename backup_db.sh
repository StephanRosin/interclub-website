#!/usr/bin/env sh
set -eu

APP_DIR="/mnt/apps/interclub-website"
DB_PATH="$APP_DIR/ic_teams.sqlite"
BACKUP_DIR="$APP_DIR/backups"

mkdir -p "$BACKUP_DIR"

TS="$(date +%Y-%m-%d_%H-%M-%S)"
OUT="$BACKUP_DIR/ic_teams_${TS}.sqlite"

if [ ! -f "$DB_PATH" ]; then
  echo "DB nicht gefunden: $DB_PATH" >&2
  exit 1
fi

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_PATH" ".backup '$OUT'"
else
  cp "$DB_PATH" "$OUT"
fi

chmod 600 "$OUT" || true
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'ic_teams_*.sqlite' -mtime +7 -delete

echo "Backup erstellt: $OUT"
