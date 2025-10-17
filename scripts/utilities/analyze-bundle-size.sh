#!/bin/bash
# ANALYZE BUNDLE SIZE - Analiza tamaño de bundles de Next.js
YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'
echo -e "${YELLOW}====== BUNDLE SIZE ANALYSIS ======${NC}\n"

for frontend in futura-market-place-v2 futura-tickets-admin futura-tickets-access-app; do
    if [ -d "$frontend/.next" ]; then
        echo -e "${GREEN}$frontend:${NC}"
        du -sh "$frontend/.next" 2>/dev/null || echo "No build found"
        [ -d "$frontend/.next/static" ] && {
            echo "  Static: $(du -sh $frontend/.next/static | awk '{print $1}')"
        }
        echo ""
    fi
done
echo -e "${YELLOW}Tip: Run 'npm run build' first in each frontend${NC}"
