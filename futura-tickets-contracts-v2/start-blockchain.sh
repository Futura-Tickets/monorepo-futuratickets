#!/bin/bash

# 🔗 TERMINAL 4: BLOCKCHAIN - Hardhat Node Startup Script
# ========================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🔗 FUTURA TICKETS - BLOCKCHAIN NODE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# Clean artifacts
echo -e "${YELLOW}🧹 Cleaning artifacts...${NC}"
npx hardhat clean > /dev/null 2>&1
echo -e "${GREEN}✅ Artifacts cleaned${NC}"
echo ""

# Compile contracts
echo -e "${YELLOW}📝 Compiling contracts...${NC}"
npx hardhat compile
echo -e "${GREEN}✅ Contracts compiled${NC}"
echo ""

# Display information
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Ready to start Hardhat node!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}ℹ️  Node will run on: http://127.0.0.1:8545${NC}"
echo -e "${YELLOW}ℹ️  Factory will be deployed automatically${NC}"
echo ""
echo -e "${BLUE}Starting Hardhat node...${NC}"
echo ""

# Start node
npx hardhat node
