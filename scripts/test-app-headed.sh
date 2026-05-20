#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="containers/app-test/docker-compose.app-test.yml"
ENV_FILE="containers/app-test/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose -f "$COMPOSE_FILE")
else
  COMPOSE=(docker compose -f "$COMPOSE_FILE")
fi

cleanup() {
  echo ""
  echo "Cleaning up containers and volumes..."
  "${COMPOSE[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

echo "Building images..."
"${COMPOSE[@]}" build postgres mailpit api web

echo "Starting services (postgres, mailpit, api, web)..."
"${COMPOSE[@]}" up -d postgres mailpit api web

echo "Waiting for web to be healthy (port 3000)..."
until curl -sf http://localhost:3000 >/dev/null 2>&1; do
  sleep 2
done
echo "Web is ready."

echo "Ensuring Playwright browsers are installed..."
cd apps/web
npx playwright install chromium

echo "Running Playwright tests locally (headed)..."
BASE_URL=http://localhost:3000 \
  MAILPIT_URL=http://localhost:8025 \
  TEST_USER_EMAIL="${TEST_USER_EMAIL:-}" \
  TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-}" \
  npx playwright test --headed "$@"
