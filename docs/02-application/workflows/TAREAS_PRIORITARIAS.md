# 🎯 TAREAS PRIORITARIAS - FUTURA TICKETS

## 📋 INFORMACIÓN DE ACCESO

### 🛍️ MARKETPLACE (http://localhost:3001)
**Para clientes que compran tickets**

**Crear cuenta nueva:**
- URL: http://localhost:3001/login
- Opciones: Google OAuth o Email/Password

**⚠️ PROBLEMA ACTUAL:** Los intentos de login están fallando con error 401 "Error Login In!"

---

### 📊 ADMIN DASHBOARD (http://localhost:3003)
**Para promotores que gestionan eventos**

**Credenciales:**
- Email: admin@futuratickets.com
- Password: FuturaAdmin2025!
- URL: http://localhost:3003/login

**Usuarios adicionales con rol ADMIN:**
- test@gmail.com
- test@futuratickets.com

**Funcionalidades:**
- Gestión de eventos
- Ver ventas y órdenes
- Gestión de clientes
- Analytics
- Campañas de marketing
- Configuración de pagos

---

### 🔧 BACKEND API (http://localhost:3002)
**No requiere login directo**

**Verificar salud:**
```bash
curl http://localhost:3002/health
```

---

## 🚨 TAREAS CRÍTICAS (PRIORIDAD MÁXIMA)

### ✅ COMPLETADAS
1. ✅ Separar marketplace y admin dashboard a diferentes puertos
2. ✅ Crear usuarios ADMIN en base de datos
3. ✅ Implementar PromoterController en backend
4. ✅ Configurar httpOnly cookies para autenticación

### ⚠️ PENDIENTES CRÍTICAS

#### 1. Arreglar error de login en marketplace (401 Unauthorized)
**Problema:**
```
API Route: Error en inicio de sesión: { message: 'Error Login In!', error: 'Unauthorized', statusCode: 401 }
POST /api/auth/login-credentials 401
```

**Archivo:** `/futura-market-place-v2/app/api/auth/login-credentials/route.ts`

**Posibles causas:**
- Backend API no está respondiendo correctamente en puerto 3002
- Variables de entorno incorrectas (`NEXT_PUBLIC_FUTURA_API`)
- Usuario no existe en la base de datos
- Backend requiere campos adicionales

**Cómo arreglar:**
```bash
# 1. Verificar que el backend está corriendo
curl http://localhost:3002/health

# 2. Verificar variables de entorno
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2
cat .env.local | grep FUTURA_API

# 3. Probar endpoint directamente
curl -X POST http://localhost:3002/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@futuratickets.com","password":"test123"}'

# 4. Verificar logs del backend
tail -f /tmp/marketplace-api.log
```

**Archivo a revisar:**
`/futura-market-place-v2/app/api/auth/login-credentials/route.ts`

---

#### 2. Verificar variables de entorno en todos los servicios

**Marketplace (.env.local):**
```bash
NEXT_PUBLIC_FUTURA_API=http://localhost:3002
NEXT_PUBLIC_FUTURA=http://localhost:3002
NEXT_PUBLIC_BLOB_URL=https://futurastorage.blob.core.windows.net
GOOGLE_CLIENT_ID=...
```

**Admin Dashboard (.env.local):**
```bash
NEXT_PUBLIC_FUTURA=http://localhost:3002
NEXT_PUBLIC_ACCESS=http://localhost:3003
NEXT_PUBLIC_MARKETPLACE=http://localhost:3001
```

**Backend APIs (.env):**
```bash
PORT=3002
MONGO_URL=mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod
JWT_SECRET_KEY=...
STRIPE_PUBLIC_KEY=...
STRIPE_PRIVATE_KEY=...
```

---

#### 3. Implementar Stripe Webhooks

**Archivo a crear:** `/futura-market-place-api/src/Stripe/stripe.controller.ts`

**Agregar endpoint:**
```typescript
@Post('/webhook')
@HttpCode(200)
async handleWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Res() res: Response
) {
  const sig = req.headers['stripe-signature'];

  try {
    const event = this.stripeService.registerEvents(
      req.rawBody,
      sig
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.processSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

private async processSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  // 1. Buscar órdenes por paymentId
  const orders = await this.ordersService.getOrdersByPaymentId(paymentIntent.id);

  // 2. Actualizar estado de órdenes a SUCCEEDED
  await this.ordersService.updateOrdersById(
    orders.map(o => o._id),
    { status: OrderStatus.SUCCEEDED }
  );

  // 3. Crear tickets (sales)
  for (const order of orders) {
    const sales = await this.salesService.createSalesForOrder(order);

    // 4. Generar QR codes
    for (const sale of sales) {
      sale.qrCode = await qrcode.toDataURL(sale._id);
    }

    // 5. Enviar email de confirmación
    await this.mailService.sendOrderConfirmation(order);
  }
}
```

---

#### 4. Arreglar GlobalContext en marketplace

**Archivo:** `/futura-market-place-v2/contexts/global-context.tsx:36-39`

**Bug actual:**
```typescript
// ❌ INCORRECTO
<GlobalContext.Provider value={{
  ...globalContextState,
  ...availableCountries,  // Spread de array como objeto
  setAvailableCountries,
  ...citiesByCountry,     // Spread de array como objeto
  setCitiesByCountry
}}>
```

**Corrección:**
```typescript
// ✅ CORRECTO
<GlobalContext.Provider value={{
  ...globalContextState,
  availableCountries,     // Pasar como propiedad
  setAvailableCountries,
  citiesByCountry,        // Pasar como propiedad
  setCitiesByCountry
}}>
```

---

## 🔒 TAREAS DE SEGURIDAD (ALTA PRIORIDAD)

### 1. Mover secrets a variables de entorno

**Archivo:** `/futura-market-place-v2/app/layout.tsx:30`
```typescript
// ❌ HARDCODED
<GoogleOAuthProvider clientId="15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com">

// ✅ CORRECTO
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
```

### 2. Considerar migrar de localStorage a httpOnly cookies

**Actual:** Token JWT en localStorage (vulnerable a XSS)
```typescript
localStorage.setItem('auth_token', token);
```

**Recomendado:** httpOnly cookies (más seguro)
```typescript
// En API route:
res.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 días
  path: '/',
});
```

### 3. Validar inputs en todas las API routes

**Instalar Zod:**
```bash
npm install zod
```

**Ejemplo de validación:**
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validar
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors },
      { status: 400 }
    );
  }

  // Continuar con lógica...
}
```

---

## 🧪 TAREAS DE CALIDAD (MEDIA PRIORIDAD)

### 1. Implementar tests unitarios

**Instalar dependencias:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

**Ejemplo de test para CartContext:**
```typescript
// contexts/__tests__/cart-context.test.tsx
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../cart-context';

describe('CartContext', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider
    });

    act(() => {
      result.current.addToCart({
        eventId: '123',
        ticketType: 'VIP',
        price: 50,
        quantity: 2
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(100);
  });
});
```

### 2. Habilitar validación TypeScript en build

**Archivo:** `/futura-market-place-v2/next.config.mjs`
```javascript
// ❌ ACTUAL
typescript: { ignoreBuildErrors: true }

// ✅ CAMBIAR A
typescript: { ignoreBuildErrors: false }
```

**Luego corregir todos los errores de TypeScript:**
```bash
npm run build
# Corregir errores uno por uno
```

### 3. Implementar logging estructurado

**Instalar Pino:**
```bash
npm install pino pino-pretty
```

**Ejemplo de uso:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// En lugar de console.log
logger.info({ userId: '123' }, 'User logged in');
logger.error({ err, orderId }, 'Order creation failed');
```

---

## 📊 TAREAS DE MONITORING (MEDIA PRIORIDAD)

### 1. Implementar Sentry para error tracking

**Instalar Sentry:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Configuración básica:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

### 2. Agregar health checks

**Archivo:** `/futura-market-place-api/src/app.controller.ts`
```typescript
@Get('/health')
getHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: this.mongoConnection.readyState === 1 ? 'connected' : 'disconnected',
    redis: this.redisClient.status === 'ready' ? 'connected' : 'disconnected'
  };
}
```

---

## 🎨 TAREAS DE REFACTORING (BAJA PRIORIDAD)

### 1. Refactorizar componentes grandes

**Componentes a dividir:**
- `/futura-tickets-admin/components/user-info.tsx` (13,212 líneas)
- `/futura-tickets-admin/components/user-tickets.tsx` (14,090 líneas)
- `/futura-market-place-v2/components/header.tsx` (16,211 líneas)

**Estrategia:**
```typescript
// Dividir en componentes más pequeños
components/
  user-info/
    index.tsx
    UserProfile.tsx
    UserStats.tsx
    UserActions.tsx
    UserSettings.tsx
```

### 2. Refactorizar services.tsx

**Archivo:** `/futura-tickets-admin/shared/services.tsx` (28,142 líneas)

**Dividir por dominio:**
```typescript
shared/
  services/
    auth.service.ts      // Login, register, logout
    events.service.ts    // CRUD eventos
    sales.service.ts     // Gestión de ventas
    orders.service.ts    // Gestión de órdenes
    payments.service.ts  // Pagos y withdrawals
    analytics.service.ts // Analytics y reportes
```

### 3. Optimizar imágenes

**Habilitar optimización de Next.js:**
```javascript
// next.config.mjs
images: {
  unoptimized: false,  // Cambiar a false
  domains: ['futurastorage.blob.core.windows.net']
}
```

**Usar componente Image:**
```typescript
import Image from 'next/image';

// En lugar de <img>
<Image
  src={event.image}
  alt={event.name}
  width={500}
  height={300}
  priority
/>
```

---

## 📚 TAREAS DE DOCUMENTACIÓN

### 1. Actualizar READMEs

**Crear README específico para cada proyecto con:**
- Propósito del servicio
- Cómo correr localmente
- Variables de entorno requeridas
- Endpoints principales
- Cómo hacer deploy

### 2. Documentar API con Swagger

**Instalar Swagger en NestJS:**
```bash
npm install @nestjs/swagger
```

**Configurar:**
```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Futura Tickets API')
  .setDescription('API para marketplace de tickets')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-docs', app, document);
```

### 3. Crear diagramas de arquitectura

**Documentar:**
- Flujo completo de compra
- Flujo de autenticación
- Relaciones entre servicios
- Modelo de datos

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### Fase 1: Arreglar problemas críticos (1-2 días)
1. ✅ Investigar y arreglar error 401 en marketplace
2. ✅ Verificar variables de entorno en todos los servicios
3. ✅ Arreglar bug de GlobalContext
4. ✅ Mover Google Client ID a .env

### Fase 2: Seguridad (2-3 días)
1. ✅ Implementar validación de inputs con Zod
2. ✅ Considerar migración a httpOnly cookies
3. ✅ Implementar rate limiting
4. ✅ Agregar CSRF protection

### Fase 3: Webhooks y procesamiento (3-4 días)
1. ✅ Implementar Stripe webhook endpoint
2. ✅ Procesar pagos exitosos
3. ✅ Crear tickets automáticamente
4. ✅ Enviar emails de confirmación

### Fase 4: Tests y calidad (1 semana)
1. ✅ Implementar tests unitarios para contextos
2. ✅ Implementar tests de integración para API routes
3. ✅ Habilitar validación TypeScript
4. ✅ Agregar pre-commit hooks

### Fase 5: Monitoring y observabilidad (2-3 días)
1. ✅ Implementar Sentry
2. ✅ Agregar logging estructurado
3. ✅ Crear health checks
4. ✅ Configurar alertas

### Fase 6: Refactoring (1-2 semanas)
1. ✅ Refactorizar componentes grandes
2. ✅ Dividir services.tsx
3. ✅ Optimizar imágenes
4. ✅ Code splitting

### Fase 7: Documentación (3-4 días)
1. ✅ Actualizar READMEs
2. ✅ Configurar Swagger
3. ✅ Crear diagramas
4. ✅ Escribir guías de deployment

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

1. **Verificar que puedes acceder al admin dashboard:**
   ```
   URL: http://localhost:3003/login
   Email: admin@futuratickets.com
   Password: FuturaAdmin2025!
   ```

2. **Investigar error de login en marketplace:**
   ```bash
   # Ver logs en tiempo real
   tail -f /tmp/marketplace-port3001.log

   # Probar endpoint directamente
   curl -X POST http://localhost:3002/accounts/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@futuratickets.com","password":"test123"}'
   ```

3. **Crear una cuenta de prueba en el marketplace:**
   ```
   URL: http://localhost:3001/login
   Registrarse con Google OAuth o crear cuenta con email
   ```

---

## 🆘 RESOLUCIÓN DE PROBLEMAS COMUNES

### Problema: "Cannot connect to MongoDB"
**Solución:**
```bash
# Verificar string de conexión en .env
MONGO_URL=mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod

# Probar conexión
mongosh "mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod"
```

### Problema: "EADDRINUSE: address already in use"
**Solución:**
```bash
# Matar proceso en puerto específico
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:3003 | xargs kill -9
```

### Problema: "Module not found"
**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problema: "CORS error"
**Solución:**
```typescript
// En NestJS main.ts
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3003'],
  credentials: true
});
```

---

## 📝 NOTAS FINALES

- **Tiempo estimado total:** 4-6 semanas (1-2 desarrolladores)
- **Prioridad crítica:** Arreglar login en marketplace
- **Quick wins:** Arreglar GlobalContext, mover secrets a .env
- **Long term:** Refactoring, tests, documentation

**¿Por dónde empezar?**
1. Verifica que puedes acceder al admin dashboard
2. Investiga el error 401 en marketplace
3. Corrige el bug de GlobalContext
4. Implementa tests básicos
5. Continúa con el resto según prioridad
