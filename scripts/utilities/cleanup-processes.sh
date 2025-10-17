#!/bin/bash

# CLEANUP DUPLICATE PROCESSES
# Mata procesos duplicados de scripts start-all y check-all
# Uso: ./cleanup-processes.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  CLEANUP DUPLICATE PROCESSES${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Buscar procesos duplicados
echo -e "${GREEN}Searching for duplicate processes...${NC}"
echo ""

PIDS=$(ps aux | grep -E "(start-all|check-all)" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo -e "${GREEN}✓ No duplicate processes found${NC}"
    exit 0
fi

echo "Found processes:"
ps aux | grep -E "(start-all|check-all)" | grep -v grep | awk '{printf "  PID %s: %s\n", $2, $11}'
echo ""

COUNT=$(echo "$PIDS" | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $COUNT processes${NC}"
echo ""

read -p "Kill these processes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for PID in $PIDS; do
        kill $PID 2>/dev/null && echo -e "${GREEN}✓${NC} Killed process $PID" || echo -e "${RED}✗${NC} Failed to kill $PID"
    done
    echo ""
    echo -e "${GREEN}Cleanup complete${NC}"
else
    echo -e "${YELLOW}Aborted${NC}"
fi
