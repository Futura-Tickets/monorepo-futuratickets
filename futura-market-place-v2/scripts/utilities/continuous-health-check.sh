#!/bin/bash
# CONTINUOUS HEALTH CHECK - Monitoreo cada N segundos
INTERVAL=${1:-30}
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${GREEN}CONTINUOUS HEALTH MONITOR (${INTERVAL}s intervals)${NC}"
check_service() {
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$2" 2>/dev/null)
    [ "$response" = "000" ] && echo -e "[$(date '+%H:%M:%S')] ${RED}✗${NC} $1 (port $2) - DOWN" || echo -e "[$(date '+%H:%M:%S')] ${GREEN}✓${NC} $1 (port $2) - UP (HTTP $response)"
}
while true; do
    clear; echo -e "${YELLOW}Health Check - $(date)${NC}\n"
    check_service "Admin API" 3002; check_service "Marketplace API" 3004; check_service "Access API" 3005
    echo ""; check_service "Marketplace Web" 3000; check_service "Admin Panel" 3001; check_service "Access Web" 3007
    echo ""; check_service "Ganache" 8545
    echo -e "\n${YELLOW}Next check in ${INTERVAL}s...${NC}"; sleep $INTERVAL
done
