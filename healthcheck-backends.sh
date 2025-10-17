#!/bin/bash

# Healthcheck script for all backend APIs
# Usage: ./healthcheck-backends.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Backend APIs - Health Check${NC}"
echo -e "${YELLOW}========================================${NC}\n"

check_api() {
  local name=$1
  local port=$2
  local color=$3

  if lsof -iTCP:$port -sTCP:LISTEN > /dev/null 2>&1; then
    echo -e "${color}✓${NC} ${name} is ${GREEN}UP${NC} on port ${port}"

    # Try HTTP request if available
    if command -v curl &> /dev/null; then
      response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${port} 2>/dev/null || echo "000")
      if [ "$response" != "000" ]; then
        echo -e "   └─ HTTP Response: ${response}"
      fi
    fi
    return 0
  else
    echo -e "${RED}✗${NC} ${name} is ${RED}DOWN${NC} (port ${port} not listening)"
    return 1
  fi
}

# Check each API
check_api "Admin API" 3002 "\033[0;34m"
check_api "Marketplace API" 3004 "\033[0;31m"
check_api "Access API" 3005 "\033[1;33m"

echo -e "\n${YELLOW}========================================${NC}"

# Check Node processes
nest_count=$(ps aux | grep "nest start" | grep -v grep | wc -l | xargs)
echo -e "Active NestJS processes: ${nest_count}/3"

echo -e "${YELLOW}========================================${NC}"
