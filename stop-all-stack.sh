#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}Stopping all FUTURA TICKETS services...${NC}\n"

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

echo -e "${YELLOW}Stopping Backend APIs...${NC}"
kill_port 3002 "Admin API"
kill_port 3004 "Marketplace API"
kill_port 3005 "Access API"

echo -e "\n${YELLOW}Stopping Frontend Apps...${NC}"
kill_port 3000 "Marketplace Web"
kill_port 3001 "Admin Panel"
kill_port 3007 "Access Web"

echo -e "\n${YELLOW}Stopping Blockchain...${NC}"
kill_port 8545 "Hardhat Node"

# Matar cualquier proceso hardhat zombie
pkill -f "hardhat node" 2>/dev/null && echo -e "${GREEN}✓${NC} Killed remaining hardhat processes"

# Matar tmux session si existe
if tmux has-session -t futura-stack 2>/dev/null; then
  tmux kill-session -t futura-stack
  echo -e "${GREEN}✓${NC} Killed tmux session 'futura-stack'"
fi

echo -e "\n${GREEN}All services stopped${NC}"
