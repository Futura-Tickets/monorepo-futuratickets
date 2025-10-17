#!/bin/bash

# ============================================================
# FUTURATICKETS - TEST DEPLOYMENT SCRIPT
# ============================================================
# Script para probar el deployment en localhost antes de testnet
# Útil para verificar que todo funcione antes de gastar ETH real
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "============================================================"
echo "  FUTURATICKETS LOCAL DEPLOYMENT TEST"
echo "============================================================"
echo -e "${NC}"

# ============================================================
# STEP 1: Start local Hardhat node
# ============================================================
echo -e "${YELLOW}[1/5] Iniciando nodo local de Hardhat...${NC}"

# Kill any existing Hardhat node
pkill -f "hardhat node" || true

# Start Hardhat node in background
npx hardhat node &
NODE_PID=$!

echo -e "${GREEN}✅ Nodo Hardhat iniciado (PID: $NODE_PID)${NC}"
echo "   RPC: http://127.0.0.1:8545"
echo "   Chain ID: 31337"

# Wait for node to be ready
sleep 5

# ============================================================
# STEP 2: Compile contracts
# ============================================================
echo ""
echo -e "${YELLOW}[2/5] Compilando contratos...${NC}"

npm run compile

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contratos compilados${NC}"
else
    echo -e "${RED}❌ Error compilando${NC}"
    kill $NODE_PID
    exit 1
fi

# ============================================================
# STEP 3: Deploy to localhost
# ============================================================
echo ""
echo -e "${YELLOW}[3/5] Deploying a localhost...${NC}"

npx hardhat deploy --network localhost --tags factory

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Factory deployed a localhost${NC}"
else
    echo -e "${RED}❌ Error deploying${NC}"
    kill $NODE_PID
    exit 1
fi

# Extract localhost deployment address
if [ -f deployments/localhost/FuturaEventFactory.json ]; then
    FACTORY_ADDRESS=$(cat deployments/localhost/FuturaEventFactory.json | grep -o '"address":"0x[a-fA-F0-9]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Factory Address: ${FACTORY_ADDRESS}${NC}"
fi

# ============================================================
# STEP 4: Run tests against deployed contracts
# ============================================================
echo ""
echo -e "${YELLOW}[4/5] Ejecutando tests...${NC}"

npm test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los tests pasaron${NC}"
else
    echo -e "${RED}❌ Tests fallaron${NC}"
    kill $NODE_PID
    exit 1
fi

# ============================================================
# STEP 5: Test event creation
# ============================================================
echo ""
echo -e "${YELLOW}[5/5] Probando creación de evento...${NC}"

npx hardhat run scripts/create-event.ts --network localhost

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Evento creado exitosamente${NC}"
else
    echo -e "${RED}❌ Error creando evento${NC}"
    kill $NODE_PID
    exit 1
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo -e "${BLUE}"
echo "============================================================"
echo "  LOCAL DEPLOYMENT TEST COMPLETADO"
echo "============================================================"
echo -e "${NC}"

echo -e "${GREEN}✅ Nodo local funcionando${NC}"
echo -e "${GREEN}✅ Factory deployed${NC}"
echo -e "${GREEN}✅ Tests pasaron${NC}"
echo -e "${GREEN}✅ Evento de prueba creado${NC}"
echo ""
echo -e "${YELLOW}📝 Nodo Hardhat sigue corriendo en background${NC}"
echo -e "   PID: ${NODE_PID}"
echo -e "   Para detenerlo: ${RED}kill ${NODE_PID}${NC}"
echo ""
echo -e "${GREEN}🎉 Sistema listo para deployment a Base Sepolia!${NC}"
echo ""

# Keep script running to keep node alive
echo -e "${YELLOW}Presiona Ctrl+C para detener el nodo y salir${NC}"
wait $NODE_PID
