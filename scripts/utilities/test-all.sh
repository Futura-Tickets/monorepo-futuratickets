#!/bin/bash
# TEST ALL SERVICES - Ejecuta tests en todos los servicios
set -e
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
echo -e "${YELLOW}====== TESTING ALL SERVICES ======${NC}\n"

SERVICES=("futura-tickets-admin-api" "futura-market-place-api" "futura-access-api")
PASSED=0; FAILED=0

for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        echo -e "${YELLOW}Testing $service...${NC}"
        cd "$service"
        if npm test 2>/dev/null; then
            echo -e "${GREEN}✓ $service tests passed${NC}\n"
            ((PASSED++))
        else
            echo -e "${RED}✗ $service tests failed${NC}\n"
            ((FAILED++))
        fi
        cd ..
    fi
done

echo -e "${YELLOW}====== SUMMARY ======${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
[ $FAILED -eq 0 ] && exit 0 || exit 1
