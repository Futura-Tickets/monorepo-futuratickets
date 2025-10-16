#!/bin/bash

# FuturaTickets Worktree Cleanup Script
# Removes merged worktrees and prunes references
# Usage: ./scripts/worktree-cleanup.sh [--force]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FORCE_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f)
            FORCE_MODE=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Worktree Cleanup${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Current branch:${NC} ${CURRENT_BRANCH}"
echo ""

# List all worktrees
echo -e "${BLUE}Finding worktrees...${NC}"
WORKTREE_COUNT=0
REMOVED_COUNT=0

# Parse git worktree list output
while IFS= read -r line; do
    # Skip empty lines
    if [ -z "$line" ]; then
        continue
    fi

    WORKTREE_COUNT=$((WORKTREE_COUNT + 1))

    # Extract path and branch
    WORKTREE_PATH=$(echo "$line" | awk '{print $1}')
    BRANCH_INFO=$(echo "$line" | grep -oP '\[\K[^\]]+' || echo "")

    # Skip if no branch info (bare repository)
    if [ -z "$BRANCH_INFO" ]; then
        continue
    fi

    # Skip main/master/development branches
    if [[ "$BRANCH_INFO" == "main" ]] || [[ "$BRANCH_INFO" == "master" ]] || [[ "$BRANCH_INFO" == "development" ]]; then
        echo -e "${YELLOW}⊚ Skipping protected branch: ${BRANCH_INFO} at ${WORKTREE_PATH}${NC}"
        continue
    fi

    # Check if branch is merged into main
    if git branch --merged main | grep -q "^[* ]*${BRANCH_INFO}$"; then
        echo -e "${GREEN}✓ Branch '${BRANCH_INFO}' is merged${NC}"

        if [ "$FORCE_MODE" = true ]; then
            echo -e "${BLUE}  Removing worktree: ${WORKTREE_PATH}${NC}"
            if git worktree remove "$WORKTREE_PATH" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Removed successfully${NC}"
                REMOVED_COUNT=$((REMOVED_COUNT + 1))
            else
                echo -e "${YELLOW}  ⚠ Could not remove (might have uncommitted changes)${NC}"
                echo -e "${YELLOW}    Use: git worktree remove --force ${WORKTREE_PATH}${NC}"
            fi
        else
            echo -e "${YELLOW}  Would remove: ${WORKTREE_PATH}${NC}"
            echo -e "${YELLOW}  (Use --force to actually remove)${NC}"
        fi
    else
        echo -e "${BLUE}⊚ Branch '${BRANCH_INFO}' is not merged yet${NC}"
        echo -e "  Worktree: ${WORKTREE_PATH}"
    fi

    echo ""

done < <(git worktree list | tail -n +1)

# Prune stale references
echo -e "${BLUE}Pruning stale worktree references...${NC}"
git worktree prune

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Cleanup Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Total worktrees: ${WORKTREE_COUNT}${NC}"

if [ "$FORCE_MODE" = true ]; then
    echo -e "${GREEN}Removed: ${REMOVED_COUNT}${NC}"
    echo ""
    echo -e "${GREEN}✓ Cleanup complete!${NC}"
else
    echo -e "${YELLOW}Dry run mode (use --force to actually remove)${NC}"
    echo ""
    echo -e "${BLUE}To remove merged worktrees:${NC}"
    echo -e "  ./scripts/worktree-cleanup.sh --force"
fi

echo ""
echo -e "${BLUE}Current worktrees:${NC}"
git worktree list
echo ""
