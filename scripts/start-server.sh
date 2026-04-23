#!/bin/bash

set -euo pipefail

PROJECT_DIR="/Users/dominium/Documents/Project/SMIT-OS"
LOG_DIR="/Users/dominium/Library/Logs/SMIT-OS"
LOG_FILE="$LOG_DIR/startup.log"
DOCKER_COMPOSE_BIN="/usr/local/bin/docker-compose"
NPM_BIN="/opt/homebrew/bin/npm"
APP_PORT="3000"

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin"

mkdir -p "$LOG_DIR"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG_FILE"
}

is_port_listening() {
  lsof -nP -iTCP:"$APP_PORT" -sTCP:LISTEN >/dev/null 2>&1
}

run() {
  log "$1"
  shift
  "$@" >> "$LOG_FILE" 2>&1
}

log "Starting SMIT-OS bootstrap"

if [ ! -d "$PROJECT_DIR" ]; then
  log "Project directory missing: $PROJECT_DIR"
  exit 78
fi

cd "$PROJECT_DIR"

if [ ! -x "$NPM_BIN" ]; then
  log "npm binary missing or not executable: $NPM_BIN"
  exit 78
fi

if ! /usr/local/bin/docker info >/dev/null 2>&1; then
  log "Docker is not ready; waiting 10 seconds"
  sleep 10
fi

if [ -x "$DOCKER_COMPOSE_BIN" ]; then
  run "Starting Docker containers with docker-compose" "$DOCKER_COMPOSE_BIN" up -d
else
  run "Skipping Docker startup because docker-compose is unavailable" /usr/bin/true
fi

sleep 5

if is_port_listening; then
  log "App port $APP_PORT already listening; skipping app start"
  exit 0
fi

log "Starting application server on port $APP_PORT"
nohup "$NPM_BIN" run start >> "$LOG_FILE" 2>&1 &
APP_PID=$!
log "Server process started (PID: $APP_PID)"

sleep 3

if is_port_listening; then
  log "App port $APP_PORT is now listening"
  exit 0
fi

log "App failed to start on port $APP_PORT"
exit 78
