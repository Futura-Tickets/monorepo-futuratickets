#!/bin/bash

YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  FUTURA TICKETS - Full Health Check${NC}"
echo -e "${GREEN}========================================${NC}\n"

check_service() {
  local port=$1
  local name=$2
  local color=$3

  if lsof -i:$port 2>/dev/null | grep -q LISTEN; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null)

    if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
      echo -e "${color}${name}${NC} (port $port): ${GREEN}✓ Running (HTTP $http_code)${NC}"
    else
      echo -e "${color}${name}${NC} (port $port): ${YELLOW}⚠ Port open but HTTP $http_code${NC}"
    fi
  else
    echo -e "${color}${name}${NC} (port $port): ${RED}✗ Not running${NC}"
  fi
}

echo -e "${CYAN}=== BACKEND APIs ===${NC}"
check_service 3002 "Admin API" "$BLUE"
check_service 3004 "Marketplace API" "$RED"
check_service 3005 "Access API" "$YELLOW"

echo -e "\n${CYAN}=== FRONTEND Apps ===${NC}"
check_service 3000 "Marketplace Web" "$YELLOW"
check_service 3001 "Admin Panel" "$CYAN"
check_service 3007 "Access Web" "$MAGENTA"

echo -e "\n${CYAN}=== BLOCKCHAIN ===${NC}"
check_service 8545 "Hardhat Node" "$MAGENTA"

echo -e "\n${GREEN}Health check complete${NC}"
echo -e "\nFor detailed info, see: ${YELLOW}PORT_MAP.md${NC}"
