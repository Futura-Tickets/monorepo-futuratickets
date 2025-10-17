#!/bin/bash

echo "🎯 CONFIGURACIÓN AUTOMÁTICA DE STRIPE PARA FUTURATICKETS"
echo "=========================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api"
ENV_FILE="$PROJECT_DIR/.env"

# Paso 1: Verificar Stripe CLI
echo -e "${BLUE}[1/6]${NC} Verificando Stripe CLI..."
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}✗ Stripe CLI no encontrado${NC}"
    echo "Instalando Stripe CLI..."
    brew install stripe/stripe-cli/stripe
else
    echo -e "${GREEN}✓ Stripe CLI ya instalado${NC}"
    stripe --version
fi
echo ""

# Paso 2: Login en Stripe
echo -e "${BLUE}[2/6]${NC} Login en Stripe..."
echo -e "${YELLOW}Se abrirá tu navegador para autorizar el acceso.${NC}"
echo -e "${YELLOW}Por favor, completa la autorización en el navegador.${NC}"
echo ""
read -p "Presiona ENTER para continuar..."

stripe login

echo ""
echo -e "${GREEN}✓ Login completado${NC}"
echo ""

# Paso 3: Obtener las keys de Stripe automáticamente
echo -e "${BLUE}[3/6]${NC} Obteniendo Stripe Test Keys..."
echo ""

# Intentar obtener las keys usando la Stripe CLI
STRIPE_SECRET_KEY=$(stripe keys list --test 2>/dev/null | grep "Secret key" | awk '{print $3}' | head -1)
STRIPE_PUBLIC_KEY=$(stripe keys list --test 2>/dev/null | grep "Publishable key" | awk '{print $3}' | head -1)

# Si no funcionó el comando anterior, pedir keys manualmente
if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_PUBLIC_KEY" ]; then
    echo -e "${YELLOW}No se pudieron obtener las keys automáticamente.${NC}"
    echo ""
    echo "Por favor, ve a: ${BLUE}https://dashboard.stripe.com/test/apikeys${NC}"
    echo ""
    read -p "Ingresa tu Stripe SECRET KEY (sk_test_...): " STRIPE_SECRET_KEY
    read -p "Ingresa tu Stripe PUBLISHABLE KEY (pk_test_...): " STRIPE_PUBLIC_KEY
fi

echo ""
echo -e "${GREEN}✓ Keys obtenidas:${NC}"
echo "  - Public Key: ${STRIPE_PUBLIC_KEY:0:20}..."
echo "  - Secret Key: ${STRIPE_SECRET_KEY:0:20}..."
echo ""

# Paso 4: Actualizar .env
echo -e "${BLUE}[4/6]${NC} Actualizando archivo .env..."

# Backup del .env original
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓ Backup creado${NC}"

# Actualizar las keys en el .env
sed -i.bak "s|STRIPE_PUBLIC_KEY=.*|STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY|g" "$ENV_FILE"
sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|g" "$ENV_FILE"
rm "$ENV_FILE.bak"

echo -e "${GREEN}✓ Archivo .env actualizado${NC}"
echo ""

# Paso 5: Iniciar webhook listener
echo -e "${BLUE}[5/6]${NC} Iniciando Stripe Webhook Listener..."
echo ""
echo -e "${YELLOW}IMPORTANTE: Deja esta terminal abierta para mantener el listener activo${NC}"
echo ""

# Iniciar listener en background y capturar el webhook secret
WEBHOOK_OUTPUT=$(stripe listen --forward-to localhost:4101/stripe/webhook --print-secret 2>&1)
WEBHOOK_SECRET=$(echo "$WEBHOOK_OUTPUT" | grep "whsec_" | awk '{print $NF}')

if [ ! -z "$WEBHOOK_SECRET" ]; then
    echo -e "${GREEN}✓ Webhook secret obtenido: ${WEBHOOK_SECRET:0:20}...${NC}"

    # Actualizar webhook secret en .env
    sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|g" "$ENV_FILE"
    rm "$ENV_FILE.bak"
    echo -e "${GREEN}✓ Webhook secret actualizado en .env${NC}"
else
    echo -e "${RED}✗ No se pudo obtener el webhook secret automáticamente${NC}"
    echo "Ejecuta manualmente: stripe listen --forward-to localhost:4101/stripe/webhook"
fi
echo ""

# Paso 6: Verificar configuración
echo -e "${BLUE}[6/6]${NC} Verificando configuración..."
echo ""

# Mostrar las configuraciones actuales
echo "Configuración actual en .env:"
grep "STRIPE" "$ENV_FILE"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ CONFIGURACIÓN COMPLETADA${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Reinicia el Admin API para aplicar los cambios:"
echo "   ${BLUE}cd $PROJECT_DIR && npm run start:dev${NC}"
echo ""
echo "2. Verifica la configuración:"
echo "   ${BLUE}curl http://localhost:4101/stripe/config${NC}"
echo ""
echo "3. El webhook listener debe estar corriendo. Si no lo está:"
echo "   ${BLUE}stripe listen --forward-to localhost:4101/stripe/webhook${NC}"
echo ""
echo "4. Para probar el flujo E2E:"
echo "   ${BLUE}cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets${NC}"
echo "   ${BLUE}cat PRUEBA_FLUJO_E2E.md${NC}"
echo ""
