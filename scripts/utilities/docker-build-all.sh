#!/bin/bash
# DOCKER BUILD ALL - Build Docker images de todos los servicios
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}====== DOCKER BUILD ALL ======${NC}\n"

SERVICES=("futura-tickets-admin-api" "futura-market-place-api" "futura-access-api")

for service in "${SERVICES[@]}"; do
    if [ -f "$service/Dockerfile" ]; then
        echo -e "${YELLOW}Building Docker image: $service${NC}"
        docker build -t "$service:latest" "./$service" && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
    fi
done
echo -e "${GREEN}====== DOCKER BUILD COMPLETE ======${NC}"
docker images | grep futura
