#!/bin/bash

echo "🎯 CONFIGURACIÓN SIMPLE DE STRIPE"
echo "=================================="
echo ""
echo "Este script te ayudará a configurar Stripe paso a paso."
echo ""

# Directorio del proyecto
PROJECT_DIR="/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api"
ENV_FILE="$PROJECT_DIR/.env"

# Abrir navegador con Stripe Dashboard
echo "📋 PASO 1: Obtener las Stripe Test Keys"
echo ""
echo "Voy a abrir el Stripe Dashboard en tu navegador..."
echo ""
sleep 2
open "https://dashboard.stripe.com/test/apikeys"

echo "Mientras se abre el navegador:"
echo "1. Inicia sesión en Stripe si no lo has hecho"
echo "2. En la sección 'Standard keys' encontrarás:"
echo "   - Publishable key (comienza con pk_test_)"
echo "   - Secret key (haz clic en 'Reveal test key' para verla, comienza con sk_test_)"
echo ""
read -p "Presiona ENTER cuando estés listo para ingresar las keys..."
echo ""

# Pedir las keys
read -p "Ingresa tu PUBLISHABLE KEY (pk_test_...): " STRIPE_PUBLIC_KEY
read -p "Ingresa tu SECRET KEY (sk_test_...): " STRIPE_SECRET_KEY

echo ""
echo "✓ Keys recibidas"
echo ""

# Backup del .env
echo "📦 Creando backup del .env..."
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Backup creado"
echo ""

# Actualizar .env
echo "📝 Actualizando archivo .env..."
sed -i.bak "s|STRIPE_PUBLIC_KEY=.*|STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY|g" "$ENV_FILE"
sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|g" "$ENV_FILE"
rm "$ENV_FILE.bak"
echo "✓ Archivo .env actualizado"
echo ""

# Configurar webhook listener
echo "📋 PASO 2: Configurar Webhook Listener"
echo ""
echo "Necesitas ejecutar el webhook listener en una terminal separada."
echo "Este comando mantendrá el listener activo:"
echo ""
echo "  stripe listen --forward-to localhost:4101/stripe/webhook"
echo ""
echo "Cuando lo ejecutes, verás un mensaje como:"
echo "  'Ready! Your webhook signing secret is whsec_xxxxx'"
echo ""
read -p "¿Quieres que abra una nueva terminal con este comando? (y/n): " OPEN_TERMINAL

if [ "$OPEN_TERMINAL" = "y" ] || [ "$OPEN_TERMINAL" = "Y" ]; then
    osascript -e 'tell app "Terminal" to do script "cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets && echo \"🎯 STRIPE WEBHOOK LISTENER\" && echo \"\" && echo \"IMPORTANTE: Copia el webhook secret (whsec_...) que aparece abajo\" && echo \"y actualiza el archivo .env con ese valor.\" && echo \"\" && stripe listen --forward-to localhost:4101/stripe/webhook"'
    echo ""
    echo "✓ Nueva terminal abierta"
    echo ""
    sleep 3

    echo "Ahora copia el webhook secret de la terminal que acaba de abrirse."
    echo ""
    read -p "Ingresa el WEBHOOK SECRET (whsec_...): " WEBHOOK_SECRET

    if [ ! -z "$WEBHOOK_SECRET" ]; then
        sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|g" "$ENV_FILE"
        rm "$ENV_FILE.bak"
        echo "✓ Webhook secret actualizado"
    fi
fi

echo ""
echo "=========================================="
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "Configuración final:"
grep "STRIPE" "$ENV_FILE"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Reinicia el Admin API (si está corriendo):"
echo "   cd $PROJECT_DIR"
echo "   npm run start:dev"
echo ""
echo "2. Verifica que Stripe esté configurado:"
echo "   curl http://localhost:4101/stripe/config"
echo ""
echo "   Deberías ver tu pk_test_... key"
echo ""
echo "3. Si no abriste el webhook listener, ábrelo manualmente:"
echo "   stripe listen --forward-to localhost:4101/stripe/webhook"
echo ""
echo "4. Para probar el flujo completo E2E:"
echo "   cat /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/PRUEBA_FLUJO_E2E.md"
echo ""
echo "¡Listo! 🎉"
echo ""
