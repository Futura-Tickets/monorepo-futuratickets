#!/bin/bash

# CONTINUOUS HEALTH CHECK
# Monitoreo continuo de servicios cada 30 segundos
# Uso: ./continuous-health-check.sh [interval_seconds]

INTERVAL=${1:-30}
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  CONTINUOUS HEALTH MONITOR${NC}"
echo -e "${GREEN}  Checking every ${INTERVAL}s${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

check_service() {
    local name=$1
    local port=$2

    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port" 2>/dev/null)

    if [ "$response" = "000" ]; then
        echo -e "[$(date '+%H:%M:%S')] ${RED}✗${NC} $name (port $port) - DOWN"
        return 1
    else
        echo -e "[$(date '+%H:%M:%S')] ${GREEN}✓${NC} $name (port $port) - UP (HTTP $response)"
        return 0
    fi
}

while true; do
    clear
    echo -e "${YELLOW}=== Health Check - $(date '+%Y-%m-%d %H:%M:%S') ===${NC}"
    echo ""

    # Backend APIs
    check_service "Admin API" 3002
    check_service "Marketplace API" 3004
    check_service "Access API" 3005
    echo ""

    # Frontend Apps
    check_service "Marketplace Web" 3000
    check_service "Admin Panel" 3001
    check_service "Access Web" 3007
    echo ""

    # Blockchain
    check_service "Ganache/Hardhat" 8545
    echo ""

    echo -e "${YELLOW}Next check in ${INTERVAL}s...${NC}"
    sleep $INTERVAL
done
