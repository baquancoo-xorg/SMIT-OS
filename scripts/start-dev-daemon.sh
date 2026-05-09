#!/bin/bash
# Auto-start SMIT-OS dev server via launchd LaunchAgent.
# Waits for Postgres to be ready (port 5435), then runs `npm run dev`.
# Logs are timestamped and routed to ~/Library/Logs/smit-os-dev.{out,err}.log via the plist.

set -uo pipefail

# launchd context has a minimal PATH — restore Homebrew + standard system paths.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

PROJECT_DIR="/Users/dominium/Documents/Project/SMIT-OS"
DB_PORT=5435
MAX_WAIT_SEC=300   # 5 minutes
INTERVAL_SEC=5

ts() { date '+%Y-%m-%d %H:%M:%S'; }

cd "$PROJECT_DIR" || { echo "[$(ts)] FATAL: cannot cd into $PROJECT_DIR"; exit 1; }

echo "[$(ts)] === SMIT-OS dev daemon starting ==="
echo "[$(ts)] Project: $PROJECT_DIR"
echo "[$(ts)] Node:    $(command -v node || echo 'NOT FOUND')"
echo "[$(ts)] Waiting for DB on localhost:$DB_PORT (max ${MAX_WAIT_SEC}s, interval ${INTERVAL_SEC}s)"

elapsed=0
while ! nc -z localhost "$DB_PORT" 2>/dev/null; do
  if [ "$elapsed" -ge "$MAX_WAIT_SEC" ]; then
    echo "[$(ts)] DB not ready after ${MAX_WAIT_SEC}s. Exiting (launchd will retry after ThrottleInterval)."
    exit 1
  fi
  sleep "$INTERVAL_SEC"
  elapsed=$((elapsed + INTERVAL_SEC))
done

echo "[$(ts)] DB ready after ${elapsed}s. Starting 'npm run dev'..."
exec npm run dev
