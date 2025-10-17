#!/bin/bash
# BUILD ALL SERVICES - Compila todos los servicios
set -e
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}====== BUILDING ALL SERVICES ======${NC}\n"

BACKENDS=("futura-tickets-admin-api" "futura-market-place-api" "futura-access-api")
FRONTENDS=("futura-market-place-v2" "futura-tickets-admin" "futura-tickets-access-app")

for service in "${BACKENDS[@]}" "${FRONTENDS[@]}"; do
    if [ -d "$service" ]; then
        echo -e "${YELLOW}Building $service...${NC}"
        cd "$service"
        npm run build && echo -e "${GREEN}✓ Built${NC}\n" || echo -e "${RED}✗ Failed${NC}\n"
        cd ..
    fi
done
echo -e "${GREEN}====== BUILD COMPLETE ======${NC}"
