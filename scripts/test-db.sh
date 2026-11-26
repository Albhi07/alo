#!/usr/bin/env bash
# Apply all migrations to a throwaway Postgres and run the SQL tests.
# Usage: scripts/test-db.sh   (needs Postgres 15+ binaries on PATH or in /usr/lib/postgresql/*/bin)
set -euo pipefail
cd "$(dirname "$0")/.."
PGBIN=$(dirname "$(command -v initdb 2>/dev/null || ls -d /usr/lib/postgresql/*/bin/initdb | tail -1)")
TMP=$(mktemp -d)
RUN_AS=""
if [ "$(id -u)" = 0 ]; then chown -R postgres "$TMP"; RUN_AS="runuser -u postgres --"; fi
$RUN_AS "$PGBIN/initdb" -D "$TMP/data" -A trust -U postgres >/dev/null
$RUN_AS "$PGBIN/pg_ctl" -D "$TMP/data" -o "-k $TMP -p 54329 -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null
trap '$RUN_AS "$PGBIN/pg_ctl" -D "$TMP/data" -m immediate stop >/dev/null; rm -rf "$TMP"' EXIT
export PGOPTIONS="-c client_min_messages=warning"
PSQL=("$PGBIN/psql" -h "$TMP" -p 54329 -U postgres -d postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -f supabase/tests/00_stub_auth.sql
for f in supabase/migrations/*.sql; do echo "migrate $f"; "${PSQL[@]}" -f "$f"; done
[ -f supabase/seed.sql ] && { echo "seed"; "${PSQL[@]}" -f supabase/seed.sql; }
for f in supabase/tests/[1-9]*_test.sql; do echo "test $f"; "${PSQL[@]}" -f "$f"; done
