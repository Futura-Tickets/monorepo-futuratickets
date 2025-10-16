#!/bin/bash

# FuturaTickets Branch Sync Script
# Synchronizes all main branches with remote
# Usage: ./scripts/sync-branches.sh [--all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SYNC_ALL=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all|-a)
            SYNC_ALL=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Branch Sync${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} ${CURRENT_BRANCH}"
echo ""

# Fetch all updates
echo -e "${BLUE}Fetching updates from remote...${NC}"
git fetch origin --prune

echo ""
echo -e "${BLUE}Syncing branches...${NC}"
echo ""

# Branches to sync
MAIN_BRANCHES=("main" "staging" "dev")

for branch in "${MAIN_BRANCHES[@]}"; do
    echo -e "${BLUE}━━━ Syncing ${branch} ━━━${NC}"

    # Check if branch exists locally
    if git show-ref --verify --quiet refs/heads/"$branch"; then
        git checkout "$branch" 2>/dev/null || {
            echo -e "${YELLOW}⚠ Cannot checkout ${branch} (might have uncommitted changes)${NC}"
            continue
        }

        # Pull updates
        if git pull origin "$branch" --ff-only; then
            echo -e "${GREEN}✓ ${branch} synced successfully${NC}"
        else
            echo -e "${RED}✗ Failed to sync ${branch}${NC}"
            echo -e "${YELLOW}  Tip: You might need to resolve conflicts manually${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Branch ${branch} does not exist locally${NC}"
        echo -e "${BLUE}  Creating from remote...${NC}"
        git checkout -b "$branch" "origin/$branch"
        echo -e "${GREEN}✓ Branch ${branch} created and synced${NC}"
    fi

    echo ""
done

# Return to original branch
if [ "$CURRENT_BRANCH" != "" ]; then
    echo -e "${BLUE}Returning to original branch: ${CURRENT_BRANCH}${NC}"
    git checkout "$CURRENT_BRANCH"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Sync complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show branch status
echo -e "${BLUE}Branch status:${NC}"
git branch -vv | grep -E "main|staging|dev"
echo ""
