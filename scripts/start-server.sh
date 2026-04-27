#!/bin/bash

set -euo pipefail

PROJECT_DIR="/Users/dominium/Documents/Project/SMIT-OS"
LOG_DIR="/Users/dominium/Library/Logs/SMIT-OS"
LOG_FILE="$LOG_DIR/startup.log"
DOCKER_BIN="/usr/local/bin/docker"
DOCKER_COMPOSE_BIN="/usr/local/bin/docker-compose"
NPM_BIN="/opt/homebrew/bin/npm"
APP_PORT="3000"
DOCKER_WAIT_SECONDS="180"
APP_WAIT_SECONDS="30"

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin"

mkdir -p "$LOG_DIR"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG_FILE"
}

is_port_listening() {
  /usr/sbin/lsof -nP -iTCP:"$APP_PORT" -sTCP:LISTEN >/dev/null 2>&1
}

run() {
  log "$1"
  shift
  "$@" >> "$LOG_FILE" 2>&1
}

wait_for_docker() {
  local elapsed=0

  while ! "$DOCKER_BIN" info >/dev/null 2>&1; do
    if [ "$elapsed" -ge "$DOCKER_WAIT_SECONDS" ]; then
      log "Docker is not ready after ${DOCKER_WAIT_SECONDS}s"
      return 1
    fi

    log "Docker is not ready; waiting 5 seconds"
    sleep 5
    elapsed=$((elapsed + 5))
  done

  return 0
}

start_docker_services() {
  if "$DOCKER_BIN" compose version >/dev/null 2>&1; then
    run "Starting Docker containers with docker compose" "$DOCKER_BIN" compose up -d
  elif [ -x "$DOCKER_COMPOSE_BIN" ]; then
    run "Starting Docker containers with docker-compose" "$DOCKER_COMPOSE_BIN" up -d
  else
    log "Docker Compose is unavailable"
    return 1
  fi
}

wait_for_app_port() {
  local elapsed=0

  while [ "$elapsed" -lt "$APP_WAIT_SECONDS" ]; do
    if is_port_listening; then
      return 0
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  return 1
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

if [ ! -x "$DOCKER_BIN" ]; then
  log "Docker binary missing or not executable: $DOCKER_BIN"
  exit 78
fi

if is_port_listening; then
  log "App port $APP_PORT already listening; skipping app start"
  exit 0
fi

if ! wait_for_docker; then
  exit 75
fi

start_docker_services
sleep 5

if is_port_listening; then
  log "App port $APP_PORT already listening after Docker startup; skipping app start"
  exit 0
fi

log "Starting application server on port $APP_PORT"
nohup "$NPM_BIN" run start >> "$LOG_FILE" 2>&1 &
APP_PID=$!
log "Server process started (PID: $APP_PID)"

if wait_for_app_port; then
  log "App port $APP_PORT is now listening"
  exit 0
fi

log "App failed to start on port $APP_PORT"
exit 78
