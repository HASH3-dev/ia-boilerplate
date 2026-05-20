#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="containers/app-test/docker-compose.app-test.yml"
export APP_TEST_WEB_PORT="${APP_TEST_WEB_PORT:-3005}"

QUIET=false
LOG_FILE="/tmp/test-app-full.log"

for arg in "$@"; do
  case "$arg" in
    --quiet) QUIET=true ;;
  esac
done

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose -f "$COMPOSE_FILE")
else
  COMPOSE=(docker compose -f "$COMPOSE_FILE")
fi

run() {
  if $QUIET; then
    "$@" >> "$LOG_FILE" 2>&1
  else
    "$@"
  fi
}

log() {
  if $QUIET; then
    echo "$*" >> "$LOG_FILE"
  fi
  echo "$*"
}

cleanup() {
  if ! $QUIET; then
    echo ""
  fi
  log "Cleaning up containers and volumes..."
  "${COMPOSE[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

if $QUIET; then
  : > "$LOG_FILE"
  echo "Running test:app:full (quiet mode — log: $LOG_FILE)"
fi

START_TIME=$(date +%s)

log "Building images..."
run "${COMPOSE[@]}" build

log "Running web unit tests (Vitest)..."
run "${COMPOSE[@]}" run --rm -T web-vitest

log "Starting services (postgres, mailpit, api, web)..."
run "${COMPOSE[@]}" up -d postgres mailpit api web

log "Waiting for all services to be healthy..."
log "(This may take a minute while the web build completes and services start.)"

log "Running Playwright tests..."
run "${COMPOSE[@]}" run --rm -T playwright

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

if $QUIET; then
  echo "PASS — all tests passed (${ELAPSED}s) | log: $LOG_FILE"
fi
