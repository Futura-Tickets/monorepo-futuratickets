# 🚀 EMPEZAR AQUÍ - CONFIGURACIÓN DE STRIPE

## ⚡ ACCIÓN RÁPIDA (5 minutos)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./update-stripe-keys.sh
```

## 📋 PASOS DETALLADOS

### 1️⃣ Obtener Keys de Stripe (2 min)

El navegador ya está abierto en: https://dashboard.stripe.com/test/apikeys

**Copia estas 2 keys:**
- `Publishable key` → Visible directamente → `pk_test_...`
- `Secret key` → Clic en "Reveal test key" → `sk_test_...`

### 2️⃣ Ejecutar Script (1 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./update-stripe-keys.sh
```

Pega las keys cuando te las pida.

### 3️⃣ Webhook Listener (2 min)

En otra terminal:

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

**Copia** el `whsec_...` que aparece.

Ejecuta el script nuevamente:

```bash
./update-stripe-keys.sh
```

Y pega solo el webhook secret (deja las otras en blanco presionando Enter).

### 4️⃣ Reiniciar API (1 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev
```

### 5️⃣ Verificar (30 seg)

```bash
curl http://localhost:3001/stripe/config
```

Deberías ver tu `pk_test_...` real ✅

---

## 📚 SI NECESITAS MÁS AYUDA

- **Guía paso a paso:** `INSTRUCCIONES_STRIPE.md`
- **Guía completa:** `STRIPE_CONFIGURADO.md`
- **Documentación técnica:** `CONFIGURACION_STRIPE.md`

---

## 🎯 SIGUIENTE PASO

Una vez configurado:

```bash
cat PRUEBA_FLUJO_E2E.md
```

¡Listo! 🎉
