#!/bin/bash
# UPDATE ALL DEPENDENCIES - Actualiza deps en todos los servicios
RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
echo -e "${RED}⚠️  WARNING: This will update dependencies in all services${NC}"
read -p "Continue? (y/n) " -n 1 -r; echo ""
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 1

SERVICES=(futura-tickets-admin-api futura-market-place-api futura-access-api futura-market-place-v2 futura-tickets-admin futura-tickets-access-app)

for service in "${SERVICES[@]}"; do
    [ -d "$service" ] && {
        echo -e "${YELLOW}Updating $service...${NC}"
        cd "$service"
        npm update --legacy-peer-deps
        echo -e "${GREEN}✓ Updated${NC}\n"
        cd ..
    }
done
echo -e "${GREEN}====== UPDATE COMPLETE ======${NC}"
echo -e "${YELLOW}Tip: Test all services after update${NC}"
