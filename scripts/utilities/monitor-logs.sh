#!/bin/bash
# MONITOR LOGS - Tail de logs en tiempo real
YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}====== LOG MONITOR (Ctrl+C to stop) ======${NC}\n"

LOGS_DIR="./logs"

if [ ! -d "$LOGS_DIR" ]; then
    echo "No logs directory found. Logs go to stdout in dev mode."
    echo "Starting PM2 log monitor..."
    command -v pm2 &>/dev/null && pm2 logs || echo "PM2 not installed"
    exit 0
fi

# Tail all log files
tail -f "$LOGS_DIR"/*.log 2>/dev/null || {
    echo "No log files found in $LOGS_DIR"
    echo "Services log to stdout in development mode"
}
