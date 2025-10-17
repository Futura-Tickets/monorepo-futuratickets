#!/bin/bash
# SEED DATABASE - Populate con datos de prueba
YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
echo -e "${YELLOW}====== DATABASE SEEDING ======${NC}\n"

echo -e "${YELLOW}Note: This script requires seed data files${NC}"
echo -e "${YELLOW}Create seed scripts in each service's /seeds directory${NC}\n"

for service in futura-tickets-admin-api futura-market-place-api futura-access-api; do
    if [ -f "$service/seeds/seed.js" ]; then
        echo -e "${GREEN}Seeding $service...${NC}"
        cd "$service"
        node seeds/seed.js && echo -e "${GREEN}✓ Seeded${NC}" || echo -e "${RED}✗ Failed${NC}"
        cd ..
    else
        echo -e "${YELLOW}No seed script for $service${NC}"
    fi
done

echo -e "\n${GREEN}====== SEEDING COMPLETE ======${NC}"
echo -e "${YELLOW}Tip: Create seeds/seed.js in each service${NC}"
