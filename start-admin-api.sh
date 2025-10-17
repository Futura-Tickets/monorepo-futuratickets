#!/bin/bash

# ========================================
# TERMINAL 2: Admin API (Puerto 4101)
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
║          📦 ADMIN API - PORT 4101                        ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio futura-tickets-admin-api${NC}"
    echo -e "${YELLOW}Ejecuta: cd futura-tickets-admin-api && ../start-admin-api.sh${NC}"
    exit 1
fi

# Verificar node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules no encontrado. Instalando dependencias...${NC}"
    npm install
fi

# Verificar .env.development
if [ ! -f ".env.development" ]; then
    echo -e "${RED}❌ Archivo .env.development no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuración verificada${NC}"
echo -e "${BLUE}→ Iniciando Admin API en modo desarrollo...${NC}"
echo ""

# Usar .env.development
export $(grep -v '^#' .env.development | xargs)

# Iniciar con nodemon/watch mode
npm run start:dev
