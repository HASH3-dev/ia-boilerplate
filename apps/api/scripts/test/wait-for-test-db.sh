#!/usr/bin/env bash
set -euo pipefail

if [ -f "$HOME/.asdf/asdf.sh" ]; then
  # shellcheck disable=SC1091
  source "$HOME/.asdf/asdf.sh"
fi

TEST_DB_URI="${TEST_DB_URI:-postgresql://genemunology:genemunology@localhost:54329/genemunology_test}"
last_error=""

for _ in $(seq 1 60); do
  if last_error="$(TEST_DB_URI="$TEST_DB_URI" node -e "const { Client } = require('pg'); const client = new Client({ connectionString: process.env.TEST_DB_URI }); client.connect().then(() => client.query('select 1')).then(() => client.end()).then(() => process.exit(0)).catch((error) => { console.error(error.message); process.exit(1); });" 2>&1 >/dev/null)"; then
    exit 0
  fi

  sleep 1
done

echo "Timed out waiting for test database at TEST_DB_URI" >&2
if [ -n "$last_error" ]; then
  echo "Last database readiness error: $last_error" >&2
fi
exit 1
