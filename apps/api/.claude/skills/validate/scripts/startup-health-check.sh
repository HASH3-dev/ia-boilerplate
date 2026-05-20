#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://localhost:${PORT}/}"
STARTUP_TIMEOUT_SECONDS="${STARTUP_TIMEOUT_SECONDS:-30}"
LOG_FILE="${LOG_FILE:-/tmp/genemunology-api-start.log}"
APP_PID=""

cleanup() {
  if [[ -n "${APP_PID}" ]] && kill -0 "${APP_PID}" 2>/dev/null; then
    kill "${APP_PID}" 2>/dev/null || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
}

fail_with_log() {
  local message="$1"

  echo "Startup health check failed: ${message}" >&2
  if [[ -f "${LOG_FILE}" ]]; then
    echo "--- npm run start log (${LOG_FILE}) ---" >&2
    cat "${LOG_FILE}" >&2
  fi
  exit 1
}

trap cleanup EXIT

if curl -fsS "${HEALTHCHECK_URL}" >/dev/null 2>&1; then
  fail_with_log "health check URL was already responding before npm run start (${HEALTHCHECK_URL})"
fi

if [[ -f "${HOME}/.asdf/asdf.sh" ]]; then
  # shellcheck disable=SC1091
  source "${HOME}/.asdf/asdf.sh"
fi

rm -f "${LOG_FILE}"
npm run start >"${LOG_FILE}" 2>&1 &
APP_PID=$!

for _ in $(seq 1 "${STARTUP_TIMEOUT_SECONDS}"); do
  if ! kill -0 "${APP_PID}" 2>/dev/null; then
    fail_with_log "npm run start exited before the health check responded"
  fi

  if curl -fsS "${HEALTHCHECK_URL}"; then
    echo
    echo "Startup health check passed: ${HEALTHCHECK_URL}"
    exit 0
  fi

  sleep 1
done

fail_with_log "health check did not respond within ${STARTUP_TIMEOUT_SECONDS}s (${HEALTHCHECK_URL})"
