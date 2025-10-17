#!/bin/bash

# Smoke Test Script for FuturaTickets
# Usage: ./smoke-test.sh [API_URL]
# Example: ./smoke-test.sh https://api.futuratickets.com

API_URL="${1:-http://localhost:4101}"
FAILED=0

echo "======================================"
echo "FuturaTickets - Smoke Tests"
echo "======================================"
echo "Testing API: $API_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local expected_status=$3

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint" --max-time 10)

    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $response)"
        FAILED=$((FAILED + 1))
    fi
}

# Function to test endpoint with JSON response
test_json_endpoint() {
    local name=$1
    local endpoint=$2

    echo -n "Testing $name... "

    response=$(curl -s "$API_URL$endpoint" --max-time 10)
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint" --max-time 10)

    if [ "$status_code" == "200" ] && echo "$response" | jq empty 2>/dev/null; then
        echo -e "${GREEN}✓ PASSED${NC} (Valid JSON response)"
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $status_code, Invalid JSON)"
        FAILED=$((FAILED + 1))
    fi
}

echo "=== Core Health Checks ==="
test_json_endpoint "Basic Health" "/health"
test_json_endpoint "Readiness Probe" "/health/ready"
test_json_endpoint "System Info" "/health/info"
echo ""

echo "=== API Endpoints ==="
test_endpoint "Swagger Docs" "/api/docs" "200"
test_endpoint "API Events (no auth)" "/api/events" "401"
echo ""

echo "=== Static Assets ==="
test_endpoint "Favicon" "/favicon.ico" "404"
echo ""

echo "======================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests passed!${NC}"
    echo "======================================"
    exit 0
else
    echo -e "${RED}✗ $FAILED test(s) failed${NC}"
    echo "======================================"
    exit 1
fi
