#!/bin/bash

# 🔐 SECURITY AUDIT SCRIPT
# Ejecuta múltiples herramientas de análisis de seguridad

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🔐 SECURITY AUDIT - FuturaTickets Contracts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create audit reports directory
mkdir -p audit-reports
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="audit-reports/${TIMESTAMP}"
mkdir -p "${REPORT_DIR}"

echo -e "${YELLOW}📁 Reports will be saved to: ${REPORT_DIR}${NC}"
echo ""

# ==================== 1. SLITHER ANALYSIS ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   1️⃣  SLITHER STATIC ANALYSIS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command -v slither &> /dev/null; then
    echo -e "${GREEN}✅ Slither found${NC}"

    echo "Running Slither on FuturaEventFactory..."
    slither contracts/FuturaEventFactory.sol \
        --json "${REPORT_DIR}/slither-factory.json" \
        --print human-summary \
        2>&1 | tee "${REPORT_DIR}/slither-factory.txt" || true

    echo ""
    echo "Running Slither on FuturaEvent..."
    slither contracts/FuturaEvent.sol \
        --json "${REPORT_DIR}/slither-event.json" \
        --print human-summary \
        2>&1 | tee "${REPORT_DIR}/slither-event.txt" || true

    echo ""
    echo -e "${GREEN}✅ Slither analysis complete${NC}"
else
    echo -e "${YELLOW}⚠️  Slither not installed${NC}"
    echo -e "${YELLOW}   Install: pip3 install slither-analyzer${NC}"
    echo -e "${YELLOW}   Skipping Slither analysis...${NC}"
fi

echo ""

# ==================== 2. SOLHINT SECURITY ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   2️⃣  SOLHINT SECURITY LINTER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command -v npx solhint &> /dev/null; then
    echo -e "${GREEN}✅ Solhint found${NC}"
    npx solhint 'contracts/**/*.sol' --max-warnings 0 \
        2>&1 | tee "${REPORT_DIR}/solhint.txt" || true
    echo -e "${GREEN}✅ Solhint analysis complete${NC}"
else
    echo -e "${YELLOW}⚠️  Solhint not available${NC}"
fi

echo ""

# ==================== 3. GAS OPTIMIZATION ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   3️⃣  GAS OPTIMIZATION ANALYSIS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Running tests with gas reporter..."
REPORT_GAS=true npx hardhat test \
    2>&1 | tee "${REPORT_DIR}/gas-report.txt"

if [ -f "gas-report.txt" ]; then
    cp gas-report.txt "${REPORT_DIR}/"
    echo -e "${GREEN}✅ Gas report saved${NC}"
fi

echo ""

# ==================== 4. TEST COVERAGE ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   4️⃣  TEST COVERAGE ANALYSIS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Running coverage analysis..."
npx hardhat coverage \
    2>&1 | tee "${REPORT_DIR}/coverage.txt"

if [ -f "coverage.json" ]; then
    cp coverage.json "${REPORT_DIR}/"
    echo -e "${GREEN}✅ Coverage report saved${NC}"
fi

if [ -d "coverage" ]; then
    echo -e "${GREEN}✅ HTML coverage report available in coverage/index.html${NC}"
fi

echo ""

# ==================== 5. CONTRACT SIZE CHECK ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   5️⃣  CONTRACT SIZE CHECK${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Checking contract sizes..."
npx hardhat size-contracts 2>&1 | tee "${REPORT_DIR}/contract-sizes.txt" || {
    echo -e "${YELLOW}⚠️  hardhat-contract-sizer not installed${NC}"
    echo -e "${YELLOW}   Install: npm install --save-dev hardhat-contract-sizer${NC}"
}

echo ""

# ==================== 6. DEPENDENCIES AUDIT ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   6️⃣  NPM DEPENDENCIES AUDIT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Auditing npm dependencies..."
npm audit --json > "${REPORT_DIR}/npm-audit.json" 2>&1 || true
npm audit 2>&1 | tee "${REPORT_DIR}/npm-audit.txt" || true

echo ""

# ==================== 7. MYTHRIL (if available) ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   7️⃣  MYTHRIL SYMBOLIC EXECUTION (Optional)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command -v myth &> /dev/null; then
    echo -e "${GREEN}✅ Mythril found${NC}"
    echo "Running Mythril analysis (this may take several minutes)..."

    myth analyze contracts/FuturaEvent.sol \
        --solv 0.8.25 \
        --max-depth 10 \
        2>&1 | tee "${REPORT_DIR}/mythril-event.txt" || true

    echo -e "${GREEN}✅ Mythril analysis complete${NC}"
else
    echo -e "${YELLOW}⚠️  Mythril not installed (optional)${NC}"
    echo -e "${YELLOW}   Install: pip3 install mythril${NC}"
fi

echo ""

# ==================== SUMMARY ====================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   📊 AUDIT SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Security audit completed${NC}"
echo -e "${GREEN}📁 Reports saved to: ${REPORT_DIR}${NC}"
echo ""

echo "Generated reports:"
ls -lh "${REPORT_DIR}/" | tail -n +2

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Review all reports in: ${REPORT_DIR}/"
echo "2. Fix any HIGH or CRITICAL issues found"
echo "3. Consider professional audit before mainnet"
echo "4. Update SECURITY.md with findings"
echo ""

# Create summary report
cat > "${REPORT_DIR}/SUMMARY.md" << EOF
# Security Audit Summary

**Date:** $(date)
**Version:** $(grep '"version":' package.json | cut -d'"' -f4)

## Reports Generated

$(ls -1 "${REPORT_DIR}/" | grep -v SUMMARY.md | sed 's/^/- /')

## Key Metrics

- **Test Coverage:** Check coverage.txt
- **Gas Optimization:** Check gas-report.txt
- **Security Issues:** Check slither-*.txt and solhint.txt
- **Dependencies:** Check npm-audit.txt

## Next Steps

1. ⚠️  Review all HIGH and CRITICAL findings
2. 🔧 Fix identified vulnerabilities
3. 🧪 Re-run audit after fixes
4. 📝 Update documentation with security notes
5. 💰 Consider professional audit for mainnet

## Recommendations

- [ ] Fix all critical issues before testnet deployment
- [ ] Implement missing test cases (aim for >90% coverage)
- [ ] Optimize gas usage where possible
- [ ] Update dependencies with vulnerabilities
- [ ] Add security documentation
- [ ] Set up bug bounty program before mainnet

---
**Generated by:** security-audit.sh
**Audit ID:** ${TIMESTAMP}
EOF

echo -e "${GREEN}✅ Summary report created: ${REPORT_DIR}/SUMMARY.md${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 AUDIT COMPLETE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
