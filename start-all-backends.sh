#!/bin/bash

# Colores para diferenciar logs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}[ADMIN-API]${NC} Starting on port 4101..."
(cd futura-tickets-admin-api && npm run start:dev 2>&1 | sed "s/^/[ADMIN-API] /") &

echo -e "${GREEN}[MARKET-API]${NC} Starting on port 4102..."
(cd futura-market-place-api && npm run start:dev 2>&1 | sed "s/^/[MARKET-API] /") &

echo -e "${BLUE}[ACCESS-API]${NC} Starting on port 4103..."
(cd futura-access-api && npm run start:dev 2>&1 | sed "s/^/[ACCESS-API] /") &

wait
