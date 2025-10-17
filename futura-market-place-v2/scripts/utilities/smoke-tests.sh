#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SMOKE TESTS - Endpoints Principales${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $name: HTTP $response"
        return 0
    else
        echo -e "${RED}✗${NC} $name: HTTP $response (esperado: $expected_code)"
        return 1
    fi
}

passed=0
failed=0

echo -e "${YELLOW}=== BACKEND APIs - Health Checks ===${NC}"
test_endpoint "Admin API /health" "http://localhost:3002/health" "200" && ((passed++)) || ((failed++))
test_endpoint "Marketplace API /stripe/config" "http://localhost:3004/stripe/config" "200" && ((passed++)) || ((failed++))
test_endpoint "Access API /health" "http://localhost:3005/health" "200" && ((passed++)) || ((failed++))
test_endpoint "Access API /health/ready" "http://localhost:3005/health/ready" "200" && ((passed++)) || ((failed++))
test_endpoint "Access API /health/info" "http://localhost:3005/health/info" "200" && ((passed++)) || ((failed++))
echo ""

echo -e "${YELLOW}=== FRONTEND Apps ===${NC}"
test_endpoint "Marketplace Web" "http://localhost:3000" "200" && ((passed++)) || ((failed++))
test_endpoint "Admin Panel" "http://localhost:3001" "200" && ((passed++)) || ((failed++))
test_endpoint "Access Web" "http://localhost:3007" "200" && ((passed++)) || ((failed++))
echo ""

echo -e "${YELLOW}=== Swagger Docs ===${NC}"
test_endpoint "Admin API Swagger" "http://localhost:3002/api/docs" "200" && ((passed++)) || ((failed++))
test_endpoint "Access API Swagger" "http://localhost:3005/api/docs" "200" && ((passed++)) || ((failed++))
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $passed${NC} | ${RED}Failed: $failed${NC}"
echo -e "${BLUE}========================================${NC}"

[ $failed -eq 0 ] && exit 0 || exit 1
