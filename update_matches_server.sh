#!/bin/sh
set -eu

BASE_DIR="/mnt/apps/interclub-website"
PUBLIC_DIR="${BASE_DIR}/public"
JSON_PATH="${PUBLIC_DIR}/matches.json"
IMPORT_SCRIPT="${BASE_DIR}/import_clubresult.py"

mkdir -p "$PUBLIC_DIR"
python3 "${IMPORT_SCRIPT}" --output "${JSON_PATH}"

rm -f "${BASE_DIR}/matches.json"

echo "Updated: ${JSON_PATH}"
