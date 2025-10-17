#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}Stopping all frontend services...${NC}\n"

# Función para matar procesos por puerto
kill_port() {
  local port=$1
  local name=$2
  local pid=$(lsof -ti:$port 2>/dev/null)

  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null
    echo -e "${GREEN}✓${NC} Stopped $name (port $port, PID $pid)"
  else
    echo -e "  $name (port $port) - already stopped"
  fi
}

kill_port 3000 "Marketplace"
kill_port 3001 "Admin Panel"
kill_port 3007 "Access Web"

echo -e "\n${GREEN}All frontend services stopped${NC}"
