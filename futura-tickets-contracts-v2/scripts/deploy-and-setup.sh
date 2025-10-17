#!/bin/bash

# ============================================================
# FUTURATICKETS - AUTOMATED DEPLOYMENT SCRIPT
# ============================================================
# Este script automatiza el deployment completo del sistema blockchain
# Tiempo estimado: 30-45 minutos
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "  FUTURATICKETS BLOCKCHAIN DEPLOYMENT"
echo "============================================================"
echo -e "${NC}"

# ============================================================
# STEP 1: Verificar prerequisitos
# ============================================================
echo -e "${YELLOW}[1/7] Verificando prerequisitos...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm encontrado: $(npm --version)${NC}"

# Check .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Por favor, crea .env con tus API keys basándote en .env.example${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Archivo .env encontrado${NC}"

# Check required env variables
source .env
if [ -z "$ALCHEMY_API_KEY" ]; then
    echo -e "${RED}❌ ALCHEMY_API_KEY no configurado en .env${NC}"
    exit 1
fi
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ DEPLOYER_PRIVATE_KEY no configurado en .env${NC}"
    exit 1
fi
if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${RED}❌ BASESCAN_API_KEY no configurado en .env${NC}"
    exit 1
fi
if [ -z "$DEPLOYER" ]; then
    echo -e "${RED}❌ DEPLOYER no configurado en .env${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Todas las variables de entorno configuradas${NC}"

# ============================================================
# STEP 2: Instalar dependencies
# ============================================================
echo ""
echo -e "${YELLOW}[2/7] Instalando dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Dependencies instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencies ya instaladas (skipping)${NC}"
fi

# ============================================================
# STEP 3: Compilar contratos
# ============================================================
echo ""
echo -e "${YELLOW}[3/7] Compilando contratos...${NC}"

npm run compile

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contratos compilados exitosamente${NC}"
else
    echo -e "${RED}❌ Error compilando contratos${NC}"
    exit 1
fi

# ============================================================
# STEP 4: Ejecutar tests
# ============================================================
echo ""
echo -e "${YELLOW}[4/7] Ejecutando tests...${NC}"

npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los tests pasaron${NC}"
else
    echo -e "${RED}❌ Tests fallaron${NC}"
    echo -e "${YELLOW}⚠️  ¿Deseas continuar con el deployment? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        exit 1
    fi
fi

# ============================================================
# STEP 5: Deploy Factory Contract
# ============================================================
echo ""
echo -e "${YELLOW}[5/7] Deploying FuturaEventFactory a Base Sepolia...${NC}"

npm run deploy:baseSepolia -- --tags factory

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Factory contract deployed exitosamente${NC}"
else
    echo -e "${RED}❌ Error deploying factory contract${NC}"
    exit 1
fi

# ============================================================
# STEP 6: Copiar ABIs al backend
# ============================================================
echo ""
echo -e "${YELLOW}[6/7] Copiando ABIs al backend...${NC}"

# Check if backend directory exists
BACKEND_DIR="../futura-tickets-admin-api"
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Directorio backend no encontrado: $BACKEND_DIR${NC}"
    exit 1
fi

# Create abis directory if it doesn't exist
mkdir -p "$BACKEND_DIR/src/abis"

# Copy ABIs
cp artifacts/contracts/FuturaEvent.sol/FuturaEvent.json "$BACKEND_DIR/src/abis/FuturaEvent.json"
cp artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json "$BACKEND_DIR/src/abis/FuturaEventFactory.json"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ABIs copiados al backend${NC}"
else
    echo -e "${RED}❌ Error copiando ABIs${NC}"
    exit 1
fi

# ============================================================
# STEP 7: Mostrar resumen
# ============================================================
echo ""
echo -e "${BLUE}"
echo "============================================================"
echo "  DEPLOYMENT COMPLETADO EXITOSAMENTE"
echo "============================================================"
echo -e "${NC}"

# Extract Factory address from deployment
FACTORY_ADDRESS=$(cat deployments/baseSepolia/FuturaEventFactory.json | grep -o '"address":"0x[a-fA-F0-9]*"' | cut -d'"' -f4)

echo -e "${GREEN}✅ Factory Contract Deployed${NC}"
echo -e "   Address: ${YELLOW}${FACTORY_ADDRESS}${NC}"
echo -e "   Network: Base Sepolia (84532)"
echo -e "   Explorer: https://sepolia.basescan.org/address/${FACTORY_ADDRESS}"
echo ""
echo -e "${YELLOW}📝 SIGUIENTE PASO:${NC}"
echo -e "   Agrega esta línea a tu backend .env:"
echo -e "   ${GREEN}FACTORY_CONTRACT_ADDRESS=${FACTORY_ADDRESS}${NC}"
echo ""
echo -e "${YELLOW}📚 DOCUMENTACIÓN:${NC}"
echo -e "   - DEPLOYMENT_CHECKLIST.md - Checklist completo"
echo -e "   - QUICK_START.md - Guía rápida"
echo -e "   - PASOS_FINALES_DEPLOYMENT.md - Guía detallada"
echo ""
echo -e "${GREEN}🎉 Sistema listo para mintear NFT tickets!${NC}"
echo ""
