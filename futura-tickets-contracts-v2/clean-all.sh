#!/bin/bash

# 🧹 Clean All - Complete Environment Reset
# ==========================================
# Use this script when you need to completely reset the blockchain development environment

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🧹 CLEANING BLOCKCHAIN ENVIRONMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Stop any running Hardhat nodes
echo -e "${YELLOW}🛑 Stopping Hardhat nodes...${NC}"
lsof -ti:8545 | xargs kill -9 2>/dev/null || echo "   → No nodes running"
echo -e "${GREEN}✅ Hardhat nodes stopped${NC}"
echo ""

# Clean Hardhat artifacts
echo -e "${YELLOW}🗑️  Cleaning Hardhat artifacts...${NC}"
rm -rf artifacts/
rm -rf cache/
rm -rf typechain/
rm -rf deployments/localhost/
echo -e "${GREEN}✅ Hardhat artifacts cleaned${NC}"
echo ""

# Clean ABIs
echo -e "${YELLOW}🗑️  Cleaning exported ABIs...${NC}"
rm -rf abi/
echo -e "${GREEN}✅ ABIs cleaned${NC}"
echo ""

# Clean coverage reports
echo -e "${YELLOW}🗑️  Cleaning coverage reports...${NC}"
rm -rf coverage/
rm -f coverage.json
rm -f gas-report.txt
echo -e "${GREEN}✅ Coverage reports cleaned${NC}"
echo ""

# Clean node_modules (optional - uncomment if needed)
# echo -e "${YELLOW}🗑️  Cleaning node_modules...${NC}"
# rm -rf node_modules/
# echo -e "${GREEN}✅ node_modules cleaned${NC}"
# echo ""

# Clean backup files
echo -e "${YELLOW}🗑️  Cleaning backup files...${NC}"
rm -rf .backup/
echo -e "${GREEN}✅ Backup files cleaned${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ENVIRONMENT CLEANED${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "  1. ${BLUE}npm install --legacy-peer-deps${NC}  (if you cleaned node_modules)"
echo -e "  2. ${BLUE}npm run build${NC}                   (compile + export ABIs + sync)"
echo -e "  3. ${BLUE}./start-blockchain.sh${NC}           (start fresh node)"
echo ""
echo -e "${YELLOW}ℹ️  To also clean node_modules, edit this script and uncomment the line${NC}"
echo ""
