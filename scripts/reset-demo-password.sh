#!/usr/bin/env bash

set -euo pipefail

DB_PATH="${1:-dev.db}"
EMAIL="${DEMO_USER_EMAIL:-client@amseta.com}"
PASSWORD="${DEMO_USER_PASSWORD:-}"

if [[ -z "$PASSWORD" ]]; then
  echo "DEMO_USER_PASSWORD must be set."
  exit 1
fi

HASH="$(node --input-type=module -e "import { hashPassword } from './lib/server/password.ts'; process.stdout.write(hashPassword(process.env.DEMO_USER_PASSWORD));")"

sqlite3 "$DB_PATH" "UPDATE \"User\" SET \"passwordHash\" = '$HASH', \"failedLoginCount\" = 0, \"lockedUntil\" = NULL WHERE \"email\" = '$EMAIL';"

echo "Updated demo password for $EMAIL in $DB_PATH"
