#!/usr/bin/env bash
# Smoke-test the README quickstart from a fresh state.
# Boots the docker-compose stack, waits for both services, hits the health
# endpoints, then tears down. Exits 0 if every probe succeeds.
#
# Usage:  ./scripts/test-quickstart.sh
set -euo pipefail

cd "$(dirname "$0")/.."

trap 'docker compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "[quickstart] copied .env.example → .env"
fi

echo "[quickstart] docker compose up --build -d"
docker compose up --build -d

wait_for() {
  local name=$1 url=$2 attempts=60
  echo -n "[quickstart] waiting for $name "
  for _ in $(seq 1 $attempts); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "ok"
      return 0
    fi
    echo -n "."
    sleep 2
  done
  echo " timeout"
  echo "[quickstart] FAIL: $name never came up at $url"
  docker compose logs --tail 80
  return 1
}

wait_for "backend /api/health/"  "http://localhost:8000/api/health/"
wait_for "frontend /"            "http://localhost:3000/"

echo "[quickstart] all probes passed."
