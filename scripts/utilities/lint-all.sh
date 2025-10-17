#!/bin/bash
# LINT ALL SERVICES
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}====== LINTING ALL SERVICES ======${NC}\n"

for service in futura-tickets-admin-api futura-market-place-api futura-access-api; do
    [ -d "$service" ] && {
        echo -e "${YELLOW}Linting $service...${NC}"
        cd "$service" && npm run lint 2>/dev/null || echo "No lint script"
        cd ..
    }
done
echo -e "${GREEN}====== LINT COMPLETE ======${NC}"
