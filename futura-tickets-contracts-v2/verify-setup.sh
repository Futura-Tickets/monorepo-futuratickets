#!/bin/bash

# 🔍 Verify Blockchain Development Setup
# =======================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🔍 VERIFYING BLOCKCHAIN SETUP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Node.js
echo -n "🔹 Node.js version... "
if command -v node &> /dev/null; then
    VERSION=$(node -v)
    echo -e "${GREEN}✅ $VERSION${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    ((ERRORS++))
fi

# Check npm
echo -n "🔹 npm version... "
if command -v npm &> /dev/null; then
    VERSION=$(npm -v)
    echo -e "${GREEN}✅ $VERSION${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
    ((ERRORS++))
fi

# Check node_modules
echo -n "🔹 Dependencies installed... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Yes${NC}"
else
    echo -e "${YELLOW}⚠️  Run: npm install --legacy-peer-deps${NC}"
    ((ERRORS++))
fi

# Check .env file
echo -n "🔹 .env file exists... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Yes${NC}"
else
    echo -e "${YELLOW}⚠️  Run: cp .env.example .env${NC}"
fi

# Check compiled contracts
echo -n "🔹 Contracts compiled... "
if [ -d "artifacts/contracts" ]; then
    echo -e "${GREEN}✅ Yes${NC}"
else
    echo -e "${YELLOW}⚠️  Run: npm run compile${NC}"
fi

# Check ABIs exported
echo -n "🔹 ABIs exported... "
if [ -f "abi/FuturaEvent.json" ] && [ -f "abi/FuturaEventFactory.json" ]; then
    echo -e "${GREEN}✅ Yes${NC}"
else
    echo -e "${YELLOW}⚠️  Run: npm run export-abis${NC}"
fi

# Check Hardhat node running
echo -n "🔹 Hardhat node running... "
if curl -s http://127.0.0.1:8545 -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    | grep -q "result"; then
    echo -e "${GREEN}✅ Running on http://127.0.0.1:8545${NC}"
else
    echo -e "${YELLOW}⚠️  Run: ./start-blockchain.sh${NC}"
fi

# Check backend directories for ABI sync
echo ""
echo -e "${BLUE}📦 Backend ABI Sync Status:${NC}"

BACKENDS=(
    "futura-tickets-admin-api"
    "futura-tickets-rest-api"
    "futura-market-place-api"
    "futura-access-api"
)

for BACKEND in "${BACKENDS[@]}"; do
    echo -n "   → $BACKEND... "
    BACKEND_PATH="../$BACKEND/src/abis"
    if [ -f "$BACKEND_PATH/FuturaEvent.json" ]; then
        echo -e "${GREEN}✅ Synced${NC}"
    else
        if [ -d "../$BACKEND" ]; then
            echo -e "${YELLOW}⚠️  Run: npm run sync-abis${NC}"
        else
            echo -e "⏭️  Skipped (not found)"
        fi
    fi
done

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo -e "${BLUE}🚀 You're ready to go!${NC}"
    echo ""
    echo "Next steps:"
    echo "  • Start local node: ./start-blockchain.sh"
    echo "  • Run tests: npm test"
    echo "  • Build & sync: npm run build"
else
    echo -e "${YELLOW}⚠️  $ERRORS ISSUES FOUND${NC}"
    echo ""
    echo "Please fix the issues above before continuing."
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
