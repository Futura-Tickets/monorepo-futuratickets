#!/bin/bash

# ========================================
# TERMINAL 3: Marketplace API (Puerto 4102)
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
║          🛒 MARKETPLACE API - PORT 4102                  ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio futura-market-place-api${NC}"
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
echo -e "${BLUE}→ Iniciando Marketplace API...${NC}"
echo ""

export $(grep -v '^#' .env.development | xargs)
npm run start:dev
