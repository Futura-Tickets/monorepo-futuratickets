#!/bin/bash

# ============================================================
# FUTURATICKETS - SETUP VERIFICATION SCRIPT
# ============================================================
# Verifica que todo esté configurado correctamente antes del deployment
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
echo "  FUTURATICKETS SETUP VERIFICATION"
echo "============================================================"
echo -e "${NC}"

ERRORS=0
WARNINGS=0

# ============================================================
# Check Contracts Setup
# ============================================================
echo -e "${YELLOW}Verificando setup de contratos...${NC}"

# Check files exist
FILES=(
    "FuturaEvent.sol"
    "FuturaEventFactory.sol"
    "hardhat.config.ts"
    "package.json"
    ".env"
    "deploy/01_deploy_factory.ts"
    "scripts/create-event.ts"
    "test/FuturaEvent.test.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file - NOT FOUND"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check .env variables
echo ""
echo -e "${YELLOW}Verificando variables de entorno (.env)...${NC}"

if [ -f .env ]; then
    source .env

    # ALCHEMY_API_KEY
    if [ -z "$ALCHEMY_API_KEY" ]; then
        echo -e "${RED}❌${NC} ALCHEMY_API_KEY - NO CONFIGURADO"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅${NC} ALCHEMY_API_KEY - ${ALCHEMY_API_KEY:0:10}..."
    fi

    # DEPLOYER_PRIVATE_KEY
    if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
        echo -e "${RED}❌${NC} DEPLOYER_PRIVATE_KEY - NO CONFIGURADO"
        ERRORS=$((ERRORS + 1))
    elif [[ ! $DEPLOYER_PRIVATE_KEY =~ ^0x[a-fA-F0-9]{64}$ ]]; then
        echo -e "${RED}❌${NC} DEPLOYER_PRIVATE_KEY - FORMATO INVÁLIDO (debe ser 0x + 64 hex chars)"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅${NC} DEPLOYER_PRIVATE_KEY - ${DEPLOYER_PRIVATE_KEY:0:10}..."
    fi

    # BASESCAN_API_KEY
    if [ -z "$BASESCAN_API_KEY" ]; then
        echo -e "${RED}❌${NC} BASESCAN_API_KEY - NO CONFIGURADO"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅${NC} BASESCAN_API_KEY - ${BASESCAN_API_KEY:0:10}..."
    fi

    # DEPLOYER
    if [ -z "$DEPLOYER" ]; then
        echo -e "${RED}❌${NC} DEPLOYER - NO CONFIGURADO"
        ERRORS=$((ERRORS + 1))
    elif [[ ! $DEPLOYER =~ ^0x[a-fA-F0-9]{40}$ ]]; then
        echo -e "${RED}❌${NC} DEPLOYER - FORMATO INVÁLIDO (debe ser 0x + 40 hex chars)"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅${NC} DEPLOYER - $DEPLOYER"
    fi
fi

# ============================================================
# Check Backend Setup
# ============================================================
echo ""
echo -e "${YELLOW}Verificando setup del backend...${NC}"

BACKEND_DIR="../futura-tickets-admin-api"

if [ -d "$BACKEND_DIR" ]; then
    echo -e "${GREEN}✅${NC} Directorio backend encontrado"

    # Check backend .env
    if [ -f "$BACKEND_DIR/.env" ]; then
        echo -e "${GREEN}✅${NC} Backend .env encontrado"

        # Check backend env variables
        source "$BACKEND_DIR/.env"

        if [ -z "$BLOCKCHAIN_ENABLED" ]; then
            echo -e "${YELLOW}⚠️${NC}  BLOCKCHAIN_ENABLED no configurado (se asume false)"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✅${NC} BLOCKCHAIN_ENABLED - $BLOCKCHAIN_ENABLED"
        fi

        if [ -z "$ALCHEMY_API_KEY" ]; then
            echo -e "${RED}❌${NC} Backend: ALCHEMY_API_KEY no configurado"
            ERRORS=$((ERRORS + 1))
        fi

        if [ -z "$PIMLICO_API_KEY" ]; then
            echo -e "${RED}❌${NC} Backend: PIMLICO_API_KEY no configurado"
            ERRORS=$((ERRORS + 1))
        fi

        if [ -z "$WALLET_ENCRYPTION_KEY" ]; then
            echo -e "${RED}❌${NC} Backend: WALLET_ENCRYPTION_KEY no configurado"
            ERRORS=$((ERRORS + 1))
        elif [ ${#WALLET_ENCRYPTION_KEY} -ne 64 ]; then
            echo -e "${RED}❌${NC} Backend: WALLET_ENCRYPTION_KEY debe tener 64 caracteres hex"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${GREEN}✅${NC} Backend: WALLET_ENCRYPTION_KEY configurado"
        fi

        if [ -z "$FACTORY_CONTRACT_ADDRESS" ]; then
            echo -e "${YELLOW}⚠️${NC}  Backend: FACTORY_CONTRACT_ADDRESS no configurado (se configurará después del deployment)"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✅${NC} Backend: FACTORY_CONTRACT_ADDRESS - $FACTORY_CONTRACT_ADDRESS"
        fi
    else
        echo -e "${RED}❌${NC} Backend .env NO encontrado"
        ERRORS=$((ERRORS + 1))
    fi

    # Check ABIs directory
    if [ -d "$BACKEND_DIR/src/abis" ]; then
        echo -e "${GREEN}✅${NC} Directorio abis/ existe"

        if [ -f "$BACKEND_DIR/src/abis/FuturaEvent.json" ]; then
            echo -e "${GREEN}✅${NC} FuturaEvent.json encontrado"
        else
            echo -e "${YELLOW}⚠️${NC}  FuturaEvent.json no encontrado (se copiará durante deployment)"
            WARNINGS=$((WARNINGS + 1))
        fi

        if [ -f "$BACKEND_DIR/src/abis/FuturaEventFactory.json" ]; then
            echo -e "${GREEN}✅${NC} FuturaEventFactory.json encontrado"
        else
            echo -e "${YELLOW}⚠️${NC}  FuturaEventFactory.json no encontrado (se copiará durante deployment)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️${NC}  Directorio abis/ no existe (se creará durante deployment)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}❌${NC} Directorio backend NO encontrado: $BACKEND_DIR"
    ERRORS=$((ERRORS + 1))
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo -e "${BLUE}"
echo "============================================================"
echo "  RESUMEN DE VERIFICACIÓN"
echo "============================================================"
echo -e "${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO LISTO PARA DEPLOYMENT${NC}"
    echo ""
    echo "Puedes ejecutar:"
    echo -e "  ${GREEN}npm run deploy:baseSepolia -- --tags factory${NC}"
    echo "O usar el script automatizado:"
    echo -e "  ${GREEN}./scripts/deploy-and-setup.sh${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Setup completo con $WARNINGS warning(s)${NC}"
    echo ""
    echo "Puedes continuar con el deployment, pero revisa los warnings arriba."
    exit 0
else
    echo -e "${RED}❌ Setup incompleto: $ERRORS error(s), $WARNINGS warning(s)${NC}"
    echo ""
    echo "Por favor, corrige los errores antes de continuar."
    echo "Consulta:"
    echo -e "  ${YELLOW}QUICK_START.md${NC} - Para guía rápida"
    echo -e "  ${YELLOW}DEPLOYMENT_CHECKLIST.md${NC} - Para checklist completo"
    exit 1
fi
