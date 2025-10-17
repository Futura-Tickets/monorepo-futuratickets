#!/bin/bash

# validate-config.sh
# Validates all configuration files before starting services
# Helps catch configuration issues early

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Validating FuturaTickets Configuration..."
echo ""

# Counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Function to check file exists
check_file_exists() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description exists"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}✗${NC} $description not found: $file"
        echo "   💡 Copy from .env.example: cp ${file%.development}.example $file"
        ((ERRORS++))
        return 1
    fi
}

# Function to check environment variable in file
check_env_var() {
    local file=$1
    local var_name=$2
    local description=$3

    if [ ! -f "$file" ]; then
        return 1
    fi

    if grep -q "^${var_name}=" "$file"; then
        local value=$(grep "^${var_name}=" "$file" | cut -d'=' -f2-)
        if [ -z "$value" ] || [ "$value" = "your_value_here" ] || [ "$value" = "pk_test_your_key_here" ]; then
            echo -e "${YELLOW}⚠${NC} $description is set but may need configuration"
            ((WARNINGS++))
        else
            echo -e "${GREEN}✓${NC} $description is configured"
            ((SUCCESS++))
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $description not found in $file"
        ((ERRORS++))
        return 1
    fi
}

# Function to check port availability
check_port_available() {
    local port=$1
    local service=$2

    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} Port $port ($service) is already in use"
        echo "   Process using port: $(lsof -i :$port | tail -1)"
        ((WARNINGS++))
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $port ($service) is available"
        ((SUCCESS++))
        return 0
    fi
}

# Function to validate MongoDB URL format
validate_mongo_url() {
    local file=$1
    local description=$2

    if [ ! -f "$file" ]; then
        return 1
    fi

    if grep -q "^MONGO_URL=" "$file"; then
        local mongo_url=$(grep "^MONGO_URL=" "$file" | cut -d'=' -f2-)

        # Check basic MongoDB URL format
        if [[ $mongo_url =~ ^mongodb:// ]]; then
            echo -e "${GREEN}✓${NC} $description has valid MongoDB URL format"
            ((SUCCESS++))

            # Check if it contains credentials
            if [[ $mongo_url =~ mongodb://[^:]+:[^@]+@ ]]; then
                echo -e "${GREEN}✓${NC} $description includes authentication credentials"
                ((SUCCESS++))
            else
                echo -e "${YELLOW}⚠${NC} $description may be missing authentication"
                ((WARNINGS++))
            fi

            return 0
        else
            echo -e "${RED}✗${NC} $description has invalid MongoDB URL format"
            ((ERRORS++))
            return 1
        fi
    else
        echo -e "${RED}✗${NC} MONGO_URL not found in $file"
        ((ERRORS++))
        return 1
    fi
}

echo "═══════════════════════════════════════"
echo "📁 Checking Configuration Files"
echo "═══════════════════════════════════════"
echo ""

# Check Backend .env.development files
echo "Backend APIs:"
check_file_exists "futura-tickets-admin-api/.env.development" "Admin API .env.development"
check_file_exists "futura-market-place-api/.env.development" "Marketplace API .env.development"
check_file_exists "futura-access-api/.env.development" "Access API .env.development"
echo ""

# Check Frontend .env.local files
echo "Frontend Apps:"
check_file_exists "futura-market-place-v2/.env.local" "Marketplace Frontend .env.local"
check_file_exists "futura-tickets-admin/.env.local" "Admin Frontend .env.local"
echo ""

echo "═══════════════════════════════════════"
echo "🔐 Validating Critical Variables"
echo "═══════════════════════════════════════"
echo ""

# Admin API
echo "Admin API (Port 4101):"
check_env_var "futura-tickets-admin-api/.env.development" "PORT" "PORT"
check_env_var "futura-tickets-admin-api/.env.development" "JWT_SECRET_KEY" "JWT_SECRET_KEY"
validate_mongo_url "futura-tickets-admin-api/.env.development" "Admin API"
echo ""

# Marketplace API
echo "Marketplace API (Port 4102):"
check_env_var "futura-market-place-api/.env.development" "PORT" "PORT"
check_env_var "futura-market-place-api/.env.development" "JWT_SECRET_KEY" "JWT_SECRET_KEY"
validate_mongo_url "futura-market-place-api/.env.development" "Marketplace API"
echo ""

# Access API
echo "Access API (Port 4103):"
check_env_var "futura-access-api/.env.development" "PORT" "PORT"
validate_mongo_url "futura-access-api/.env.development" "Access API"
echo ""

# Frontend configurations
echo "Marketplace Frontend:"
check_env_var "futura-market-place-v2/.env.local" "NEXT_PUBLIC_FUTURA_API" "Admin API endpoint"
check_env_var "futura-market-place-v2/.env.local" "NEXT_PUBLIC_FUTURA" "Marketplace API endpoint"
check_env_var "futura-market-place-v2/.env.local" "NEXT_PUBLIC_REFACTOR_RESALE_API" "Access API endpoint"
echo ""

echo "Admin Frontend:"
check_env_var "futura-tickets-admin/.env.local" "NEXT_PUBLIC_FUTURA" "Admin API endpoint"
check_env_var "futura-tickets-admin/.env.local" "NEXT_PUBLIC_SOCKET_URL" "Socket.IO endpoint"
echo ""

echo "═══════════════════════════════════════"
echo "🔌 Checking Port Availability"
echo "═══════════════════════════════════════"
echo ""

# Check application ports
check_port_available 4101 "Admin API"
check_port_available 4102 "Marketplace API"
check_port_available 4103 "Access API"
check_port_available 3000 "Marketplace Frontend"
check_port_available 3003 "Admin Frontend"
echo ""

# Check infrastructure ports (Docker)
echo "Infrastructure Ports (Docker):"
check_port_available 27017 "MongoDB"
check_port_available 6379 "Redis"
check_port_available 9000 "MinIO API"
check_port_available 9001 "MinIO Console"
check_port_available 8081 "Mongo Express"
echo ""

echo "═══════════════════════════════════════"
echo "🐳 Checking Docker Availability"
echo "═══════════════════════════════════════"
echo ""

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker command is available"
    ((SUCCESS++))

    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
        ((SUCCESS++))
    else
        echo -e "${RED}✗${NC} Docker daemon is not running"
        echo "   💡 Start Docker Desktop or run: sudo systemctl start docker"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Docker is not installed"
    echo "   💡 Install Docker: https://docs.docker.com/get-docker/"
    ((ERRORS++))
fi
echo ""

echo "═══════════════════════════════════════"
echo "📊 Validation Summary"
echo "═══════════════════════════════════════"
echo ""
echo -e "${GREEN}✓ Passed:${NC} $SUCCESS"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo -e "${RED}✗ Errors:${NC} $ERRORS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Configuration validation FAILED${NC}"
    echo ""
    echo "Please fix the errors above before starting services."
    echo ""
    echo "Quick fixes:"
    echo "  • Copy .env.example files: ./scripts/setup-env.sh"
    echo "  • Install Docker: https://docs.docker.com/get-docker/"
    echo "  • Stop conflicting services: ./stop-all.sh"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Configuration validation passed with WARNINGS${NC}"
    echo ""
    echo "The system should work, but check the warnings above."
    echo "Some features may require additional configuration."
    echo ""
    exit 0
else
    echo -e "${GREEN}✅ Configuration validation PASSED${NC}"
    echo ""
    echo "All checks passed! You're ready to start the services."
    echo ""
    exit 0
fi
