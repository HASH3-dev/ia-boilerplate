#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

TEST_SUITE_MODE="${1:-full}"

if [ "$TEST_SUITE_MODE" != "full" ] && [ "$TEST_SUITE_MODE" != "smoke" ]; then
  echo "Usage: $0 [smoke]" >&2
  exit 1
fi

if [ -f "$HOME/.asdf/asdf.sh" ]; then
  # shellcheck disable=SC1091
  source "$HOME/.asdf/asdf.sh"
fi

COMPOSE_FILE="${COMPOSE_FILE:-containers/test/docker-compose.test.yml}"

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose -f "$COMPOSE_FILE")
else
  COMPOSE=(docker compose -f "$COMPOSE_FILE")
fi

cleanup() {
  "${COMPOSE[@]}" down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

export TEST_SUITE_MODE

cleanup

"${COMPOSE[@]}" build test-runner

if [ "$TEST_SUITE_MODE" = "smoke" ]; then
  echo "Running smoke unit tests..."
  "${COMPOSE[@]}" run --rm -e TEST_DB_URI= test-runner npx jest --runInBand --testNamePattern="\\[smoke\\]"

  echo "Running smoke contract tests..."
  "${COMPOSE[@]}" run --rm test-runner npx jest --runInBand --passWithNoTests --config ./test/jest-e2e.json test/auth-email-otp.e2e-spec.ts --testNamePattern="\\[smoke\\]"

  echo "Running smoke integration tests..."
  "${COMPOSE[@]}" run --rm test-runner npx jest --runInBand --passWithNoTests --config ./test/jest-integration.json --testNamePattern="\\[smoke\\]"

  exit 0
fi

echo "Running unit tests..."
"${COMPOSE[@]}" run --rm -e TEST_DB_URI= test-runner npx jest --runInBand

echo "Running integration tests..."
"${COMPOSE[@]}" run --rm test-runner npx jest --runInBand --passWithNoTests --config ./test/jest-integration.json

echo "Running e2e tests..."
"${COMPOSE[@]}" run --rm test-runner npx jest --runInBand --passWithNoTests --config ./test/jest-e2e.json

echo "Running build..."
"${COMPOSE[@]}" run --rm test-runner npm run build

echo "Running lint..."
"${COMPOSE[@]}" run --rm test-runner npm run lint
