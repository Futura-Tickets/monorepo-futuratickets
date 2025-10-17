#!/bin/bash
# CHECK DEPENDENCIES VERSIONS
YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
echo -e "${YELLOW}====== DEPENDENCY VERSIONS ======${NC}\n"

echo -e "${GREEN}Node.js:${NC} $(node -v)"
echo -e "${GREEN}npm:${NC} $(npm -v)"
command -v docker &>/dev/null && echo -e "${GREEN}Docker:${NC} $(docker --version | awk '{print $3}' | tr -d ',')" || echo "Docker: Not installed"
command -v mongosh &>/dev/null && echo -e "${GREEN}MongoDB Shell:${NC} $(mongosh --version | head -1)" || echo "MongoDB Shell: Not installed"

echo -e "\n${YELLOW}====== NPM OUTDATED (Backend APIs) ======${NC}"
for service in futura-tickets-admin-api futura-market-place-api futura-access-api; do
    [ -d "$service" ] && {
        echo -e "\n${YELLOW}$service:${NC}"
        cd "$service" && npm outdated | head -5 || echo "All up to date"
        cd ..
    }
done
