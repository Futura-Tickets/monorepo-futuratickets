#!/bin/bash

RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  BACKEND APIs - Starting All Services${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}[ADMIN-API]${NC} Starting on port 3002..."
(cd futura-tickets-admin-api && PORT=3002 npm run start:dev 2>&1 | sed "s/^/[ADMIN-API] /") &

echo -e "${RED}[MARKETPLACE-API]${NC} Starting on port 3004..."
(cd futura-market-place-api && PORT=3004 npm run start:dev 2>&1 | sed "s/^/[MARKETPLACE-API] /") &

echo -e "${YELLOW}[ACCESS-API]${NC} Starting on port 3005..."
(cd futura-access-api && PORT=3005 npm run start:dev 2>&1 | sed "s/^/[ACCESS-API] /") &

echo -e "\n${GREEN}All backend APIs starting...${NC}"
echo -e "URLs:"
echo -e "  ${BLUE}→ http://localhost:3002${NC} (Admin API)"
echo -e "  ${RED}→ http://localhost:3004${NC} (Marketplace API)"
echo -e "  ${YELLOW}→ http://localhost:3005${NC} (Access API)"
echo -e "\n${GREEN}Press Ctrl+C to stop all services${NC}\n"

wait
