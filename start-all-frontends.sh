#!/bin/bash

YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
NC='\033[0m'

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  FRONTEND Apps - Starting All Services${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}[MARKETPLACE]${NC} Starting on port 3000..."
(cd "$BASE_DIR/futura-market-place-v2" && npm run dev 2>&1 | sed "s/^/[MARKETPLACE] /") &

echo -e "${CYAN}[ADMIN]${NC} Starting on port 3001..."
(cd "$BASE_DIR/futura-tickets-admin" && npm run dev 2>&1 | sed "s/^/[ADMIN] /") &

echo -e "${MAGENTA}[ACCESS-WEB]${NC} Starting on port 3007..."
(cd "$BASE_DIR/futura-tickets-web-access-app" && npm run dev 2>&1 | sed "s/^/[ACCESS-WEB] /") &

echo -e "\n${GREEN}All frontends starting...${NC}"
echo -e "URLs:"
echo -e "  ${YELLOW}→ http://localhost:3000${NC} (Marketplace)"
echo -e "  ${CYAN}→ http://localhost:3001${NC} (Admin Panel)"
echo -e "  ${MAGENTA}→ http://localhost:3007${NC} (Access Web)"
echo -e "\n${GREEN}Press Ctrl+C to stop all services${NC}\n"

wait
