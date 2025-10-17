# CONFIGURACIÓN DE STRIPE PARA FUTURATICKETS

## 🎯 OBJETIVO
Configurar Stripe para habilitar el flujo completo de pagos y generación de tickets.

---

## ⚡ PASOS CRÍTICOS (30 minutos)

### 1. Obtener Stripe Test Keys

#### A. Ir a Stripe Dashboard
```
https://dashboard.stripe.com/test/apikeys
```

#### B. Copiar las Keys
Necesitas **2 keys**:
1. **Publishable key** (comienza con `pk_test_`)
2. **Secret key** (comienza con `sk_test_`)

#### C. Actualizar archivo .env
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

# Editar .env y reemplazar:
STRIPE_PUBLIC_KEY=pk_test_TU_KEY_AQUI
STRIPE_SECRET_KEY=sk_test_TU_KEY_AQUI
```

---

### 2. Configurar Stripe CLI (Para Webhooks Locales)

#### A. Instalar Stripe CLI
```bash
# macOS (con Homebrew)
brew install stripe/stripe-cli/stripe

# Verificar instalación
stripe --version
```

#### B. Login en Stripe CLI
```bash
stripe login
# Se abrirá navegador para autorizar
```

#### C. Iniciar Listener de Webhooks
```bash
# En una terminal separada, ejecutar:
stripe listen --forward-to localhost:4101/stripe/webhook

# Output esperado:
# > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
# COPIAR EL SECRET!
```

#### D. Actualizar Webhook Secret en .env
```bash
# En el archivo .env:
STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_AQUI
```

#### E. Reiniciar el servidor
```bash
# Ctrl+C en el servidor actual
npm run start:dev
```

---

### 3. Verificar Configuración

#### A. Verificar endpoint de config
```bash
curl http://localhost:4101/stripe/config

# Debe retornar tu publishable key real:
# {"config":"pk_test_51..."}
```

#### B. Test de webhook
```bash
# En otra terminal, trigger un evento de prueba:
stripe trigger payment_intent.succeeded

# Deberías ver logs en:
# 1. Terminal de stripe listen
# 2. Terminal del servidor (logs de NestJS)
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de continuar, verifica que:
- [ ] Tienes acceso a Stripe Dashboard
- [ ] Has copiado las 2 keys (pk_test y sk_test)
- [ ] Has actualizado el archivo .env
- [ ] Has instalado Stripe CLI
- [ ] Has hecho login en Stripe CLI
- [ ] Stripe listen está corriendo
- [ ] Has copiado el webhook secret
- [ ] Has reiniciado el servidor
- [ ] El endpoint /stripe/config retorna tu key real

---

## 🧪 PRUEBA COMPLETA DEL FLUJO

Una vez configurado, ejecuta este script de prueba:

```bash
# 1. Login como usuario (necesitamos crear uno primero)
# Ver sección siguiente
```

---

## 🚀 AUTOMATIZACIÓN

### Script: Iniciar Todo el Entorno

Crea este archivo: `/Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/start-all-with-stripe.sh`

```bash
#!/bin/bash

echo "🚀 Iniciando entorno completo de FuturaTickets..."

# Verificar Stripe CLI
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI no instalado"
    echo "Instalar con: brew install stripe/stripe-cli/stripe"
    exit 1
fi

# Verificar que estamos en el directorio correcto
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Terminal 1: Admin API
echo "📦 Iniciando Admin API..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/futura-tickets-admin-api && npm run start:dev"'

# Terminal 2: Access API
echo "🔐 Iniciando Access API..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/futura-access-api && npm run start:dev"'

# Terminal 3: Marketplace
echo "🛒 Iniciando Marketplace..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/futura-market-place-v2 && npm run dev"'

# Terminal 4: Access Web App
echo "📱 Iniciando Access Web App..."
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/futura-tickets-web-access-app && npm run dev"'

# Terminal 5: Stripe Listener
echo "💳 Iniciando Stripe Webhook Listener..."
osascript -e 'tell app "Terminal" to do script "stripe listen --forward-to localhost:4101/stripe/webhook"'

sleep 5

echo ""
echo "✅ Entorno iniciado!"
echo ""
echo "📍 URLs disponibles:"
echo "   Admin API:      http://localhost:4101"
echo "   Access API:     http://localhost:4103"
echo "   Marketplace:    http://localhost:3000"
echo "   Access Web:     http://localhost:3003"
echo ""
echo "💡 Stripe Webhook Listener está activo"
echo "   Copia el webhook secret a tu .env si aún no lo has hecho"
echo ""
```

Hacer ejecutable:
```bash
chmod +x /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/start-all-with-stripe.sh
```

Ejecutar:
```bash
./start-all-with-stripe.sh
```

---

## 🔍 TROUBLESHOOTING

### Problema: "Invalid API Key provided"
**Solución**:
- Verifica que copiaste la key completa
- Asegúrate de usar la key de TEST (pk_test / sk_test)
- Reinicia el servidor después de cambiar .env

### Problema: Webhook no recibe eventos
**Solución**:
- Verifica que `stripe listen` está corriendo
- Verifica la URL en el forward-to (debe ser localhost:4101/stripe/webhook)
- Verifica que el STRIPE_WEBHOOK_SECRET está actualizado en .env

### Problema: "No such payment_intent"
**Solución**:
- Este error es normal si intentas buscar un payment_intent que no existe
- Primero debes crear uno con el flujo de compra

---

## 📚 RECURSOS

- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhooks Testing](https://stripe.com/docs/webhooks/test)

---

## ⏭️ SIGUIENTE PASO

Una vez completada esta configuración, continúa con:
1. Crear usuario de prueba para compras
2. Realizar primera compra de prueba
3. Verificar generación automática de tickets

Ver: `PRUEBA_FLUJO_E2E.md`
