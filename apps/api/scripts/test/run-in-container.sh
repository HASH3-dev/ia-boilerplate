#!/usr/bin/env bash
set -euo pipefail

cd /workspace/apps/api

TEST_SUITE_MODE="${1:-${TEST_SUITE_MODE:-full}}"

if [ "$TEST_SUITE_MODE" != "full" ] && [ "$TEST_SUITE_MODE" != "smoke" ]; then
  echo "Usage: $0 [smoke]" >&2
  exit 1
fi

export BACKEND_JWT_SECRET="${BACKEND_JWT_SECRET:-test-backend-jwt-secret}"
TEST_DATABASE_URI="${TEST_DB_URI:-postgresql://genemunology:genemunology@postgres-test:5432/genemunology_test}"
unset TEST_DB_URI

echo "Waiting for test database..."
database_ready=0
set +e
for _ in $(seq 1 60); do
  if pg_isready --dbname="$TEST_DATABASE_URI" >/tmp/test-db-ready.log 2>&1; then
    database_ready=1
    break
  fi

  sleep 1
done
set -e

if [ "$database_ready" -ne 1 ]; then
  echo "Timed out waiting for test database at TEST_DB_URI" >&2
  if [ -s /tmp/test-db-ready.log ]; then
    echo "Last database readiness error: $(cat /tmp/test-db-ready.log)" >&2
  fi
  exit 1
fi

if [ "$TEST_SUITE_MODE" = "smoke" ]; then
  echo "Running smoke unit tests..."
  npx jest --testNamePattern="\\[smoke\\]"

  echo "Running smoke contract tests..."
  npx jest --passWithNoTests --config ./test/jest-e2e.json test/auth-email-otp.e2e-spec.ts --testNamePattern="\\[smoke\\]"

  echo "Running smoke integration tests..."
  npx jest --passWithNoTests --config ./test/jest-integration.json --testNamePattern="\\[smoke\\]"

  exit 0
fi

run_step() {
  local label="$1"
  shift

  echo "$label"
  set +e
  "$@"
  local status=$?
  set -e

  if [ "$status" -ne 0 ]; then
    echo "$label failed with exit code $status" >&2
    if compgen -G "/root/.npm/_logs/*.log" >/dev/null; then
      echo "Recent npm logs:" >&2
      tail -120 /root/.npm/_logs/*.log >&2
    fi
    exit "$status"
  fi

  return 0
}

run_step "Running unit tests..." npx jest --runInBand

export TEST_DB_URI="$TEST_DATABASE_URI"

run_step "Running integration tests..." npx jest --passWithNoTests --config ./test/jest-integration.json --runInBand

run_step "Running e2e tests..." npx jest --passWithNoTests --config ./test/jest-e2e.json --runInBand

run_step "Running build..." npm run build

run_step "Running lint..." npm run lint
