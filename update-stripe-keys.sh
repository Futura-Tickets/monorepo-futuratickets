#!/bin/bash

clear
echo "═══════════════════════════════════════════════════════"
echo "  ACTUALIZAR STRIPE KEYS - FUTURATICKETS"
echo "═══════════════════════════════════════════════════════"
echo ""

ENV_FILE="/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api/.env"

# Mostrar keys actuales
echo "Keys actuales en .env:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep "STRIPE_PUBLIC_KEY" "$ENV_FILE"
grep "STRIPE_SECRET_KEY" "$ENV_FILE"
grep "STRIPE_WEBHOOK_SECRET" "$ENV_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Pedir nuevas keys
echo "Ingresa las nuevas keys de Stripe:"
echo ""
echo "1️⃣  PUBLISHABLE KEY (pk_test_...)"
read -p "   → " PK_KEY
echo ""

echo "2️⃣  SECRET KEY (sk_test_...)"
read -p "   → " SK_KEY
echo ""

echo "3️⃣  WEBHOOK SECRET (whsec_...) - Opcional, presiona Enter para omitir"
read -p "   → " WH_SECRET
echo ""

# Backup
echo "📦 Creando backup..."
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Backup creado"
echo ""

# Actualizar keys
echo "📝 Actualizando .env..."

if [ ! -z "$PK_KEY" ]; then
    sed -i.bak "s|STRIPE_PUBLIC_KEY=.*|STRIPE_PUBLIC_KEY=$PK_KEY|g" "$ENV_FILE"
    echo "  ✓ Publishable Key actualizada"
fi

if [ ! -z "$SK_KEY" ]; then
    sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$SK_KEY|g" "$ENV_FILE"
    echo "  ✓ Secret Key actualizada"
fi

if [ ! -z "$WH_SECRET" ]; then
    sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WH_SECRET|g" "$ENV_FILE"
    echo "  ✓ Webhook Secret actualizado"
fi

rm -f "$ENV_FILE.bak"
echo ""

# Mostrar nuevas keys
echo "═══════════════════════════════════════════════════════"
echo "✅ CONFIGURACIÓN ACTUALIZADA"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Nuevas keys en .env:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep "STRIPE_PUBLIC_KEY" "$ENV_FILE"
grep "STRIPE_SECRET_KEY" "$ENV_FILE"
grep "STRIPE_WEBHOOK_SECRET" "$ENV_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Si aún no has obtenido el webhook secret:"
echo "   stripe listen --forward-to localhost:4101/stripe/webhook"
echo "   Luego ejecuta este script nuevamente para agregar el whsec_..."
echo ""
echo "2. Reinicia el Admin API:"
echo "   cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api"
echo "   npm run start:dev"
echo ""
echo "3. Verifica la configuración:"
echo "   curl http://localhost:4101/stripe/config"
echo ""
