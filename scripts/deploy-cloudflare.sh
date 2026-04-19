#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DB_NAME="${CLOUDFLARE_D1_NAME:-amseta-prod}"

function require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name"
    exit 1
  fi
}

function require_env() {
  local var_name="$1"

  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required environment variable: $var_name"
    exit 1
  fi
}

function print_step() {
  local message="$1"
  printf "\n==> %s\n" "$message"
}

require_command npm
require_command npx

print_step "Validating local test and build gates"
npm test
npm run build
npm run cf-typegen

print_step "Checking Wrangler authentication"
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "Wrangler is not authenticated. Configure CLOUDFLARE_API_TOKEN or run 'npx wrangler login' and retry."
  exit 1
fi

require_env CLOUDFLARE_ACCOUNT_ID
require_env CLOUDFLARE_DATABASE_ID
require_env CLOUDFLARE_D1_TOKEN

print_step "Applying remote D1 migrations for $DB_NAME"
npx wrangler d1 migrations apply "$DB_NAME" --remote

print_step "Backfilling remote property scoreboard fields"
npm run db:backfill:scoreboard

print_step "Deploying Cloudflare Worker"
npm run deploy

print_step "Release follow-up"
cat <<EOF
Verify these URLs after deploy:
  https://amseta.com
  https://www.amseta.com
  https://amseta.com/login

Recommended smoke checks:
  1. Load the landing page.
  2. Sign in with your deployed demo account.
  3. Open /dashboard and confirm data renders.
  4. Open /api/session and confirm authenticated JSON returns 200.
EOF
