#!/bin/bash
# CLEANUP DUPLICATE PROCESSES
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}CLEANUP DUPLICATE PROCESSES${NC}\n"
PIDS=$(ps aux | grep -E "(start-all|check-all)" | grep -v grep | awk '{print $2}')
if [ -z "$PIDS" ]; then echo -e "${GREEN}✓ No duplicate processes${NC}"; exit 0; fi
echo "Found processes:"
ps aux | grep -E "(start-all|check-all)" | grep -v grep | awk '{printf "  PID %s: %s\n", $2, $11}'
COUNT=$(echo "$PIDS" | wc -l | tr -d ' ')
echo -e "\n${YELLOW}Found $COUNT processes${NC}\n"
read -p "Kill these? (y/n) " -n 1 -r; echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    for PID in $PIDS; do kill $PID 2>/dev/null && echo -e "${GREEN}✓${NC} Killed $PID" || echo -e "${RED}✗${NC} Failed $PID"; done
    echo -e "\n${GREEN}Cleanup complete${NC}"
else echo -e "${YELLOW}Aborted${NC}"; fi
