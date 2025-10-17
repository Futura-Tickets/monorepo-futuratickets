#!/bin/bash

YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  FRONTEND Health Check${NC}"
echo -e "${GREEN}========================================${NC}\n"

check_service() {
  local port=$1
  local name=$2
  local color=$3

  # Check if port is listening
  if lsof -i:$port 2>/dev/null | grep -q LISTEN; then
    # Check HTTP response
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null)

    if [ "$http_code" = "200" ]; then
      echo -e "${color}${name}${NC} (port $port): ${GREEN}✓ Running (HTTP $http_code)${NC}"
    else
      echo -e "${color}${name}${NC} (port $port): ${YELLOW}⚠ Port open but HTTP $http_code${NC}"
    fi
  else
    echo -e "${color}${name}${NC} (port $port): ${RED}✗ Not running${NC}"
  fi
}

check_service 3000 "Marketplace" "$YELLOW"
check_service 3001 "Admin Panel" "$CYAN"
check_service 3007 "Access Web" "$MAGENTA"

echo -e "\n${GREEN}Health check complete${NC}"
