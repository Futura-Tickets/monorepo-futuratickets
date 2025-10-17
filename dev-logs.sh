#!/bin/bash

# ========================================
# FuturaTickets - Development Logs Viewer
# ========================================
# Quickly view logs from any service
# Usage: ./dev-logs.sh [service-name]
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Show menu if no argument
if [ -z "$1" ]; then
    echo -e "${BLUE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║            📋 DEVELOPMENT LOGS VIEWER 📋                 ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "  ./dev-logs.sh [service]"
    echo ""
    echo -e "${CYAN}Available services:${NC}"
    echo ""
    echo -e "  ${YELLOW}Infrastructure:${NC}"
    echo -e "    mongodb          - MongoDB database logs"
    echo -e "    redis            - Redis cache logs"
    echo -e "    minio            - MinIO storage logs"
    echo -e "    mongo-express    - Mongo Express UI logs"
    echo ""
    echo -e "  ${YELLOW}Backend APIs:${NC}"
    echo -e "    admin-api        - Admin API logs (port 4101)"
    echo -e "    marketplace-api  - Marketplace API logs (port 4102)"
    echo -e "    access-api       - Access API logs (port 4103)"
    echo ""
    echo -e "  ${YELLOW}Frontend Apps:${NC}"
    echo -e "    marketplace-web  - Marketplace Web logs (port 3000)"
    echo -e "    admin-web        - Admin Web logs (port 3003)"
    echo ""
    echo -e "  ${YELLOW}Special:${NC}"
    echo -e "    all              - All infrastructure services"
    echo -e "    apis             - All backend APIs"
    echo -e "    frontends        - All frontend apps"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "  ./dev-logs.sh admin-api"
    echo -e "  ./dev-logs.sh mongodb"
    echo -e "  ./dev-logs.sh all"
    echo ""
    exit 0
fi

SERVICE=$1

case "$SERVICE" in
    # Infrastructure
    mongodb)
        echo -e "${BLUE}→ Viewing MongoDB logs...${NC}"
        docker compose -f docker-compose.infra.yml logs -f mongodb
        ;;
    redis)
        echo -e "${BLUE}→ Viewing Redis logs...${NC}"
        docker compose -f docker-compose.infra.yml logs -f redis
        ;;
    minio)
        echo -e "${BLUE}→ Viewing MinIO logs...${NC}"
        docker compose -f docker-compose.infra.yml logs -f minio
        ;;
    mongo-express)
        echo -e "${BLUE}→ Viewing Mongo Express logs...${NC}"
        docker compose -f docker-compose.infra.yml logs -f mongo-express
        ;;

    # Backend APIs (if running in Docker)
    admin-api)
        if docker ps | grep -q futura-admin-api; then
            echo -e "${BLUE}→ Viewing Admin API logs (Docker)...${NC}"
            docker compose -f docker-compose.full.yml logs -f admin-api
        elif [ -f ".dev-pids" ]; then
            echo -e "${YELLOW}⚠️  Admin API running locally (not in Docker)${NC}"
            echo -e "${YELLOW}Check Terminal 2 for logs${NC}"
        else
            echo -e "${RED}❌ Admin API not running${NC}"
        fi
        ;;
    marketplace-api)
        if docker ps | grep -q futura-marketplace-api; then
            echo -e "${BLUE}→ Viewing Marketplace API logs (Docker)...${NC}"
            docker compose -f docker-compose.full.yml logs -f marketplace-api
        elif [ -f ".dev-pids" ]; then
            echo -e "${YELLOW}⚠️  Marketplace API running locally (not in Docker)${NC}"
            echo -e "${YELLOW}Check Terminal 3 for logs${NC}"
        else
            echo -e "${RED}❌ Marketplace API not running${NC}"
        fi
        ;;
    access-api)
        if docker ps | grep -q futura-access-api; then
            echo -e "${BLUE}→ Viewing Access API logs (Docker)...${NC}"
            docker compose -f docker-compose.full.yml logs -f access-api
        elif [ -f ".dev-pids" ]; then
            echo -e "${YELLOW}⚠️  Access API running locally (not in Docker)${NC}"
            echo -e "${YELLOW}Check Terminal 4 for logs${NC}"
        else
            echo -e "${RED}❌ Access API not running${NC}"
        fi
        ;;

    # Frontend Apps
    marketplace-web)
        if docker ps | grep -q futura-marketplace-web; then
            echo -e "${BLUE}→ Viewing Marketplace Web logs (Docker)...${NC}"
            docker compose -f docker-compose.full.yml logs -f marketplace-web
        elif [ -f ".dev-pids" ]; then
            echo -e "${YELLOW}⚠️  Marketplace Web running locally (not in Docker)${NC}"
            echo -e "${YELLOW}Check Terminal 5 for logs${NC}"
        else
            echo -e "${RED}❌ Marketplace Web not running${NC}"
        fi
        ;;
    admin-web)
        if docker ps | grep -q futura-admin-web; then
            echo -e "${BLUE}→ Viewing Admin Web logs (Docker)...${NC}"
            docker compose -f docker-compose.full.yml logs -f admin-web
        elif [ -f ".dev-pids" ]; then
            echo -e "${YELLOW}⚠️  Admin Web running locally (not in Docker)${NC}"
            echo -e "${YELLOW}Check Terminal 6 for logs${NC}"
        else
            echo -e "${RED}❌ Admin Web not running${NC}"
        fi
        ;;

    # Special cases
    all)
        echo -e "${BLUE}→ Viewing all infrastructure logs...${NC}"
        docker compose -f docker-compose.infra.yml logs -f
        ;;
    apis)
        echo -e "${BLUE}→ Viewing all API logs...${NC}"
        if docker compose -f docker-compose.full.yml ps | grep -q api; then
            docker compose -f docker-compose.full.yml logs -f admin-api marketplace-api access-api
        else
            echo -e "${YELLOW}⚠️  APIs running locally, check Terminals 2-4${NC}"
        fi
        ;;
    frontends)
        echo -e "${BLUE}→ Viewing all frontend logs...${NC}"
        if docker compose -f docker-compose.full.yml ps | grep -q web; then
            docker compose -f docker-compose.full.yml logs -f marketplace-web admin-web
        else
            echo -e "${YELLOW}⚠️  Frontends running locally, check Terminals 5-6${NC}"
        fi
        ;;

    *)
        echo -e "${RED}❌ Unknown service: $SERVICE${NC}"
        echo -e "${YELLOW}Run without arguments to see available services${NC}"
        exit 1
        ;;
esac
