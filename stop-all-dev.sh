#!/bin/bash

# ========================================
# FuturaTickets - Stop All Services
# ========================================
# Detiene todos los servicios iniciados con start-all-dev.sh
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║          🛑 FUTURATICKETS - STOP ALL SERVICES            ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}→ Deteniendo todos los servicios...${NC}"
echo ""

# Read PIDs from file if exists
if [ -f ".dev-pids" ]; then
    echo -e "${BLUE}Leyendo PIDs de servicios...${NC}"
    source .dev-pids

    # Kill each service
    if [ -n "$ADMIN_API_PID" ]; then
        echo -e "${YELLOW}→ Deteniendo Admin API (PID: $ADMIN_API_PID)...${NC}"
        kill -15 $ADMIN_API_PID 2>/dev/null || echo -e "${RED}✗ Admin API ya detenida${NC}"
    fi

    if [ -n "$MARKETPLACE_API_PID" ]; then
        echo -e "${YELLOW}→ Deteniendo Marketplace API (PID: $MARKETPLACE_API_PID)...${NC}"
        kill -15 $MARKETPLACE_API_PID 2>/dev/null || echo -e "${RED}✗ Marketplace API ya detenida${NC}"
    fi

    if [ -n "$ACCESS_API_PID" ]; then
        echo -e "${YELLOW}→ Deteniendo Access API (PID: $ACCESS_API_PID)...${NC}"
        kill -15 $ACCESS_API_PID 2>/dev/null || echo -e "${RED}✗ Access API ya detenida${NC}"
    fi

    if [ -n "$MARKETPLACE_WEB_PID" ]; then
        echo -e "${YELLOW}→ Deteniendo Marketplace Web (PID: $MARKETPLACE_WEB_PID)...${NC}"
        kill -15 $MARKETPLACE_WEB_PID 2>/dev/null || echo -e "${RED}✗ Marketplace Web ya detenida${NC}"
    fi

    if [ -n "$ADMIN_WEB_PID" ]; then
        echo -e "${YELLOW}→ Deteniendo Admin Web (PID: $ADMIN_WEB_PID)...${NC}"
        kill -15 $ADMIN_WEB_PID 2>/dev/null || echo -e "${RED}✗ Admin Web ya detenida${NC}"
    fi

    # Remove PID file
    rm -f .dev-pids
    echo -e "${GREEN}✓ Archivo .dev-pids eliminado${NC}"
else
    echo -e "${YELLOW}⚠️  No se encontró archivo .dev-pids${NC}"
    echo -e "${YELLOW}→ Intentando detener procesos manualmente...${NC}"

    # Kill by port
    lsof -ti:4101 | xargs kill -15 2>/dev/null || echo -e "${YELLOW}○ Admin API (4101) no encontrada${NC}"
    lsof -ti:4102 | xargs kill -15 2>/dev/null || echo -e "${YELLOW}○ Marketplace API (4102) no encontrada${NC}"
    lsof -ti:4103 | xargs kill -15 2>/dev/null || echo -e "${YELLOW}○ Access API (4103) no encontrada${NC}"
    lsof -ti:3000 | xargs kill -15 2>/dev/null || echo -e "${YELLOW}○ Marketplace Web (3000) no encontrada${NC}"
    lsof -ti:3003 | xargs kill -15 2>/dev/null || echo -e "${YELLOW}○ Admin Web (3003) no encontrada${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Deteniendo infraestructura Docker...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

docker compose -f docker-compose.infra.yml down

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TODOS LOS SERVICIOS DETENIDOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Para reiniciar el entorno:${NC}"
echo -e "  ${BLUE}./start-all-dev.sh${NC}"
echo ""
