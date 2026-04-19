#!/usr/bin/env bash

set -euo pipefail

DB_PATH="${1:-dev.db}"
OUT_PATH="${2:-generated/seed-data.sql}"

insert_order=(
  Tenant
  User
  Manager
  Provider
  Property
  PropertyProvider
  Issue
  TaskItem
  CapexProject
  DocumentRecord
  TimelineNote
)

delete_order=(
  TimelineNote
  DocumentRecord
  CapexProject
  TaskItem
  Issue
  PropertyProvider
  Property
  Provider
  Manager
  User
  Tenant
)

mkdir -p "$(dirname "$OUT_PATH")"

{
  echo "PRAGMA defer_foreign_keys = ON;"

  for table in "${delete_order[@]}"; do
    echo "DELETE FROM \"$table\";"
  done

  for table in "${insert_order[@]}"; do
    sqlite3 "$DB_PATH" ".mode insert \"$table\"" "SELECT * FROM \"$table\";"
  done
} > "$OUT_PATH"

echo "Wrote D1 seed SQL to $OUT_PATH"
