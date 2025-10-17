#!/bin/bash

# ========================================
# FuturaTickets - Development Cleanup Script
# ========================================
# Cleans node_modules, builds, caches, and Docker volumes
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║           🧹 DEVELOPMENT CLEANUP UTILITY 🧹              ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${CYAN}This script can clean:${NC}"
echo ""
echo -e "  ${YELLOW}1. node_modules${NC} - Delete all node_modules directories"
echo -e "  ${YELLOW}2. builds${NC} - Delete all build artifacts (.next, dist)"
echo -e "  ${YELLOW}3. caches${NC} - Delete npm cache, .turbo, etc."
echo -e "  ${YELLOW}4. docker${NC} - Stop containers and remove volumes"
echo -e "  ${YELLOW}5. all${NC} - Complete cleanup (nuclear option)"
echo -e "  ${YELLOW}6. exit${NC} - Cancel"
echo ""
echo -e "${CYAN}What would you like to clean?${NC}"
read -r choice

case "$choice" in
    1|node_modules)
        echo ""
        echo -e "${YELLOW}⚠️  This will delete ALL node_modules directories${NC}"
        echo -e "${RED}Continue? (yes/no)${NC}"
        read -r confirm

        if [[ "$confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
            echo -e "${CYAN}→ Removing node_modules...${NC}"
            find . -name "node_modules" -type d -prune -exec echo "  Removing {}" \; -exec rm -rf {} \;
            echo -e "${GREEN}✓ All node_modules removed${NC}"
        else
            echo -e "${RED}Cancelled${NC}"
        fi
        ;;

    2|builds)
        echo ""
        echo -e "${YELLOW}⚠️  This will delete ALL build artifacts${NC}"
        echo -e "${RED}Continue? (yes/no)${NC}"
        read -r confirm

        if [[ "$confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
            echo -e "${CYAN}→ Removing build artifacts...${NC}"

            # Next.js builds
            find . -name ".next" -type d -prune -exec echo "  Removing {}" \; -exec rm -rf {} \;

            # NestJS builds
            find . -name "dist" -type d -prune -exec echo "  Removing {}" \; -exec rm -rf {} \;

            # TypeScript builds
            find . -name "*.tsbuildinfo" -type f -exec echo "  Removing {}" \; -exec rm -f {} \;

            echo -e "${GREEN}✓ All build artifacts removed${NC}"
        else
            echo -e "${RED}Cancelled${NC}"
        fi
        ;;

    3|caches)
        echo ""
        echo -e "${YELLOW}⚠️  This will delete ALL cache directories${NC}"
        echo -e "${RED}Continue? (yes/no)${NC}"
        read -r confirm

        if [[ "$confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
            echo -e "${CYAN}→ Removing caches...${NC}"

            # Turbo cache
            find . -name ".turbo" -type d -prune -exec echo "  Removing {}" \; -exec rm -rf {} \;

            # ESLint cache
            find . -name ".eslintcache" -type f -exec echo "  Removing {}" \; -exec rm -f {} \;

            # npm cache
            npm cache clean --force

            echo -e "${GREEN}✓ All caches removed${NC}"
        else
            echo -e "${RED}Cancelled${NC}"
        fi
        ;;

    4|docker)
        echo ""
        echo -e "${YELLOW}⚠️  This will stop all containers and remove volumes${NC}"
        echo -e "${RED}⚠️  ALL DATABASE DATA WILL BE LOST!${NC}"
        echo -e "${RED}Continue? (yes/no)${NC}"
        read -r confirm

        if [[ "$confirm" =~ ^[Yy][Ee][Ss]$ ]]; then
            echo -e "${CYAN}→ Stopping Docker containers...${NC}"
            docker compose -f docker-compose.infra.yml down -v 2>/dev/null || true
            docker compose -f docker-compose.full.yml down -v 2>/dev/null || true

            echo -e "${CYAN}→ Removing Docker images...${NC}"
            docker image prune -f

            echo -e "${GREEN}✓ Docker cleaned${NC}"
            echo -e "${YELLOW}→ Run ./start-infra.sh to restart${NC}"
        else
            echo -e "${RED}Cancelled${NC}"
        fi
        ;;

    5|all)
        echo ""
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║            ⚠️  NUCLEAR CLEANUP OPTION ⚠️                 ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${RED}This will delete:${NC}"
        echo -e "  • All node_modules"
        echo -e "  • All build artifacts"
        echo -e "  • All caches"
        echo -e "  • All Docker containers and volumes"
        echo ""
        echo -e "${RED}ALL DATA WILL BE LOST!${NC}"
        echo -e "${RED}Type 'DELETE EVERYTHING' to confirm:${NC}"
        read -r confirm

        if [[ "$confirm" == "DELETE EVERYTHING" ]]; then
            echo ""
            echo -e "${CYAN}→ Starting complete cleanup...${NC}"

            # Stop running services
            echo -e "${CYAN}→ Stopping services...${NC}"
            ./stop-all-dev.sh 2>/dev/null || true
            docker compose -f docker-compose.infra.yml down -v 2>/dev/null || true
            docker compose -f docker-compose.full.yml down -v 2>/dev/null || true

            # Remove node_modules
            echo -e "${CYAN}→ Removing node_modules...${NC}"
            find . -name "node_modules" -type d -prune -exec rm -rf {} \; 2>/dev/null || true

            # Remove builds
            echo -e "${CYAN}→ Removing builds...${NC}"
            find . -name ".next" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
            find . -name "dist" -type d -prune -exec rm -rf {} \; 2>/dev/null || true

            # Remove caches
            echo -e "${CYAN}→ Removing caches...${NC}"
            find . -name ".turbo" -type d -prune -exec rm -rf {} \; 2>/dev/null || true
            find . -name ".eslintcache" -type f -exec rm -f {} \; 2>/dev/null || true

            # Clean Docker
            echo -e "${CYAN}→ Cleaning Docker...${NC}"
            docker image prune -f 2>/dev/null || true

            # Remove lock files
            echo -e "${CYAN}→ Removing lock files...${NC}"
            find . -name "package-lock.json" -type f -exec rm -f {} \; 2>/dev/null || true

            echo ""
            echo -e "${GREEN}✅ COMPLETE CLEANUP DONE${NC}"
            echo ""
            echo -e "${YELLOW}To rebuild:${NC}"
            echo -e "  1. npm install in each service"
            echo -e "  2. ./start-all-dev.sh"
            echo ""
        else
            echo -e "${RED}Cancelled - confirmation text did not match${NC}"
        fi
        ;;

    6|exit)
        echo -e "${YELLOW}Cleanup cancelled${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac
