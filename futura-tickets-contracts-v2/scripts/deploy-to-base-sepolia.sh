#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#   🚀 BASE SEPOLIA DEPLOYMENT SCRIPT
#   FuturaTickets Smart Contracts v2.0.3
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🚀 DEPLOYING TO BASE SEPOLIA TESTNET${NC}"
echo -e "${BLUE}   Version: 2.0.3${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}   → Copy .env.example to .env and configure${NC}"
    exit 1
fi

source .env

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1: PRE-FLIGHT CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   1️⃣  PRE-FLIGHT CHECKS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check ALCHEMY_API_KEY
if [ -z "$ALCHEMY_API_KEY" ] || [ "$ALCHEMY_API_KEY" = "your_alchemy_api_key_here" ]; then
    echo -e "${RED}❌ ALCHEMY_API_KEY not configured${NC}"
    echo -e "${YELLOW}   → Get from: https://dashboard.alchemy.com/${NC}"
    echo ""
    echo -e "${BLUE}Steps to get Alchemy API Key:${NC}"
    echo "   1. Visit https://dashboard.alchemy.com/"
    echo "   2. Create free account"
    echo "   3. Create new app (Chain: Base, Network: Base Sepolia)"
    echo "   4. Copy API KEY"
    echo "   5. Update .env: ALCHEMY_API_KEY=<your_key>"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ ALCHEMY_API_KEY configured${NC}"

# Check DEPLOYER_PRIVATE_KEY
if [ -z "$DEPLOYER_PRIVATE_KEY" ] || [ "$DEPLOYER_PRIVATE_KEY" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo -e "${RED}❌ DEPLOYER_PRIVATE_KEY not configured${NC}"
    echo -e "${YELLOW}   → See DEPLOYMENT_STATUS.md for wallet info${NC}"
    exit 1
fi
echo -e "${GREEN}✅ DEPLOYER_PRIVATE_KEY configured${NC}"

# Check BASESCAN_API_KEY (optional but recommended)
if [ -z "$BASESCAN_API_KEY" ] || [ "$BASESCAN_API_KEY" = "your_basescan_api_key_here" ]; then
    echo -e "${YELLOW}⚠️  BASESCAN_API_KEY not configured (contract won't be verified)${NC}"
    echo -e "${YELLOW}   → Get from: https://basescan.org/myapikey${NC}"
    echo ""
    read -p "Continue without verification? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ BASESCAN_API_KEY configured${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2: CHECK DEPLOYER BALANCE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   2️⃣  CHECKING DEPLOYER BALANCE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check balance
if npx ts-node scripts/check-balance.ts; then
    echo -e "${GREEN}✅ Sufficient balance for deployment${NC}"
else
    echo -e "${RED}❌ Insufficient balance${NC}"
    echo ""
    echo -e "${BLUE}Get testnet ETH from these faucets:${NC}"
    echo "   1. QuickNode: https://faucet.quicknode.com/base/sepolia (0.1 ETH)"
    echo "   2. Alchemy: https://sepoliafaucet.com (0.5 ETH)"
    echo ""
    echo "Wallet address: $DEPLOYER"
    echo ""
    exit 1
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3: DEPLOYMENT CONFIRMATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   3️⃣  DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Network: Base Sepolia (Chain ID: 84532)"
echo "📍 Deployer: $DEPLOYER"
echo "📦 Contract: FuturaEventFactory"
echo "⛽ Estimated Gas: ~2,500,000"
echo "💰 Estimated Cost: ~0.002-0.005 ETH"
echo ""

read -p "Proceed with deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4: EXECUTE DEPLOYMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   4️⃣  DEPLOYING CONTRACT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run deployment
npx hardhat deploy --network baseSepolia

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Get factory address from deployment file
    if [ -f deployments/baseSepolia/FuturaEventFactory.json ]; then
        FACTORY_ADDRESS=$(cat deployments/baseSepolia/FuturaEventFactory.json | grep -o '"address":"[^"]*"' | head -1 | sed 's/"address":"\([^"]*\)"/\1/')
        echo "📝 Contract Address: $FACTORY_ADDRESS"
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}   📋 NEXT STEPS${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "1. Update backend .env files with:"
        echo "   BLOCKCHAIN_FACTORY_ADDRESS=$FACTORY_ADDRESS"
        echo ""
        echo "2. Verify on Basescan:"
        echo "   https://sepolia.basescan.org/address/$FACTORY_ADDRESS"
        echo ""
        echo "3. Restart backend services:"
        echo "   cd .. && ./stop-all.sh && ./start-all.sh"
        echo ""
    fi
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}   ❌ DEPLOYMENT FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Check the error above and:"
    echo "   1. Verify API keys are correct"
    echo "   2. Ensure sufficient balance"
    echo "   3. Check network status: https://base.statuspage.io/"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
