#!/bin/bash

# ========================================
# FuturaTickets - Quick Restart Script
# ========================================
# Quickly restart a specific service
# Usage: ./dev-restart.sh [service-name]
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${BLUE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║           🔄 QUICK RESTART UTILITY 🔄                    ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "  ./dev-restart.sh [service]"
    echo ""
    echo -e "${CYAN}Available services:${NC}"
    echo -e "  mongodb, redis, minio, mongo-express"
    echo -e "  admin-api, marketplace-api, access-api"
    echo -e "  marketplace-web, admin-web"
    echo -e "  all-infra, all-apis, all-web, all"
    echo ""
    exit 0
fi

SERVICE=$1

case "$SERVICE" in
    # Infrastructure
    mongodb|redis|minio|mongo-express)
        echo -e "${CYAN}→ Restarting $SERVICE...${NC}"
        docker compose -f docker-compose.infra.yml restart "$SERVICE"
        echo -e "${GREEN}✓ $SERVICE restarted${NC}"
        ;;

    # Backend APIs
    admin-api|marketplace-api|access-api)
        if docker ps | grep -q "futura-$SERVICE"; then
            echo -e "${CYAN}→ Restarting $SERVICE (Docker)...${NC}"
            docker compose -f docker-compose.full.yml restart "$SERVICE"
            echo -e "${GREEN}✓ $SERVICE restarted${NC}"
        else
            echo -e "${RED}❌ $SERVICE not running in Docker${NC}"
            echo -e "${YELLOW}For local development, restart manually in the corresponding terminal${NC}"
        fi
        ;;

    # Frontend Apps
    marketplace-web|admin-web)
        if docker ps | grep -q "futura-$SERVICE"; then
            echo -e "${CYAN}→ Restarting $SERVICE (Docker)...${NC}"
            docker compose -f docker-compose.full.yml restart "$SERVICE"
            echo -e "${GREEN}✓ $SERVICE restarted${NC}"
        else
            echo -e "${RED}❌ $SERVICE not running in Docker${NC}"
            echo -e "${YELLOW}For local development, restart manually in the corresponding terminal${NC}"
        fi
        ;;

    # Groups
    all-infra)
        echo -e "${CYAN}→ Restarting all infrastructure services...${NC}"
        docker compose -f docker-compose.infra.yml restart
        echo -e "${GREEN}✓ All infrastructure services restarted${NC}"
        ;;
    all-apis)
        echo -e "${CYAN}→ Restarting all API services...${NC}"
        docker compose -f docker-compose.full.yml restart admin-api marketplace-api access-api 2>/dev/null || \
            echo -e "${YELLOW}⚠️  APIs running locally, restart manually${NC}"
        ;;
    all-web)
        echo -e "${CYAN}→ Restarting all web services...${NC}"
        docker compose -f docker-compose.full.yml restart marketplace-web admin-web 2>/dev/null || \
            echo -e "${YELLOW}⚠️  Web apps running locally, restart manually${NC}"
        ;;
    all)
        echo -e "${CYAN}→ Restarting ALL services...${NC}"
        docker compose -f docker-compose.infra.yml restart
        docker compose -f docker-compose.full.yml restart 2>/dev/null || true
        echo -e "${GREEN}✓ All services restarted${NC}"
        ;;

    *)
        echo -e "${RED}❌ Unknown service: $SERVICE${NC}"
        exit 1
        ;;
esac
