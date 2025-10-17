# 🎯 INSTRUCCIONES PARA CONFIGURAR STRIPE

## PASO 1: Obtener las Keys de Stripe (5 minutos)

El navegador debe haberse abierto en: **https://dashboard.stripe.com/test/apikeys**

Si no se abrió, copia y pega esa URL en tu navegador.

### En el Dashboard de Stripe:

1. **Inicia sesión** si aún no lo has hecho
2. Asegúrate de estar en modo **TEST** (arriba a la derecha debe decir "Test mode")
3. En la sección "Standard keys" verás dos keys:

   ```
   Publishable key    pk_test_51xxxxxxxxxxxxx
   Secret key         sk_test_51xxxxxxxxxxxxx (Reveal test key)
   ```

4. **COPIA** ambas keys:
   - La `pk_test_...` (Publishable key) - está visible
   - La `sk_test_...` (Secret key) - haz clic en "Reveal test key" para verla

---

## PASO 2: Ejecutar el Script de Configuración (2 minutos)

Abre una terminal y ejecuta:

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./configure-stripe-simple.sh
```

El script te pedirá:
1. Tu Publishable Key (pk_test_...)
2. Tu Secret Key (sk_test_...)
3. Si quieres abrir el webhook listener automáticamente

**PEGA** las keys cuando te las pida.

---

## PASO 3: Configurar Webhook (3 minutos)

El script abrirá una nueva terminal con el comando:

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

Cuando se ejecute, verás algo como:

```
> Ready! Your webhook signing secret is whsec_abc123xyz...
```

**COPIA** ese `whsec_...` y pégalo cuando el script te lo pida.

---

## ALTERNATIVA: Configuración Manual (si el script falla)

Si prefieres hacerlo manualmente:

### 1. Editar el archivo .env

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
nano .env
```

### 2. Reemplazar estas líneas:

```bash
# Cambiar de:
STRIPE_PUBLIC_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# A (con tus keys reales):
STRIPE_PUBLIC_KEY=pk_test_51xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Guardar y salir:
- Presiona `Ctrl + O` para guardar
- Presiona `Enter` para confirmar
- Presiona `Ctrl + X` para salir

### 4. Iniciar webhook listener en otra terminal:

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

Copia el `whsec_...` que aparece y actualiza el .env con ese valor.

---

## VERIFICACIÓN

Una vez completada la configuración:

### 1. Reinicia el Admin API

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev
```

### 2. Verifica que Stripe esté configurado:

```bash
curl http://localhost:3001/stripe/config
```

Deberías ver una respuesta como:

```json
{"config":"pk_test_51xxxxxxxxxxxxx"}
```

Si ves tu `pk_test_...` real (no "pk_test_placeholder"), ¡está funcionando! ✅

---

## SIGUIENTE PASO

Una vez configurado Stripe, puedes probar el flujo completo:

```bash
cat /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/PRUEBA_FLUJO_E2E.md
```

---

## ⚠️ IMPORTANTE

- **NO compartas** tus Secret Keys con nadie
- **NO las subas** a GitHub (el .env está en .gitignore)
- Estas son keys de **TEST** - son seguras para desarrollo local
- El webhook listener debe **permanecer activo** mientras pruebas el sistema

---

## 🆘 AYUDA

Si tienes problemas:

1. Verifica que estás en modo TEST en Stripe Dashboard
2. Verifica que copiaste las keys completas (sin espacios al inicio/final)
3. Verifica que el webhook listener esté corriendo (`stripe listen...`)
4. Reinicia el Admin API después de cambiar el .env

---

**Tiempo estimado total: 10-15 minutos**

¡Buena suerte! 🚀
