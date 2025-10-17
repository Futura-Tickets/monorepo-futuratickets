# Troubleshooting Guide - FuturaTickets

> Solución de problemas comunes en el monorepo

**Última actualización**: 2025-10-17

---

## 📑 Índice Rápido

1. [Setup y Configuración](#setup-y-configuración)
2. [Errores de Servicios](#errores-de-servicios)
3. [Base de Datos](#base-de-datos)
4. [Pagos y Stripe](#pagos-y-stripe)
5. [Build y Deployment](#build-y-deployment)
6. [Performance](#performance)
7. [Security](#security)

---

## Setup y Configuración

### ❌ "Cannot find module" al arrancar servicio

**Síntomas**:
```
Error: Cannot find module 'express'
```

**Causas**:
- Dependencias no instaladas
- `node_modules` corrupto
- Version mismatch

**Solución**:
```bash
# Opción 1: Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Opción 2: Limpiar cache
npm cache clean --force
npm install --legacy-peer-deps

# Opción 3: Usar setup automatizado
./scripts/utilities/setup-dev-environment.sh
```

---

### ❌ "EADDRINUSE: address already in use"

**Síntomas**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causas**:
- Puerto ocupado por otro proceso
- Servicio anterior no terminó correctamente
- Procesos zombies

**Solución**:
```bash
# Ver qué proceso usa el puerto
lsof -ti:3000

# Matar proceso específico
kill $(lsof -ti:3000)

# O usar script
./scripts/utilities/check-ports.sh

# Limpiar todos los procesos zombies
./scripts/utilities/cleanup-processes.sh
```

---

### ❌ Variables de entorno no cargadas

**Síntomas**:
```
Error: JWT_SECRET is not defined
```

**Causas**:
- Archivo `.env` no existe
- Variables mal configuradas
- `.env` no en el directorio correcto

**Solución**:
```bash
# Verificar que .env existe
ls -la futura-tickets-admin-api/.env

# Copiar template
cp futura-tickets-admin-api/.env.example futura-tickets-admin-api/.env

# Verificar configuración
./scripts/utilities/check-env-vars.sh

# Editar valores
nano futura-tickets-admin-api/.env
```

**Variables críticas**:
```bash
# Mínimo requerido
MONGO_URL=mongodb+srv://...
JWT_SECRET=tu-secret-de-32-caracteres
STRIPE_SECRET_KEY=sk_test_...
PORT=3002
```

---

## Errores de Servicios

### ❌ Servicios no responden después de start-all.sh

**Síntomas**:
- `start-all.sh` ejecuta pero servicios no responden
- Curl devuelve "Connection refused"

**Diagnóstico**:
```bash
# 1. Verificar qué servicios están UP
./scripts/utilities/check-ports.sh

# 2. Health checks
./scripts/utilities/smoke-tests.sh

# 3. Monitoreo continuo
./scripts/utilities/continuous-health-check.sh 5
```

**Soluciones comunes**:
```bash
# Si backend no arranca
cd futura-tickets-admin-api
npm run start:dev  # Ver errores en consola

# Si frontend no arranca
cd futura-market-place-v2
npm run dev  # Ver errores de build
```

---

### ❌ "UnauthorizedException: Invalid token"

**Síntomas**:
```
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "UnauthorizedException"
}
```

**Causas**:
- Token JWT expirado
- JWT_SECRET diferente entre frontend y backend
- Token no enviado en header

**Solución**:
```bash
# Verificar JWT_SECRET coincide en todos los servicios
grep JWT_SECRET futura-tickets-admin-api/.env
grep JWT_SECRET futura-market-place-api/.env
grep JWT_SECRET futura-access-api/.env

# Deben ser IDÉNTICOS

# En frontend, verificar header
Authorization: Bearer {token}
```

**Testing**:
```bash
# Obtener token
TOKEN=$(curl -X POST http://localhost:3002/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  | jq -r '.token')

# Usar token
curl http://localhost:3002/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

### ❌ CORS errors en frontend

**Síntomas**:
```
Access to fetch at 'http://localhost:3002/api/events' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Causas**:
- CORS no configurado en backend
- Origin no permitido
- Headers incorrectos

**Solución en Backend**:
```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3007'
  ],
  credentials: true
});
```

**Workaround desarrollo**:
```typescript
// SOLO DESARROLLO
app.enableCors(); // Permite todos los origins
```

---

## Base de Datos

### ❌ "MongoServerError: bad auth"

**Síntomas**:
```
MongoServerError: bad auth : authentication failed
```

**Causas**:
- Credenciales incorrectas en MONGO_URL
- Usuario sin permisos
- Database incorrecta

**Solución**:
```bash
# Verificar MONGO_URL
echo $MONGO_URL

# Formato correcto
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Testear conexión
mongosh "mongodb+srv://username:password@cluster.mongodb.net/dbname"

# Si falla, crear nuevo usuario en MongoDB Atlas:
# 1. Database Access → Add New Database User
# 2. Built-in Role: Atlas Admin
# 3. Copiar nueva connection string
```

---

### ❌ Conexión lenta a MongoDB

**Síntomas**:
- Requests tardan >5 segundos
- Timeout errors
- "Connection pool is full"

**Causas**:
- MongoDB Atlas en otra región
- Sin índices en queries
- Connection pool pequeño

**Solución**:
```typescript
// Aumentar connection pool
MongooseModule.forRoot(mongoUrl, {
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000
});

// Crear índices
SalesSchema.index({ event: 1, status: 1 });
OrdersSchema.index({ paymentId: 1 });
```

**Verificar índices**:
```bash
mongosh "mongodb+srv://..."
use futuratickets
db.sales.getIndexes()
```

---

### ❌ Datos duplicados en DB

**Síntomas**:
- Múltiples órdenes con mismo paymentId
- Tickets duplicados
- E11000 duplicate key error

**Causas**:
- Webhooks de Stripe enviados múltiples veces
- Falta unique index
- Race conditions

**Solución**:
```typescript
// Agregar unique index
OrdersSchema.index({ paymentId: 1 }, { unique: true });

// Verificar en webhook
const existingOrder = await this.ordersService.findByPaymentId(paymentId);
if (existingOrder) {
  return; // Ya procesado
}

// Procesar orden...
```

---

## Pagos y Stripe

### ❌ "No such payment_intent"

**Síntomas**:
```
StripeInvalidRequestError: No such payment_intent: 'pi_xxxxx'
```

**Causas**:
- Payment Intent creado en cuenta diferente de Stripe
- Test mode vs Live mode mismatch
- Payment Intent expirado

**Solución**:
```bash
# Verificar keys coinciden
grep STRIPE futura-tickets-admin-api/.env
grep STRIPE futura-market-place-api/.env

# Test keys empiezan con sk_test_ / pk_test_
# Live keys empiezan con sk_live_ / pk_live_

# En Stripe Dashboard:
# Developers → API keys → Reveal test key
```

---

### ❌ Webhook signature verification failed

**Síntomas**:
```
Webhook Error: No signatures found matching the expected signature
```

**Causas**:
- STRIPE_ENDPOINT_SECRET incorrecto
- Body parseado antes de verificar
- Headers no forwarded

**Solución**:
```typescript
// NO parsear body antes de verificar
@Post('/stripe/webhook')
async handleWebhook(@Req() req, @Res() res) {
  const sig = req.headers['stripe-signature'];
  
  // Usar raw body
  const event = this.stripeService.constructEvent(
    req.rawBody,  // NOT req.body
    sig
  );
  
  // Procesar evento...
}

// En NestJS, configurar raw body:
// main.ts
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
```

---

### ❌ Pago succeeded pero orden no se crea

**Síntomas**:
- Usuario pagó
- Stripe muestra "succeeded"
- Base de datos sin orden

**Causas**:
- Webhook no llegó
- Error en procesamiento de webhook
- Webhook endpoint no público

**Diagnóstico**:
```bash
# Ver webhooks en Stripe Dashboard
# Developers → Webhooks → Select endpoint → View events

# Buscar errores 500
```

**Solución**:
```bash
# 1. Exponer webhook con ngrok (desarrollo)
ngrok http 3004
# URL: https://xxxx.ngrok.io

# 2. Configurar en Stripe
# Developers → Webhooks → Add endpoint
# URL: https://xxxx.ngrok.io/stripe/webhook
# Events: payment_intent.succeeded

# 3. Testing local
stripe listen --forward-to localhost:3004/stripe/webhook
```

---

## Build y Deployment

### ❌ "Build failed" en Next.js

**Síntomas**:
```
Error: Failed to compile
./app/page.tsx
Module not found: Can't resolve 'my-module'
```

**Causas**:
- Dependencia faltante
- Import incorrecto
- TypeScript errors

**Solución**:
```bash
# Verificar dependencias
npm install --legacy-peer-deps

# Limpiar cache Next.js
rm -rf .next
npm run build

# Ver errores TypeScript
npx tsc --noEmit

# Habilitar checks en next.config.js
typescript: {
  ignoreBuildErrors: false  // Era true
}
```

---

### ❌ "FATAL ERROR: Reached heap limit" al compilar

**Síntomas**:
```
FATAL ERROR: Reached heap limit Allocation failed
- JavaScript heap out of memory
```

**Causas**:
- Bundle muy grande
- Leak de memoria en build
- Node heap default (512MB)

**Solución**:
```bash
# Aumentar heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Permanente en package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}

# Analizar bundle
npm run build && npx @next/bundle-analyzer
./scripts/utilities/analyze-bundle-size.sh
```

---

### ❌ Docker build falla

**Síntomas**:
```
ERROR [stage-1 5/5] RUN npm run build
npm ERR! missing script: build
```

**Causas**:
- package.json sin script build
- Multi-stage build con archivos faltantes
- Context incorrecto

**Solución**:
```dockerfile
# Verificar WORKDIR
WORKDIR /app

# Copiar package files primero
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar código
COPY . .
RUN npm run build

# Verificar que dist/ existe
RUN ls -la dist/
```

---

## Performance

### ❌ Requests lentas (>2s)

**Síntomas**:
- APIs responden en 2-5 segundos
- Frontend lento al cargar

**Diagnóstico**:
```bash
# Test performance
./scripts/utilities/performance-test.sh

# Ver bottlenecks
time curl http://localhost:3002/api/events
```

**Causas comunes**:
1. Sin índices en MongoDB
2. N+1 queries
3. Sin paginación
4. Populates anidados

**Soluciones**:
```typescript
// Agregar índices
EventSchema.index({ status: 1, 'dateTime.startDate': 1 });

// Paginación
@Get('/events')
async getEvents(
  @Query('page') page = 1,
  @Query('limit') limit = 20
) {
  return this.eventsService.findAll({
    skip: (page - 1) * limit,
    limit
  });
}

// Usar lean() para queries de solo lectura
const events = await this.eventModel.find().lean().exec();

// Evitar populates profundos
// ❌ BAD
.populate('event').populate('event.promoter').populate('event.promoter.clients')

// ✅ GOOD
.populate('event', 'name image dateTime')
```

---

### ❌ High memory usage

**Síntomas**:
```
Process: RSS 2.5GB
Heap: 1.8GB / 2GB
```

**Diagnóstico**:
```bash
# Ver memory
node --expose-gc server.js

# En producción
pm2 monit
```

**Causas**:
- Memory leaks
- Large arrays en memoria
- Cacheo excesivo

**Solución**:
```typescript
// Stream large responses
@Get('/export')
async exportData(@Res() res: Response) {
  const stream = this.salesService.getStream();
  stream.pipe(res);
}

// Paginar queries grandes
const cursor = this.salesModel.find().cursor();
for await (const sale of cursor) {
  // Procesar uno a uno
}

// Usar Redis para cache
@Injectable()
export class CacheService {
  constructor(@InjectRedis() private redis: Redis) {}
  
  async get(key: string) {
    return this.redis.get(key);
  }
}
```

---

## Security

### ❌ ".env file committed to git"

**Síntomas**:
```
git status
.env
```

**⚠️ PELIGRO**: Secrets expuestos públicamente

**Solución inmediata**:
```bash
# 1. Remover de staging
git reset HEAD .env

# 2. Agregar a .gitignore
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: add .env to gitignore"

# 3. Si ya fue pushed:
# - ROTAR TODOS LOS SECRETS inmediatamente
# - Borrar history con git filter-branch (avanzado)
# - O hacer repo private

# 4. Prevenir en futuro
# Pre-commit hook ya lo bloquea
```

---

### ❌ Secretos en logs

**Síntomas**:
```
[LOG] JWT_SECRET: my-secret-key-123
[LOG] STRIPE_KEY: sk_live_xxxxx
```

**Causas**:
- `console.log()` con objetos completos
- Error messages con secrets

**Solución**:
```typescript
// ❌ NUNCA hacer
console.log('Config:', process.env);

// ✅ Logging seguro
logger.log('Config loaded', {
  hasMongoUrl: !!process.env.MONGO_URL,
  hasJwtSecret: !!process.env.JWT_SECRET
});

// Sanitizar errors
catch (error) {
  logger.error('Error occurred', {
    message: error.message,
    // NO incluir error.config que puede tener secrets
  });
}
```

---

## Comandos Útiles

### Verificación Rápida

```bash
# Check everything
./scripts/utilities/check-env-vars.sh
./scripts/utilities/check-ports.sh
./scripts/utilities/smoke-tests.sh

# Health check continuo
./scripts/utilities/continuous-health-check.sh 10
```

### Cleanup

```bash
# Procesos
./scripts/utilities/cleanup-processes.sh

# Node modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Build outputs
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +
```

### Reset Completo

```bash
# ⚠️ BORRA TODO
./scripts/utilities/reset-database.sh
rm -rf */node_modules */dist */.next
./scripts/utilities/setup-dev-environment.sh
./start-all.sh
```

---

## Logs y Debugging

### Habilitar Debug Logs

```bash
# NestJS
DEBUG=* npm run start:dev

# Next.js
DEBUG=* npm run dev

# Específico
DEBUG=mongoose:* npm run start:dev
```

### Debugging con VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Admin API",
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "args": ["${workspaceFolder}/futura-tickets-admin-api/src/main.ts"],
      "cwd": "${workspaceFolder}/futura-tickets-admin-api",
      "protocol": "inspector",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

---

## Contacto y Soporte

**Documentación adicional**:
- [README.md](./README.md)
- [DEV_GUIDE.md](./DEV_GUIDE.md)
- [SCRIPTS_REFERENCE.md](./SCRIPTS_REFERENCE.md)

**Community**:
- GitHub Discussions
- Team Slack: #futura-tickets-help

**Emergencias**:
- DevOps on-call: [Slack channel]
- Escalate: tech-lead@futuratickets.com

---

**Última actualización**: 2025-10-17  
**Mantenido por**: DevOps Team
