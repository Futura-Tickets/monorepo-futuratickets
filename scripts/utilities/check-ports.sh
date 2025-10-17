#!/bin/bash
# CHECK PORTS - Verifica qué puertos están en uso
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}====== PORT STATUS ======${NC}\n"

PORTS=(3000 3001 3002 3004 3005 3007 8545)
NAMES=("Marketplace Web" "Admin Panel" "Admin API" "Marketplace API" "Access API" "Access Web" "Ganache")

for i in "${!PORTS[@]}"; do
    port=${PORTS[$i]}
    name=${NAMES[$i]}
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        pid=$(lsof -ti:$port)
        echo -e "${GREEN}✓${NC} Port $port ($name) - ${YELLOW}PID $pid${NC}"
    else
        echo -e "${RED}✗${NC} Port $port ($name) - FREE"
    fi
done

echo -e "\n${YELLOW}Tip: Kill process with: ${NC}kill \$(lsof -ti:PORT)"
