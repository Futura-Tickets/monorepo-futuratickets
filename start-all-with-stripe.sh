#!/bin/bash

echo "🚀 Iniciando entorno completo de FuturaTickets..."
echo ""

# Verificar Stripe CLI
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI no instalado"
    echo "Instalar con: brew install stripe/stripe-cli/stripe"
    exit 1
fi

# Verificar que estamos en el directorio correcto
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Terminal 1: Admin API
echo "📦 Iniciando Admin API en puerto 4101..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/futura-tickets-admin-api && PORT=4101 npm run start:dev"' 2>/dev/null

sleep 2

# Terminal 2: Access API
echo "🔐 Iniciando Access API en puerto 4103..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/futura-access-api && PORT=4103 npm run start:dev"' 2>/dev/null

sleep 2

# Terminal 3: Marketplace
echo "🛒 Iniciando Marketplace en puerto 3000..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/futura-market-place-v2 && npm run dev"' 2>/dev/null

sleep 2

# Terminal 4: Access Web App
echo "📱 Iniciando Access Web App en puerto 3003..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/futura-tickets-web-access-app && npm run dev"' 2>/dev/null

sleep 2

# Terminal 5: Stripe Listener
echo "💳 Iniciando Stripe Webhook Listener..."
osascript -e 'tell app "Terminal" to do script "stripe listen --forward-to localhost:4101/stripe/webhook"' 2>/dev/null

sleep 5

echo ""
echo "✅ Entorno iniciado correctamente!"
echo ""
echo "📍 URLs disponibles:"
echo "   Admin API:      http://localhost:4101"
echo "   Access API:     http://localhost:4103"
echo "   Marketplace:    http://localhost:3000"
echo "   Access Web:     http://localhost:3003"
echo ""
echo "💡 Stripe Webhook Listener está activo"
echo "   ⚠️  IMPORTANTE: Copia el webhook secret que aparece en la terminal"
echo "   y actualízalo en futura-tickets-admin-api/.env como:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx"
echo ""
echo "📚 Próximos pasos:"
echo "   1. Verifica que todas las terminales iniciaron correctamente"
echo "   2. Copia el webhook secret de Stripe"
echo "   3. Actualiza .env con el secret"
echo "   4. Reinicia Admin API si cambiaste el .env"
echo "   5. Ver PRUEBA_FLUJO_E2E.md para continuar"
echo ""
