#!/bin/bash

# SETUP DEV ENVIRONMENT
# Script para configurar entorno de desarrollo desde cero
# Uso: ./setup-dev-environment.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FUTURA TICKETS - Dev Environment Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm ${NPM_VERSION} installed${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

# Check MongoDB
echo -e "${YELLOW}Checking MongoDB...${NC}"
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB CLI installed${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB CLI not found (optional)${NC}"
fi

# Check Docker
echo -e "${YELLOW}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | tr -d ',')
    echo -e "${GREEN}✓ Docker ${DOCKER_VERSION} installed${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found (optional)${NC}"
fi

echo ""
echo -e "${BLUE}Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${YELLOW}Installing Admin API dependencies...${NC}"
cd futura-tickets-admin-api && npm install --legacy-peer-deps && cd ..
echo -e "${GREEN}✓ Admin API ready${NC}"

echo -e "${YELLOW}Installing Marketplace API dependencies...${NC}"
cd futura-market-place-api && npm install --legacy-peer-deps && cd ..
echo -e "${GREEN}✓ Marketplace API ready${NC}"

echo -e "${YELLOW}Installing Access API dependencies...${NC}"
cd futura-access-api && npm install --legacy-peer-deps && cd ..
echo -e "${GREEN}✓ Access API ready${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing Marketplace V2 dependencies...${NC}"
cd futura-market-place-v2 && npm install --legacy-peer-deps && cd ..
echo -e "${GREEN}✓ Marketplace V2 ready${NC}"

echo -e "${YELLOW}Installing Admin Panel dependencies...${NC}"
cd futura-tickets-admin && npm install --legacy-peer-deps && cd ..
echo -e "${GREEN}✓ Admin Panel ready${NC}"

echo -e "${YELLOW}Installing Access Web dependencies...${NC}"
cd futura-tickets-access-app && npm install --legacy-peer-deps && cd ..
echo -e "${GREEN}✓ Access Web ready${NC}"

echo ""
echo -e "${BLUE}Checking .env files...${NC}"

check_env() {
    local service=$1
    local env_file="$service/.env"
    
    if [ -f "$env_file" ]; then
        echo -e "${GREEN}✓ ${service}/.env exists${NC}"
    else
        echo -e "${YELLOW}⚠️  ${service}/.env missing (copy from .env.example)${NC}"
    fi
}

check_env "futura-tickets-admin-api"
check_env "futura-market-place-api"
check_env "futura-access-api"
check_env "futura-market-place-v2"
check_env "futura-tickets-admin"
check_env "futura-tickets-access-app"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Configure .env files for each service"
echo -e "2. Start all services: ${YELLOW}./start-all.sh${NC}"
echo -e "3. Run smoke tests: ${YELLOW}./scripts/utilities/smoke-tests.sh${NC}"
echo ""
