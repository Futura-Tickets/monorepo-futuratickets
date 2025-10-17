#!/bin/bash

# ========================================
# FuturaTickets - Start All Services (Development)
# ========================================
# Automatiza el inicio de todos los servicios en el orden correcto
# ========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║          🚀 FUTURATICKETS - START ALL SERVICES           ║
║                  Development Environment                  ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}Este script iniciará todos los servicios automáticamente.${NC}"
echo -e "${YELLOW}Si prefieres control manual, usa los scripts individuales:${NC}"
echo ""
echo -e "  ${BLUE}./start-infra.sh${NC}              - Infraestructura (Docker)"
echo -e "  ${BLUE}./start-admin-api.sh${NC}          - Admin API (Terminal 2)"
echo -e "  ${BLUE}./start-marketplace-api.sh${NC}    - Marketplace API (Terminal 3)"
echo -e "  ${BLUE}./start-access-api.sh${NC}         - Access API (Terminal 4)"
echo -e "  ${BLUE}./start-marketplace-web.sh${NC}    - Marketplace Web (Terminal 5)"
echo -e "  ${BLUE}./start-admin-web.sh${NC}          - Admin Web (Terminal 6)"
echo ""
echo -e "${YELLOW}¿Deseas continuar? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelado por el usuario${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 1/6: Infraestructura (Docker)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start infrastructure
./start-infra.sh

echo ""
echo -e "${GREEN}✓ Infraestructura iniciada correctamente${NC}"
echo -e "${YELLOW}→ Esperando 10 segundos para que los servicios estén listos...${NC}"
sleep 10

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 2/6: Admin API (Puerto 4101)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Admin API in background
cd futura-tickets-admin-api
echo -e "${CYAN}→ Iniciando Admin API en segundo plano...${NC}"
../start-admin-api.sh > /dev/null 2>&1 &
ADMIN_API_PID=$!
cd ..

echo -e "${GREEN}✓ Admin API iniciando (PID: $ADMIN_API_PID)${NC}"
echo -e "${YELLOW}→ Esperando 15 segundos para que la API esté lista...${NC}"
sleep 15

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 3/6: Marketplace API (Puerto 4102)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Marketplace API in background
cd futura-market-place-api
echo -e "${CYAN}→ Iniciando Marketplace API en segundo plano...${NC}"
../start-marketplace-api.sh > /dev/null 2>&1 &
MARKETPLACE_API_PID=$!
cd ..

echo -e "${GREEN}✓ Marketplace API iniciando (PID: $MARKETPLACE_API_PID)${NC}"
echo -e "${YELLOW}→ Esperando 15 segundos para que la API esté lista...${NC}"
sleep 15

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 4/6: Access API (Puerto 4103)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Access API in background
cd futura-access-api
echo -e "${CYAN}→ Iniciando Access API en segundo plano...${NC}"
../start-access-api.sh > /dev/null 2>&1 &
ACCESS_API_PID=$!
cd ..

echo -e "${GREEN}✓ Access API iniciando (PID: $ACCESS_API_PID)${NC}"
echo -e "${YELLOW}→ Esperando 15 segundos para que la API esté lista...${NC}"
sleep 15

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 5/6: Marketplace Web (Puerto 3000)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Marketplace Web in background
cd futura-market-place-v2
echo -e "${CYAN}→ Iniciando Marketplace Web en segundo plano...${NC}"
../start-marketplace-web.sh > /dev/null 2>&1 &
MARKETPLACE_WEB_PID=$!
cd ..

echo -e "${GREEN}✓ Marketplace Web iniciando (PID: $MARKETPLACE_WEB_PID)${NC}"
echo -e "${YELLOW}→ Esperando 20 segundos para que Next.js compile...${NC}"
sleep 20

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 6/6: Admin Web (Puerto 3003)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start Admin Web in background
cd futura-tickets-admin
echo -e "${CYAN}→ Iniciando Admin Web en segundo plano...${NC}"
../start-admin-web.sh > /dev/null 2>&1 &
ADMIN_WEB_PID=$!
cd ..

echo -e "${GREEN}✓ Admin Web iniciando (PID: $ADMIN_WEB_PID)${NC}"
echo -e "${YELLOW}→ Esperando 20 segundos para que Next.js compile...${NC}"
sleep 20

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}VERIFICACIÓN DE SERVICIOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

./health-check.sh

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ TODOS LOS SERVICIOS INICIADOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}📊 SERVICIOS ACTIVOS:${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} MongoDB:         mongodb://localhost:27017"
echo -e "  ${GREEN}✓${NC} Redis:           localhost:6379"
echo -e "  ${GREEN}✓${NC} MinIO Console:   http://localhost:9001"
echo -e "  ${GREEN}✓${NC} Mongo Express:   http://localhost:8081"
echo -e "  ${GREEN}✓${NC} Admin API:       http://localhost:4101 ${YELLOW}(PID: $ADMIN_API_PID)${NC}"
echo -e "  ${GREEN}✓${NC} Marketplace API: http://localhost:4102 ${YELLOW}(PID: $MARKETPLACE_API_PID)${NC}"
echo -e "  ${GREEN}✓${NC} Access API:      http://localhost:4103 ${YELLOW}(PID: $ACCESS_API_PID)${NC}"
echo -e "  ${GREEN}✓${NC} Marketplace Web: http://localhost:3000 ${YELLOW}(PID: $MARKETPLACE_WEB_PID)${NC}"
echo -e "  ${GREEN}✓${NC} Admin Web:       http://localhost:3003 ${YELLOW}(PID: $ADMIN_WEB_PID)${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}Los servicios están corriendo en segundo plano.${NC}"
echo -e "${YELLOW}Para ver los logs de cada servicio, abre terminales individuales.${NC}"
echo ""
echo -e "${CYAN}Para detener todos los servicios:${NC}"
echo -e "  ${BLUE}./stop-all.sh${NC}"
echo ""
echo -e "${CYAN}Para ver logs en tiempo real:${NC}"
echo -e "  ${BLUE}docker compose -f docker-compose.infra.yml logs -f${NC}"
echo ""

# Save PIDs to file for stop script
cat > .dev-pids <<EOF
ADMIN_API_PID=$ADMIN_API_PID
MARKETPLACE_API_PID=$MARKETPLACE_API_PID
ACCESS_API_PID=$ACCESS_API_PID
MARKETPLACE_WEB_PID=$MARKETPLACE_WEB_PID
ADMIN_WEB_PID=$ADMIN_WEB_PID
EOF

echo -e "${GREEN}✅ Archivo .dev-pids creado con los PIDs de todos los servicios${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Entorno de desarrollo listo! Happy coding! 🚀${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
