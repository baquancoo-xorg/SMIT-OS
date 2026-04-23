#!/bin/bash

# SMIT-OS Auto-Start Script
# This script starts the Docker DB and the application server

PROJECT_DIR="/Users/dominium/Documents/Project/SMIT-OS"
LOG_FILE="/Users/dominium/Documents/Project/SMIT-OS/logs/startup.log"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date)] Starting SMIT-OS..." >> "$LOG_FILE"

# Check if Docker is running
if ! /usr/local/bin/docker info > /dev/null 2>&1; then
    echo "[$(date)] Docker is not running. Waiting..." >> "$LOG_FILE"
    sleep 10
fi

# Start Docker containers
cd "$PROJECT_DIR"
/usr/local/bin/docker-compose up -d 2>> "$LOG_FILE"
echo "[$(date)] Docker containers started" >> "$LOG_FILE"

# Wait for DB to be ready
sleep 5

# Start the application server
cd "$PROJECT_DIR"
/opt/homebrew/bin/npm run start >> "$LOG_FILE" 2>&1 &

echo "[$(date)] Server process started (PID: $!)" >> "$LOG_FILE"
