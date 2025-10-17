#!/bin/bash

# ========================================
# TERMINAL 5: Marketplace Web (Puerto 3000)
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
║          🛒 MARKETPLACE WEB - PORT 3000                  ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio futura-market-place-v2${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias...${NC}"
    npm install
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env.local no encontrado${NC}"
    echo -e "${YELLOW}→  Usando configuración por defecto${NC}"
fi

echo -e "${GREEN}✓ Configuración verificada${NC}"
echo -e "${BLUE}→ Iniciando Marketplace Web...${NC}"
echo ""

npm run dev
