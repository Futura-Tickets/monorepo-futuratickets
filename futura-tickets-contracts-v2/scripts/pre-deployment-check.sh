#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#   🔍 PRE-DEPLOYMENT VALIDATION SCRIPT
#   FuturaTickets Smart Contracts v2.0.3
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🔍 PRE-DEPLOYMENT VALIDATION${NC}"
echo -e "${BLUE}   Version: 2.0.3${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1: ENVIRONMENT CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   1️⃣  ENVIRONMENT CHECKS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check .env file exists
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ .env file NOT found${NC}"
    echo -e "${YELLOW}   → Run: cp .env.example .env${NC}"
    ((FAILED++))
fi

# Check ALCHEMY_API_KEY
if grep -q "^ALCHEMY_API_KEY=" .env 2>/dev/null && ! grep -q "^ALCHEMY_API_KEY=$" .env && ! grep -q "^ALCHEMY_API_KEY=your_" .env; then
    echo -e "${GREEN}✅ ALCHEMY_API_KEY configured${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ ALCHEMY_API_KEY not configured${NC}"
    echo -e "${YELLOW}   → Get from: https://dashboard.alchemy.com/${NC}"
    ((FAILED++))
fi

# Check BASESCAN_API_KEY
if grep -q "^BASESCAN_API_KEY=" .env 2>/dev/null && ! grep -q "^BASESCAN_API_KEY=$" .env && ! grep -q "^BASESCAN_API_KEY=your_" .env; then
    echo -e "${GREEN}✅ BASESCAN_API_KEY configured${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ BASESCAN_API_KEY not configured${NC}"
    echo -e "${YELLOW}   → Get from: https://basescan.org/apis${NC}"
    ((FAILED++))
fi

# Check DEPLOYER_PRIVATE_KEY
if grep -q "^DEPLOYER_PRIVATE_KEY=0x" .env 2>/dev/null && ! grep -q "^DEPLOYER_PRIVATE_KEY=0x0000000000000000" .env; then
    echo -e "${GREEN}✅ DEPLOYER_PRIVATE_KEY configured${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ DEPLOYER_PRIVATE_KEY not configured${NC}"
    echo -e "${YELLOW}   → See: READY_TO_DEPLOY.md (Step 1)${NC}"
    ((FAILED++))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2: CODE QUALITY CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   2️⃣  CODE QUALITY CHECKS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Solhint warnings
echo -n "Checking Solhint... "
SOLHINT_OUTPUT=$(npx solhint 'contracts/**/*.sol' 2>&1 || true)
if echo "$SOLHINT_OUTPUT" | grep -q "error" || echo "$SOLHINT_OUTPUT" | grep -q "warning"; then
    WARNING_COUNT=$(echo "$SOLHINT_OUTPUT" | grep -c "warning" || echo "0")
    ERROR_COUNT=$(echo "$SOLHINT_OUTPUT" | grep -c "error" || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ $ERROR_COUNT errors found${NC}"
        ((FAILED++))
    elif [ "$WARNING_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNING_COUNT warnings found${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ No issues${NC}"
        ((PASSED++))
    fi
else
    echo -e "${GREEN}✅ No issues${NC}"
    ((PASSED++))
fi

# Check contracts compiled
if [ -d "artifacts/contracts" ]; then
    echo -e "${GREEN}✅ Contracts compiled${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Contracts not compiled${NC}"
    echo -e "${YELLOW}   → Run: npm run compile${NC}"
    ((WARNINGS++))
fi

# Check ABIs exported
if [ -f "abi/FuturaEvent.json" ] && [ -f "abi/FuturaEventFactory.json" ]; then
    echo -e "${GREEN}✅ ABIs exported${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  ABIs not exported${NC}"
    echo -e "${YELLOW}   → Run: npm run export-abis${NC}"
    ((WARNINGS++))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3: TESTING CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   3️⃣  TESTING CHECKS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run tests
echo "Running tests (this may take a moment)..."
if npm test > /tmp/test-output.txt 2>&1; then
    PASSING=$(grep -o "[0-9]* passing" /tmp/test-output.txt | grep -o "[0-9]*" || echo "0")
    echo -e "${GREEN}✅ All tests passing ($PASSING tests)${NC}"
    ((PASSED++))
else
    FAILING=$(grep -o "[0-9]* failing" /tmp/test-output.txt | grep -o "[0-9]*" || echo "?")
    echo -e "${RED}❌ Tests failing ($FAILING tests)${NC}"
    echo -e "${YELLOW}   → Run: npm test${NC}"
    ((FAILED++))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4: DOCUMENTATION CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   4️⃣  DOCUMENTATION CHECKS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOCS=("READY_TO_DEPLOY.md" "DEPLOYMENT_GUIDE.md" "CHANGELOG.md" "SECURITY.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc exists${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $doc missing${NC}"
        ((FAILED++))
    fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 5: NETWORK CONNECTIVITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   5️⃣  NETWORK CONNECTIVITY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Base Sepolia status
if curl -s --max-time 5 https://sepolia.basescan.org > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Base Sepolia block explorer reachable${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Base Sepolia block explorer unreachable${NC}"
    echo -e "${YELLOW}   → Check: https://base.statuspage.io/${NC}"
    ((WARNINGS++))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   📊 VALIDATION SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "  ${GREEN}✅ Passed:   $PASSED${NC}"
echo -e "  ${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "  ${RED}❌ Failed:   $FAILED${NC}"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo -e "  Success Rate: ${SUCCESS_RATE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}   ✅ ALL CHECKS PASSED - READY TO DEPLOY${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${BLUE}Next step:${NC}"
        echo -e "  npm run deploy:baseSepolia"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}   ⚠️  READY WITH WARNINGS${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${BLUE}Fix warnings (optional) or proceed:${NC}"
        echo -e "  npm run deploy:baseSepolia"
        echo ""
        exit 0
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}   ❌ NOT READY - FIX ERRORS FIRST${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Fix the errors above, then:${NC}"
    echo -e "  ./scripts/pre-deployment-check.sh"
    echo ""
    exit 1
fi
