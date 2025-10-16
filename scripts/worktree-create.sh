#!/bin/bash

# FuturaTickets Worktree Creation Script
# Usage: ./scripts/worktree-create.sh <branch-name> [base-branch]
# Example: ./scripts/worktree-create.sh feature/nft-integration
# Example: ./scripts/worktree-create.sh bugfix/payment-issue main

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BRANCH_NAME=$1
BASE_BRANCH=${2:-""}
PARENT_DIR=$(dirname "$(pwd)")
WORKTREE_DIR="${PARENT_DIR}/futuratickets-${BRANCH_NAME//\//-}"

# Auto-detect base branch based on branch type
if [ -z "$BASE_BRANCH" ]; then
    if [[ "$BRANCH_NAME" =~ ^feature/ ]] || [[ "$BRANCH_NAME" =~ ^bugfix/ ]]; then
        BASE_BRANCH="dev"
    elif [[ "$BRANCH_NAME" =~ ^hotfix/ ]]; then
        BASE_BRANCH="main"
    elif [[ "$BRANCH_NAME" =~ ^release/ ]]; then
        BASE_BRANCH="staging"
    else
        BASE_BRANCH="dev"  # Default to dev
    fi
    echo -e "${BLUE}ℹ Auto-detected base branch: ${BASE_BRANCH}${NC}"
fi

# Validation
if [ -z "$BRANCH_NAME" ]; then
    echo -e "${RED}Error: Branch name is required${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo "  ./scripts/worktree-create.sh <branch-name> [base-branch]"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./scripts/worktree-create.sh feature/nft-integration      # Auto-branches from dev"
    echo "  ./scripts/worktree-create.sh hotfix/critical-bug          # Auto-branches from main"
    echo "  ./scripts/worktree-create.sh release/v1.0.0               # Auto-branches from staging"
    echo "  ./scripts/worktree-create.sh bugfix/issue-123 dev         # Explicit base branch"
    echo ""
    echo -e "${BLUE}Branch Types:${NC}"
    echo "  feature/*  → branches from dev (default)"
    echo "  bugfix/*   → branches from dev (default)"
    echo "  hotfix/*   → branches from main"
    echo "  release/*  → branches from staging"
    exit 1
fi

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}FuturaTickets Worktree Creation${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "${YELLOW}Branch: ${BRANCH_NAME}${NC}"
echo -e "${YELLOW}Base: ${BASE_BRANCH}${NC}"
echo -e "${YELLOW}Location: ${WORKTREE_DIR}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
    echo -e "${RED}Error: Directory already exists: ${WORKTREE_DIR}${NC}"
    echo -e "${YELLOW}Remove it first or choose a different branch name${NC}"
    exit 1
fi

# Create worktree
echo -e "${BLUE}Creating worktree...${NC}"
if git worktree add "$WORKTREE_DIR" -b "$BRANCH_NAME" "$BASE_BRANCH"; then
    echo -e "${GREEN}✓ Worktree created${NC}"
else
    echo -e "${RED}✗ Failed to create worktree${NC}"
    exit 1
fi

echo ""

# Navigate to worktree
cd "$WORKTREE_DIR"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
echo ""

PROJECTS=(
    "futura-tickets-admin-api:Backend API"
    "futura-tickets-admin:Admin Frontend"
    "futura-market-place-v2:Marketplace Frontend"
)

for project_info in "${PROJECTS[@]}"; do
    IFS=':' read -r project_dir project_name <<< "$project_info"

    if [ -d "$project_dir" ]; then
        echo -e "${BLUE}Installing in ${project_name}...${NC}"
        cd "$project_dir"

        if [ -f "package.json" ]; then
            npm install --silent > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Dependencies installed for ${project_name}${NC}"
            else
                echo -e "${YELLOW}⚠ Warning: Failed to install dependencies for ${project_name}${NC}"
            fi
        fi

        cd "$WORKTREE_DIR"
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Worktree created successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Location:${NC} ${WORKTREE_DIR}"
echo -e "${BLUE}Branch:${NC} ${BRANCH_NAME}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Navigate to worktree: ${YELLOW}cd ${WORKTREE_DIR}${NC}"
echo -e "  2. Start development"
echo -e "  3. Push to remote: ${YELLOW}git push -u origin ${BRANCH_NAME}${NC}"
echo -e "  4. Create PR: ${YELLOW}gh pr create --base ${BASE_BRANCH}${NC}"
echo -e "  5. When done: ${YELLOW}git worktree remove ${WORKTREE_DIR}${NC}"
echo ""
echo -e "${BLUE}To open in VSCode:${NC}"
echo -e "  ${YELLOW}code ${WORKTREE_DIR}${NC}"
echo ""
echo -e "${BLUE}Merge Target:${NC}"
if [[ "$BRANCH_NAME" =~ ^feature/ ]] || [[ "$BRANCH_NAME" =~ ^bugfix/ ]]; then
    echo -e "  ${GREEN}This branch should merge to: dev${NC}"
elif [[ "$BRANCH_NAME" =~ ^hotfix/ ]]; then
    echo -e "  ${RED}This branch should merge to: main (then staging, then dev)${NC}"
elif [[ "$BRANCH_NAME" =~ ^release/ ]]; then
    echo -e "  ${GREEN}This branch should merge to: main${NC}"
fi
echo ""
