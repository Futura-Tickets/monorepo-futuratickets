#!/bin/bash

# 🔄 Sync ABIs to Backend Services
# This script copies compiled ABIs to all backend services that need them

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONOREPO_ROOT="$(dirname "$PROJECT_ROOT")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   🔄 SYNCING ABIs TO BACKEND SERVICES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if ABIs exist
if [ ! -d "$PROJECT_ROOT/abi" ]; then
    echo -e "${YELLOW}⚠️  ABIs not found. Running export-abis first...${NC}"
    cd "$PROJECT_ROOT"
    npm run export-abis
    echo ""
fi

# Define backend services that need ABIs
BACKENDS=(
    "futura-tickets-admin-api"
    "futura-tickets-rest-api"
    "futura-market-place-api"
    "futura-access-api"
)

SYNCED_COUNT=0

for BACKEND in "${BACKENDS[@]}"; do
    BACKEND_PATH="$MONOREPO_ROOT/$BACKEND"

    if [ ! -d "$BACKEND_PATH" ]; then
        echo -e "${YELLOW}⚠️  Skipping $BACKEND (directory not found)${NC}"
        continue
    fi

    # Create abis directory if it doesn't exist
    ABI_DEST="$BACKEND_PATH/src/abis"
    mkdir -p "$ABI_DEST"

    # Copy ABIs
    echo -e "${BLUE}📦 Syncing to $BACKEND...${NC}"
    cp "$PROJECT_ROOT/abi/FuturaEvent.json" "$ABI_DEST/" 2>/dev/null || echo "  → FuturaEvent.json (skipped)"
    cp "$PROJECT_ROOT/abi/FuturaEventFactory.json" "$ABI_DEST/" 2>/dev/null || echo "  → FuturaEventFactory.json (skipped)"
    cp "$PROJECT_ROOT/abi/index.ts" "$ABI_DEST/" 2>/dev/null || echo "  → index.ts (skipped)"

    echo -e "${GREEN}✅ $BACKEND synced${NC}"
    ((SYNCED_COUNT++))
    echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ABIs synced to $SYNCED_COUNT backend(s)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
