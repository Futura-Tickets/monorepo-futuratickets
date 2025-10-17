#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HEALTH CHECK - All Services${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check if service is running
check_service() {
    local name=$1
    local url=$2
    local port=$(echo $url | grep -o ':[0-9]*' | tr -d ':')

    echo -n "Checking ${name} (${url})... "

    # Check if port is listening
    if ! lsof -i :${port} -sTCP:LISTEN > /dev/null 2>&1; then
        echo -e "${RED}✗ Port ${port} not listening${NC}"
        return 1
    fi

    # Try HTTP request
    if response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 ${url} 2>/dev/null); then
        if [ "$response" -ge 200 ] && [ "$response" -lt 500 ]; then
            echo -e "${GREEN}✓ UP (HTTP ${response})${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Responding but HTTP ${response}${NC}"
            return 2
        fi
    else
        echo -e "${RED}✗ Not responding${NC}"
        return 1
    fi
}

# Function to check MongoDB
check_mongodb() {
    echo -n "Checking MongoDB... "

    if command -v mongosh > /dev/null 2>&1; then
        if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Connected${NC}"
            return 0
        fi
    elif command -v mongo > /dev/null 2>&1; then
        if mongo --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Connected${NC}"
            return 0
        fi
    fi

    echo -e "${YELLOW}⚠ Not running or not accessible${NC}"
    return 1
}

# Function to check Redis
check_redis() {
    echo -n "Checking Redis... "

    if command -v redis-cli > /dev/null 2>&1; then
        if redis-cli ping > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Connected${NC}"
            return 0
        fi
    fi

    echo -e "${YELLOW}⚠ Not running or not accessible${NC}"
    return 1
}

# Main health check
echo -e "${BLUE}[Infrastructure]${NC}"
check_mongodb
check_redis
echo ""

echo -e "${BLUE}[Backend APIs]${NC}"
check_service "Admin API" "http://localhost:3002/health" || admin_down=1
check_service "Marketplace API" "http://localhost:3004/health" || marketplace_down=1
check_service "Access API" "http://localhost:3005/health" || access_down=1
echo ""

echo -e "${BLUE}[Frontend Apps]${NC}"
check_service "Admin Dashboard" "http://localhost:3003" || admin_fe_down=1
check_service "Marketplace" "http://localhost:3000" || marketplace_fe_down=1
check_service "Event Page" "http://localhost:3006" || event_down=1
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"

down_count=0
[[ -n "$admin_down" ]] && ((down_count++))
[[ -n "$marketplace_down" ]] && ((down_count++))
[[ -n "$access_down" ]] && ((down_count++))
[[ -n "$admin_fe_down" ]] && ((down_count++))
[[ -n "$marketplace_fe_down" ]] && ((down_count++))
[[ -n "$event_down" ]] && ((down_count++))

if [ $down_count -eq 0 ]; then
    echo -e "${GREEN}✓ All services are healthy${NC}"
    exit 0
elif [ $down_count -le 2 ]; then
    echo -e "${YELLOW}⚠ ${down_count} service(s) down${NC}"
    exit 1
else
    echo -e "${RED}✗ ${down_count} services down - system degraded${NC}"
    exit 2
fi
