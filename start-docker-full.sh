#!/bin/bash

# ========================================
# FuturaTickets - Start Full Docker Stack
# ========================================
# Inicia TODOS los servicios usando Docker
# (Infraestructura + APIs + Frontends)
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
║       🐳 FUTURATICKETS - FULL DOCKER STACK 🐳            ║
║          All Services in Docker Containers               ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo -e "${YELLOW}Este script iniciará TODOS los servicios en Docker.${NC}"
echo -e "${YELLOW}Tiempo estimado: 5-10 minutos (primera vez con builds).${NC}"
echo ""
echo -e "${BLUE}Servicios a iniciar:${NC}"
echo -e "  • MongoDB, Redis, MinIO, Mongo Express"
echo -e "  • Admin API, Marketplace API, Access API"
echo -e "  • Marketplace Web, Admin Web"
echo ""
echo -e "${YELLOW}¿Deseas continuar? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cancelado por el usuario${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}VERIFICANDO REQUISITOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está disponible${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker instalado y funcionando${NC}"
echo -e "${GREEN}✓ Docker Compose disponible${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}→  Creando .env con valores por defecto...${NC}"
    cat > .env <<EOF
# FuturaTickets - Environment Variables
# Created: $(date +%Y-%m-%d)

# JWT Secret (change in production!)
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production

# Stripe Keys (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Azure Blob Storage
BLOB_URL=https://futuratickets.blob.core.windows.net/images
EOF
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}DETENIENDO SERVICIOS PREVIOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

docker compose -f docker-compose.full.yml down 2>/dev/null || true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}CONSTRUYENDO IMÁGENES DOCKER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}→ Building Docker images (esto puede tomar varios minutos)...${NC}"
docker compose -f docker-compose.full.yml build --parallel

echo ""
echo -e "${GREEN}✓ Imágenes construidas correctamente${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}INICIANDO SERVICIOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}→ Starting all services...${NC}"
docker compose -f docker-compose.full.yml up -d

echo ""
echo -e "${GREEN}✓ Todos los servicios iniciados${NC}"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}ESPERANDO A QUE LOS SERVICIOS ESTÉN LISTOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}→ Esperando healthchecks (60 segundos)...${NC}"
sleep 60

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}ESTADO DE LOS SERVICIOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

docker compose -f docker-compose.full.yml ps

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ FULL DOCKER STACK INICIADO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}📊 SERVICIOS DISPONIBLES:${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} MongoDB:         mongodb://localhost:27017"
echo -e "  ${GREEN}✓${NC} Redis:           localhost:6379"
echo -e "  ${GREEN}✓${NC} MinIO Console:   http://localhost:9001"
echo -e "  ${GREEN}✓${NC} Mongo Express:   http://localhost:8081"
echo -e "  ${GREEN}✓${NC} Admin API:       http://localhost:4101"
echo -e "  ${GREEN}✓${NC} Marketplace API: http://localhost:4102"
echo -e "  ${GREEN}✓${NC} Access API:      http://localhost:4103"
echo -e "  ${GREEN}✓${NC} Marketplace Web: http://localhost:3000"
echo -e "  ${GREEN}✓${NC} Admin Web:       http://localhost:3003"
echo ""

echo -e "${CYAN}📝 COMANDOS ÚTILES:${NC}"
echo ""
echo -e "  ${BLUE}Ver logs en tiempo real:${NC}"
echo -e "    docker compose -f docker-compose.full.yml logs -f"
echo ""
echo -e "  ${BLUE}Ver logs de un servicio:${NC}"
echo -e "    docker compose -f docker-compose.full.yml logs -f marketplace-api"
echo ""
echo -e "  ${BLUE}Reiniciar un servicio:${NC}"
echo -e "    docker compose -f docker-compose.full.yml restart marketplace-api"
echo ""
echo -e "  ${BLUE}Detener todo:${NC}"
echo -e "    docker compose -f docker-compose.full.yml down"
echo ""
echo -e "  ${BLUE}Detener y limpiar volúmenes:${NC}"
echo -e "    docker compose -f docker-compose.full.yml down -v"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Entorno completo en Docker listo! 🚀${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
