#!/bin/bash

# ========================================
# TERMINAL 4: Access API (Puerto 4103)
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
║          🎫 ACCESS API - PORT 4103                       ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio futura-access-api${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias...${NC}"
    npm install
fi

if [ ! -f ".env.development" ]; then
    echo -e "${RED}❌ Archivo .env.development no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuración verificada${NC}"
echo -e "${BLUE}→ Iniciando Access API...${NC}"
echo ""

export $(grep -v '^#' .env.development | xargs)
npm run start:dev
