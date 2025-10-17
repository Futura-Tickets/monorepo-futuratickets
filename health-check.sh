#!/bin/bash

# ========================================
# FuturaTickets - Health Check Completo
# ========================================
# Verifica que todos los servicios estén funcionando
# ========================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║          🏥 FUTURATICKETS HEALTH CHECK                   ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

SUCCESS_COUNT=0
FAIL_COUNT=0

# Función para verificar un servicio
check_service() {
    local name=$1
    local command=$2

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo -e "${RED}✗${NC} $name"
        ((FAIL_COUNT++))
        return 1
    fi
}

# Función para verificar puerto HTTP
check_http() {
    local name=$1
    local url=$2

    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name - $url"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo -e "${RED}✗${NC} $name - $url"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. INFRAESTRUCTURA (Docker)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_service "Docker daemon" "docker info"
check_service "MongoDB container" "docker ps | grep futura-mongodb"
check_service "Redis container" "docker ps | grep futura-redis"
check_service "MinIO container" "docker ps | grep futura-minio"
check_service "Mongo Express container" "docker ps | grep futura-mongo-express"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. BASES DE DATOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# MongoDB - Use Docker exec instead of requiring mongosh locally
if docker exec futura-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB connection"
    ((SUCCESS_COUNT++))
else
    echo -e "${RED}✗${NC} MongoDB connection"
    ((FAIL_COUNT++))
fi

# Redis - Use Docker exec instead of requiring redis-cli locally
if docker exec futura-redis redis-cli PING > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis connection"
    ((SUCCESS_COUNT++))
else
    echo -e "${RED}✗${NC} Redis connection"
    ((FAIL_COUNT++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. SERVICIOS WEB${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_http "MinIO Console" "http://localhost:9001/minio/health/live"

# Mongo Express returns 401 (requires auth), which means it's running
if curl -s -I http://localhost:8081 | grep -q "HTTP"; then
    echo -e "${GREEN}✓${NC} Mongo Express - http://localhost:8081"
    ((SUCCESS_COUNT++))
else
    echo -e "${RED}✗${NC} Mongo Express - http://localhost:8081"
    ((FAIL_COUNT++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. BACKEND APIs (opcional - solo si están corriendo)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Estas solo se verifican si curl tiene éxito (no cuenta como fail si no están)
if curl -s -f http://localhost:4101/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Admin API - http://localhost:4101"
else
    echo -e "${YELLOW}○${NC} Admin API - no corriendo (normal si no lo iniciaste)"
fi

if curl -s -f http://localhost:4102/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Marketplace API - http://localhost:4102"
else
    echo -e "${YELLOW}○${NC} Marketplace API - no corriendo (normal si no lo iniciaste)"
fi

if curl -s -f http://localhost:4103/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Access API - http://localhost:4103"
else
    echo -e "${YELLOW}○${NC} Access API - no corriendo (normal si no lo iniciaste)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. FRONTEND APPS (opcional - solo si están corriendo)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Next.js apps
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Marketplace Web - http://localhost:3000"
else
    echo -e "${YELLOW}○${NC} Marketplace Web - no corriendo (normal si no lo iniciaste)"
fi

if curl -s -f http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Admin Web - http://localhost:3003"
else
    echo -e "${YELLOW}○${NC} Admin Web - no corriendo (normal si no lo iniciaste)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. ESTADO DE PUERTOS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_port() {
    local port=$1
    local name=$2

    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Puerto $port ($name) - en uso"
    else
        echo -e "${YELLOW}○${NC} Puerto $port ($name) - libre"
    fi
}

echo -e "${YELLOW}Infraestructura:${NC}"
check_port 27017 "MongoDB"
check_port 6379 "Redis"
check_port 9000 "MinIO API"
check_port 9001 "MinIO Console"
check_port 8081 "Mongo Express"

echo ""
echo -e "${YELLOW}Backend APIs:${NC}"
check_port 4101 "Admin API"
check_port 4102 "Marketplace API"
check_port 4103 "Access API"

echo ""
echo -e "${YELLOW}Frontend Apps:${NC}"
check_port 3000 "Marketplace Web"
check_port 3003 "Admin Web"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}RESUMEN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL=$((SUCCESS_COUNT + FAIL_COUNT))

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS SERVICIOS FUNCIONANDO CORRECTAMENTE${NC}"
    echo -e "${GREEN}Servicios OK: $SUCCESS_COUNT/$TOTAL${NC}"
else
    echo -e "${YELLOW}⚠️  ALGUNOS SERVICIOS TIENEN PROBLEMAS${NC}"
    echo -e "${GREEN}Servicios OK: $SUCCESS_COUNT${NC}"
    echo -e "${RED}Servicios con problemas: $FAIL_COUNT${NC}"
    echo -e "${YELLOW}Total: $TOTAL${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

exit 0
