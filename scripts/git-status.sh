#!/bin/bash

# FuturaTickets Git Status Script
# Shows comprehensive git status including branches and worktrees
# Usage: ./scripts/git-status.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          FuturaTickets Git Status Dashboard               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Current branch and status
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${CYAN}📍 Current Location${NC}"
echo -e "   Branch: ${GREEN}${CURRENT_BRANCH}${NC}"
echo -e "   Directory: ${PWD}"
echo ""

# Git status
echo -e "${CYAN}📊 Working Directory Status${NC}"
if [[ -n $(git status --porcelain) ]]; then
    git status --short
    echo ""
    echo -e "   ${YELLOW}⚠ You have uncommitted changes${NC}"
else
    echo -e "   ${GREEN}✓ Working directory clean${NC}"
fi
echo ""

# Main branches status
echo -e "${CYAN}🌿 Main Branches${NC}"
echo ""

BRANCHES=("main" "staging" "dev")
for branch in "${BRANCHES[@]}"; do
    if git show-ref --verify --quiet refs/heads/"$branch"; then
        # Branch exists locally
        LOCAL_COMMIT=$(git rev-parse "$branch" 2>/dev/null)
        REMOTE_COMMIT=$(git rev-parse "origin/$branch" 2>/dev/null)

        if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
            STATUS="${GREEN}✓ synced${NC}"
        else
            # Check if local is ahead or behind
            AHEAD=$(git rev-list --count "origin/$branch..$branch" 2>/dev/null || echo "0")
            BEHIND=$(git rev-list --count "$branch..origin/$branch" 2>/dev/null || echo "0")

            if [ "$AHEAD" -gt 0 ] && [ "$BEHIND" -gt 0 ]; then
                STATUS="${RED}⚠ diverged (↑$AHEAD ↓$BEHIND)${NC}"
            elif [ "$AHEAD" -gt 0 ]; then
                STATUS="${YELLOW}↑ ahead by $AHEAD${NC}"
            elif [ "$BEHIND" -gt 0 ]; then
                STATUS="${YELLOW}↓ behind by $BEHIND${NC}"
            fi
        fi

        # Get last commit
        LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s" "$branch" 2>/dev/null)

        # Check if current branch
        if [ "$branch" = "$CURRENT_BRANCH" ]; then
            echo -e "   ${MAGENTA}●${NC} ${CYAN}$branch${NC} - $STATUS"
        else
            echo -e "   ○ $branch - $STATUS"
        fi
        echo -e "     └─ $LAST_COMMIT"
    else
        echo -e "   ${RED}✗ $branch (not found locally)${NC}"
    fi
    echo ""
done

# Feature branches
echo -e "${CYAN}🚀 Active Feature Branches${NC}"
FEATURE_COUNT=$(git branch | grep -E "feature/|bugfix/|hotfix/" | wc -l | xargs)
if [ "$FEATURE_COUNT" -gt 0 ]; then
    git branch -vv | grep -E "feature/|bugfix/|hotfix/" | while read -r line; do
        if [[ $line == *"*"* ]]; then
            echo -e "   ${MAGENTA}● ${line:2}${NC}"
        else
            echo -e "   ○ ${line:2}"
        fi
    done
else
    echo -e "   ${YELLOW}No active feature branches${NC}"
fi
echo ""

# Worktrees
echo -e "${CYAN}🌳 Active Worktrees${NC}"
WORKTREE_COUNT=$(git worktree list | wc -l | xargs)
if [ "$WORKTREE_COUNT" -gt 1 ]; then
    git worktree list | tail -n +2 | while IFS= read -r line; do
        WORKTREE_PATH=$(echo "$line" | awk '{print $1}')
        WORKTREE_BRANCH=$(echo "$line" | grep -oP '\[\K[^\]]+' || echo "")

        if [ -n "$WORKTREE_BRANCH" ]; then
            echo -e "   ${GREEN}◆${NC} $WORKTREE_BRANCH"
            echo -e "     └─ $WORKTREE_PATH"
        fi
    done
else
    echo -e "   ${YELLOW}No additional worktrees${NC}"
    echo -e "   ${BLUE}Tip:${NC} Create worktrees with: ./scripts/worktree-create.sh feature/name"
fi
echo ""

# Recent commits
echo -e "${CYAN}📝 Recent Commits (${CURRENT_BRANCH})${NC}"
git log --oneline -5 --color=always | sed 's/^/   /'
echo ""

# Stashes
STASH_COUNT=$(git stash list | wc -l | xargs)
if [ "$STASH_COUNT" -gt 0 ]; then
    echo -e "${CYAN}💾 Stashes${NC}"
    git stash list | head -5 | sed 's/^/   /'
    echo ""
fi

# Remotes
echo -e "${CYAN}🌐 Remote${NC}"
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "No remote configured")
echo -e "   origin: $REMOTE_URL"
echo ""

# Quick actions
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Quick Actions                                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}Sync branches:${NC}        ./scripts/sync-branches.sh"
echo -e "  ${GREEN}Create worktree:${NC}      ./scripts/worktree-create.sh feature/name"
echo -e "  ${GREEN}Cleanup worktrees:${NC}    ./scripts/worktree-cleanup.sh --force"
echo -e "  ${GREEN}Create PR:${NC}            gh pr create --base dev"
echo -e "  ${GREEN}View documentation:${NC}   cat docs/GIT_SETUP_SUMMARY.md"
echo ""
