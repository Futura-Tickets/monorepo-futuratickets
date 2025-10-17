#!/bin/bash
# PERFORMANCE TEST - Tests básicos de rendimiento
YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
echo -e "${YELLOW}====== PERFORMANCE TEST ======${NC}\n"

echo -e "${GREEN}Testing response times...${NC}\n"

test_endpoint() {
    local name=$1 url=$2
    time=$(curl -o /dev/null -s -w '%{time_total}' "$url" 2>/dev/null)
    echo "$name: ${time}s"
}

test_endpoint "Admin API Health" "http://localhost:3002/health"
test_endpoint "Marketplace API" "http://localhost:3004"
test_endpoint "Access API Health" "http://localhost:3005/health"
test_endpoint "Marketplace Web" "http://localhost:3000"
test_endpoint "Admin Panel" "http://localhost:3001"

echo -e "\n${YELLOW}Tip: Use Apache Bench for load testing:${NC}"
echo "  ab -n 1000 -c 10 http://localhost:3000/"
