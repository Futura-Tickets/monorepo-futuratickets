# ✅ STRIPE - CONFIGURACIÓN PREPARADA

## 📦 LO QUE HE HECHO POR TI

### 1. Instalación Completada ✅
- ✅ Stripe CLI instalado (versión 1.31.0)
- ✅ Navegador abierto con el dashboard de Stripe: https://dashboard.stripe.com/test/apikeys

### 2. Scripts Creados ✅

He creado **3 scripts** para facilitar la configuración:

#### Opción 1: Script Simple (RECOMENDADO)
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./update-stripe-keys.sh
```

**Qué hace:**
- Te pide las 3 keys de Stripe
- Actualiza automáticamente el archivo .env
- Crea backup antes de modificar
- Te muestra las configuraciones actuales

#### Opción 2: Script Completo
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./configure-stripe-simple.sh
```

**Qué hace:**
- Abre el navegador en Stripe Dashboard
- Te guía paso a paso
- Abre automáticamente una terminal para el webhook listener
- Configura todo en un solo proceso

#### Opción 3: Script Automatizado Avanzado
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./setup-stripe-auto.sh
```

### 3. Documentación Creada ✅

- ✅ **INSTRUCCIONES_STRIPE.md** - Guía paso a paso detallada
- ✅ **CONFIGURACION_STRIPE.md** - Guía técnica completa (creada previamente)

---

## 🎯 LO QUE TIENES QUE HACER (5-10 minutos)

### OPCIÓN A: Usando el script (más fácil)

```bash
# 1. Ejecuta el script
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./update-stripe-keys.sh

# 2. Cuando te pida las keys, ve al navegador que abrí:
#    https://dashboard.stripe.com/test/apikeys
#
#    Y copia/pega:
#    - Publishable key: pk_test_...
#    - Secret key: sk_test_... (haz clic en "Reveal test key")

# 3. Para el webhook secret, abre otra terminal y ejecuta:
stripe listen --forward-to localhost:3001/stripe/webhook

# 4. Copia el whsec_... que aparece y ejecuta el script nuevamente
./update-stripe-keys.sh

# 5. Reinicia el Admin API
cd futura-tickets-admin-api
npm run start:dev
```

### OPCIÓN B: Manual (si prefieres hacerlo tú mismo)

```bash
# 1. Editar el .env
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
nano .env

# 2. Buscar estas líneas y reemplazar:
STRIPE_PUBLIC_KEY=pk_test_TU_KEY_AQUI
STRIPE_SECRET_KEY=sk_test_TU_KEY_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_AQUI

# 3. Guardar (Ctrl+O, Enter, Ctrl+X)

# 4. Iniciar webhook listener en otra terminal
stripe listen --forward-to localhost:3001/stripe/webhook

# 5. Reiniciar Admin API
npm run start:dev
```

---

## 🔍 VERIFICACIÓN

Una vez que hayas configurado las keys:

### 1. Verificar que el .env tiene las keys reales:

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
grep STRIPE .env
```

Deberías ver algo como:
```
STRIPE_PUBLIC_KEY=pk_test_51ABC123...
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

**NO** deberías ver "placeholder".

### 2. Verificar que el Admin API reconoce las keys:

```bash
curl http://localhost:3001/stripe/config
```

Deberías ver:
```json
{"config":"pk_test_51ABC123..."}
```

Si ves tu `pk_test_` real, ¡FUNCIONA! ✅

### 3. Verificar el webhook listener:

En la terminal donde ejecutaste `stripe listen`, deberías ver:
```
> Ready! Your webhook signing secret is whsec_xxxxx
> 2025-10-16 12:00:00  --> charge.succeeded [evt_xxxxx]
```

---

## 📚 SIGUIENTE PASO: PRUEBA E2E

Una vez configurado Stripe, puedes probar el flujo completo de compra:

```bash
cat /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/PRUEBA_FLUJO_E2E.md
```

Los scripts de prueba están en `/tmp/`:
```bash
ls -la /tmp/*-e2e-*.sh
```

---

## 📁 ARCHIVOS IMPORTANTES

```
monorepo-futuratickets/
├── update-stripe-keys.sh          ← Script simple para actualizar keys
├── configure-stripe-simple.sh     ← Script completo con guía
├── setup-stripe-auto.sh           ← Script automatizado avanzado
├── INSTRUCCIONES_STRIPE.md        ← Guía detallada paso a paso
├── CONFIGURACION_STRIPE.md        ← Guía técnica completa
├── PRUEBA_FLUJO_E2E.md            ← Pruebas end-to-end
└── futura-tickets-admin-api/
    └── .env                       ← Archivo que debes modificar
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Seguridad:**
   - Las keys que uses son de TEST (no de producción)
   - Nunca compartas tus Secret Keys
   - El .env está en .gitignore (no se sube a GitHub)

2. **Webhook Listener:**
   - Debe estar corriendo SIEMPRE que pruebes pagos
   - Si lo cierras, el sistema no recibirá las confirmaciones de pago
   - Ejecuta: `stripe listen --forward-to localhost:3001/stripe/webhook`

3. **Reiniciar el servidor:**
   - SIEMPRE reinicia el Admin API después de cambiar el .env
   - Los cambios en variables de entorno solo se aplican al reiniciar

---

## 🆘 SI TIENES PROBLEMAS

### Problema: "Command not found: stripe"
**Solución:** El Stripe CLI ya está instalado, recarga tu terminal:
```bash
source ~/.zshrc
# o
source ~/.bashrc
```

### Problema: "Invalid API Key"
**Solución:** Verifica que copiaste las keys completas (sin espacios)

### Problema: El webhook no recibe eventos
**Solución:**
1. Verifica que `stripe listen` esté corriendo
2. Verifica que el STRIPE_WEBHOOK_SECRET esté actualizado en .env
3. Reinicia el Admin API

---

## 📊 ESTADO ACTUAL

- ✅ Stripe CLI instalado
- ✅ Scripts de configuración creados
- ✅ Navegador abierto en Stripe Dashboard
- ✅ Documentación completa disponible
- ⏳ **PENDIENTE:** Copiar las keys de Stripe y ejecutar el script

**Tiempo estimado para completar:** 5-10 minutos

---

## 🎯 RESUMEN EJECUTIVO

**Lo que ya está listo:**
- Stripe CLI instalado ✅
- Scripts automatizados creados ✅
- Documentación completa ✅
- Navegador abierto en dashboard ✅

**Lo que necesitas hacer:**
1. Copiar 2 keys del dashboard de Stripe (2 min)
2. Ejecutar `./update-stripe-keys.sh` (1 min)
3. Iniciar webhook listener (1 min)
4. Copiar webhook secret y actualizar (1 min)
5. Reiniciar Admin API (1 min)

**TOTAL: 6 minutos** para tener Stripe completamente configurado.

---

**Última actualización:** 2025-10-16
**Creado por:** Claude (Configuración automática de Stripe)
