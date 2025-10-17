#!/bin/bash

# ========================================
# FuturaTickets - Infrastructure Starter
# ========================================
# Este script levanta SOLO los servicios de infraestructura
# MongoDB, Redis, MinIO, Mongo Express
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║          🐳 FUTURATICKETS INFRASTRUCTURE 🐳              ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo -e "${YELLOW}Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop${NC}"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo -e "${YELLOW}Inicia Docker Desktop y vuelve a ejecutar este script${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker está corriendo${NC}"
echo ""

# Detener servicios previos si existen
echo -e "${BLUE}→ Deteniendo servicios previos (si existen)...${NC}"
docker compose -f docker-compose.infra.yml down 2>/dev/null || true
echo -e "${GREEN}✓ Servicios previos detenidos${NC}"
echo ""

# Levantar servicios de infraestructura
echo -e "${BLUE}→ Levantando servicios de infraestructura...${NC}"
docker compose -f docker-compose.infra.yml up -d

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ INFRAESTRUCTURA LEVANTADA CORRECTAMENTE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Mostrar estado de servicios
echo -e "${BLUE}📊 Estado de servicios:${NC}"
echo ""
docker compose -f docker-compose.infra.yml ps
echo ""

# Información de acceso
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔗 URLs de Acceso:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}MongoDB:${NC}"
echo -e "    URL: mongodb://futuraadmin:futurapass123@localhost:27017"
echo -e "    Port: 27017"
echo ""
echo -e "  ${GREEN}Redis:${NC}"
echo -e "    Host: localhost"
echo -e "    Port: 6379"
echo -e "    Password: futurapass123"
echo ""
echo -e "  ${GREEN}MinIO Console:${NC}"
echo -e "    URL: http://localhost:9001"
echo -e "    User: futuraadmin"
echo -e "    Pass: futurapass123"
echo ""
echo -e "  ${GREEN}Mongo Express UI:${NC}"
echo -e "    URL: http://localhost:8081"
echo -e "    User: admin"
echo -e "    Pass: admin123"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Comandos útiles:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${YELLOW}Ver logs en tiempo real:${NC}"
echo -e "    docker compose -f docker-compose.infra.yml logs -f"
echo ""
echo -e "  ${YELLOW}Detener servicios:${NC}"
echo -e "    docker compose -f docker-compose.infra.yml down"
echo ""
echo -e "  ${YELLOW}Reiniciar servicios:${NC}"
echo -e "    docker compose -f docker-compose.infra.yml restart"
echo ""
echo -e "  ${YELLOW}Ver estado:${NC}"
echo -e "    docker compose -f docker-compose.infra.yml ps"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Preguntar si quiere ver logs
echo -e "${YELLOW}¿Quieres ver los logs en tiempo real? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo -e "${BLUE}→ Mostrando logs... (Ctrl+C para salir)${NC}"
    echo ""
    docker compose -f docker-compose.infra.yml logs -f
fi
