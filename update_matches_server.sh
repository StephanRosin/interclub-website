#!/bin/sh
set -eu

BASE_DIR="/mnt/apps/interclub-website"
PUBLIC_DIR="${BASE_DIR}/public"
PDF_URL="https://comp.swisstennis.ch/ic/servlet/ClubResult.pdf?ClubName=1298&Lang=D"
PDF_PATH="${BASE_DIR}/ClubResult.pdf"
JSON_PATH="${PUBLIC_DIR}/matches.json"
IMPORT_SCRIPT="${BASE_DIR}/import_clubresult.py"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$PUBLIC_DIR"
curl -fsSL "$PDF_URL" -o "${TMP_DIR}/ClubResult.pdf"
cp "${TMP_DIR}/ClubResult.pdf" "$PDF_PATH"

docker run --rm \
  -v "${BASE_DIR}:/data" \
  python:3.12-alpine \
  sh -lc "
    apk add --no-cache poppler-utils >/dev/null &&
    python3 /data/import_clubresult.py /data/ClubResult.pdf /data/public/matches.json
  "

echo "Updated: ${JSON_PATH}"
