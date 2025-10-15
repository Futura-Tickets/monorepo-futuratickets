# TAREAS DE DESARROLLO - FUTURA TICKETS DASHBOARD

**Fecha**: 2025-10-14
**Estado Actual**: Servicios funcionando localmente (Admin API, Admin Frontend, Access API)
**Objetivo**: Hoja de ruta completa para desarrollo y mejora del dashboard

---

## ESTADO ACTUAL DEL SISTEMA

### Servicios Desplegados Localmente ✅

| Servicio | Puerto | Estado | Health |
|----------|--------|--------|--------|
| Admin API | 3000 | ✅ Running | OK |
| Admin Frontend | 3003 | ✅ Running | OK |
| Access API | 3004 | ✅ Running | OK |
| Marketplace Frontend | 3001 | ⚠️ Running | Error 500 (favicon.ico) |

### URLs Importantes
- Admin API: http://localhost:3000
- Admin API Docs: http://localhost:3000/api/docs
- Admin Frontend: http://localhost:3003
- Access API: http://localhost:3004
- Access API Docs: http://localhost:3004/api/docs
- Marketplace: http://localhost:3001

---

## FASE 1: CONFIGURACIÓN INICIAL Y CORRECCIONES CRÍTICAS (1-2 días)

### 1.1 Configuración de Variables de Entorno

**Prioridad**: 🔴 CRÍTICA

**Archivos a crear**:

#### `futura-tickets-admin/.env.local`
```bash
# Backend API
NEXT_PUBLIC_FUTURA=http://localhost:3000

# WebSocket Endpoints
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
NEXT_PUBLIC_SOCKET_ACCESS_URL=ws://localhost:3004
NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL=ws://localhost:3000

# Azure Blob Storage
NEXT_PUBLIC_BLOB_URL=https://futuratickets.blob.core.windows.net/images

# Frontend URLs
NEXT_PUBLIC_MARKET_PLACE=http://localhost:3001

# Blockchain Explorer
NEXT_PUBLIC_BASE_SEPOLIA_SCAN=https://sepolia.etherscan.io

# Google OAuth (PENDIENTE: Crear en Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### `futura-tickets-admin-api/.env`
```bash
NODE_ENV=development
PORT=3000

# MongoDB (PENDIENTE: Configurar MongoDB local o Atlas)
MONGO_URL=mongodb://localhost:27017/futura-tickets

# JWT (CRÍTICO: Generar con node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Stripe (PENDIENTE: Keys de Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Azure Storage (PENDIENTE: Configurar Azure account)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=your_account;AccountKey=your_key;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=futura-images

# Redis (instalar: brew install redis && brew services start redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Email (PENDIENTE: Configurar SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_FROM=noreply@futuratickets.com

# Socket.IO
SOCKET_IO_ORIGINS=http://localhost:3003,http://localhost:3001

# CORS
CORS_ORIGINS=http://localhost:3003,http://localhost:3001
```

**Tareas**:
- [ ] Crear archivos `.env.local` en todos los frontends
- [ ] Crear archivo `.env` en Admin API
- [ ] Generar JWT_SECRET_KEY seguro
- [ ] Instalar y configurar Redis local
- [ ] Configurar MongoDB local o Atlas
- [ ] Verificar que todos los servicios arranquen con las nuevas variables

---

### 1.2 Corregir Error de Marketplace Frontend

**Prioridad**: 🟡 ALTA

**Problema**: Error 500 por favicon.ico corrupto

**Archivo**: `futura-market-place-v2/app/favicon.ico`

**Solución**:
```bash
cd futura-market-place-v2/app
# Descargar un favicon.ico válido o crear uno nuevo
# Opción 1: Eliminar temporalmente
rm favicon.ico
# Opción 2: Generar uno nuevo con herramienta online
```

**Tareas**:
- [ ] Reemplazar favicon.ico con uno válido
- [ ] Reiniciar Marketplace Frontend
- [ ] Verificar que responde 200 OK

---

### 1.3 Habilitar CORS Correctamente en APIs

**Prioridad**: 🔴 CRÍTICA (Seguridad)

**Archivo**: `futura-tickets-admin-api/src/main.ts`

**Cambio**:
```typescript
// ANTES (línea 14)
app.enableCors();  // ❌ Acepta cualquier origen

// DESPUÉS
app.enableCors({
  origin: [
    'http://localhost:3003',  // Admin Frontend
    'http://localhost:3001',  // Marketplace Frontend
    process.env.ADMIN_FRONTEND_URL || '',
    process.env.MARKETPLACE_FRONTEND_URL || ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

**Tareas**:
- [ ] Actualizar `main.ts` en `futura-tickets-admin-api`
- [ ] Actualizar `main.ts` en `futura-access-api` (si tiene CORS abierto)
- [ ] Reiniciar ambas APIs
- [ ] Probar que frontends pueden conectarse

---

## FASE 2: INFRAESTRUCTURA Y SERVICIOS EXTERNOS (3-5 días)

### 2.1 Configurar MongoDB

**Prioridad**: 🔴 CRÍTICA

**Opciones**:

#### Opción A: MongoDB Local (Desarrollo)
```bash
# Instalar MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Iniciar servicio
brew services start mongodb-community@7.0

# Verificar conexión
mongosh
```

**Tareas**:
- [ ] Instalar MongoDB local
- [ ] Crear base de datos `futura-tickets`
- [ ] Crear colecciones necesarias
- [ ] Configurar índices (Account.email, Event.promoter, etc.)
- [ ] Crear seed data para testing

#### Opción B: MongoDB Atlas (Recomendado)
```bash
# 1. Crear cuenta en https://www.mongodb.com/cloud/atlas
# 2. Crear cluster (free tier M0)
# 3. Whitelist IP 0.0.0.0/0 (desarrollo)
# 4. Crear usuario y obtener connection string
# 5. Actualizar MONGO_URL en .env
```

**Tareas**:
- [ ] Crear cluster en MongoDB Atlas
- [ ] Configurar network access
- [ ] Crear database user
- [ ] Obtener connection string
- [ ] Actualizar `.env` con MONGO_URL
- [ ] Probar conexión desde API

---

### 2.2 Configurar Redis

**Prioridad**: 🟡 ALTA

**Instalación**:
```bash
# macOS
brew install redis
brew services start redis

# Verificar
redis-cli ping  # Debe responder "PONG"
```

**Uso en el sistema**:
- Bull queues (procesamiento asíncrono de eventos y emails)
- Caché de sesiones
- Rate limiting

**Tareas**:
- [ ] Instalar Redis
- [ ] Iniciar servicio
- [ ] Verificar conexión con `redis-cli`
- [ ] Probar que Admin API se conecta correctamente
- [ ] Ver queues en Bull Board (si está configurado)

---

### 2.3 Configurar Stripe

**Prioridad**: 🟡 ALTA

**Pasos**:
1. Crear cuenta en https://stripe.com
2. Obtener Test API Keys
3. Configurar webhook endpoint

**Keys necesarias**:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Webhook Configuration**:
- URL: `http://localhost:3000/stripe/webhook`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

**Tareas**:
- [ ] Crear cuenta Stripe
- [ ] Obtener Test API keys
- [ ] Configurar webhook con Stripe CLI
- [ ] Actualizar `.env` con keys
- [ ] Probar flujo de pago completo

---

### 2.4 Configurar Azure Blob Storage

**Prioridad**: 🟢 MEDIA

**Propósito**: Almacenar imágenes de eventos

**Pasos**:
1. Crear cuenta Azure (free tier)
2. Crear Storage Account
3. Crear container `futura-images`
4. Obtener connection string

**Tareas**:
- [ ] Crear Azure Storage Account
- [ ] Crear container con acceso público blob
- [ ] Obtener connection string
- [ ] Actualizar `.env` con AZURE_STORAGE_CONNECTION_STRING
- [ ] Probar upload de imagen desde Admin Panel

**Alternativa (Desarrollo)**:
- Usar Azurite (emulador local de Azure Storage)
```bash
npm install -g azurite
azurite --location ~/azurite
```

---

### 2.5 Configurar Google OAuth

**Prioridad**: 🟢 MEDIA

**Pasos**:
1. Ir a https://console.cloud.google.com
2. Crear proyecto "FuturaTickets"
3. Habilitar OAuth consent screen
4. Crear OAuth 2.0 Client ID (Web application)
5. Agregar authorized origins: `http://localhost:3003`
6. Agregar redirect URIs: `http://localhost:3003/auth/callback`

**Tareas**:
- [ ] Crear proyecto en Google Cloud Console
- [ ] Configurar OAuth consent screen
- [ ] Crear Client ID
- [ ] Actualizar `.env` con NEXT_PUBLIC_GOOGLE_CLIENT_ID
- [ ] Probar login con Google

---

## FASE 3: DESARROLLO DE FEATURES DEL DASHBOARD (2-3 semanas)

### 3.1 Sistema de Autenticación

**Prioridad**: 🔴 CRÍTICA

**Issues a resolver**:
- Token JWT en localStorage (vulnerable a XSS)
- No hay refresh tokens
- No hay logout del lado del servidor

**Tareas**:
- [ ] Migrar JWT de localStorage a httpOnly cookies
- [ ] Implementar refresh token mechanism
- [ ] Agregar endpoint `/auth/logout`
- [ ] Implementar session management en backend
- [ ] Agregar verificación de email (opcional)
- [ ] Implementar "Remember Me" functionality
- [ ] Agregar rate limiting en login endpoint

**Archivos a modificar**:
- `futura-tickets-admin/shared/services.tsx` (loginAccount)
- `futura-tickets-admin-api/src/Auth/auth.service.ts`
- `futura-tickets-admin-api/src/Account/account.controller.ts`

---

### 3.2 Refactorizar Service Layer (Admin Frontend)

**Prioridad**: 🟡 ALTA

**Problema**: `shared/services.tsx` tiene 28,142 líneas

**Estructura propuesta**:
```
shared/
├── services/
│   ├── index.ts               # Re-exports
│   ├── auth.service.ts        # Login, token, OAuth
│   ├── events.service.ts      # CRUD eventos
│   ├── orders.service.ts      # Órdenes
│   ├── sales.service.ts       # Tickets/ventas
│   ├── payments.service.ts    # Pagos y withdrawals
│   ├── clients.service.ts     # Clientes
│   ├── analytics.service.ts   # Métricas
│   ├── promocodes.service.ts  # Promo codes y coupons
│   ├── invitations.service.ts # Sistema de invitaciones
│   └── api-client.ts          # Axios instance + interceptors
└── interfaces/
    ├── index.ts
    ├── event.interface.ts
    ├── order.interface.ts
    ├── sale.interface.ts
    └── ...
```

**Tareas**:
- [ ] Crear estructura de carpetas `shared/services/`
- [ ] Extraer lógica de auth a `auth.service.ts`
- [ ] Extraer lógica de events a `events.service.ts`
- [ ] Crear Axios instance centralizada con interceptors
- [ ] Implementar error handling global
- [ ] Agregar request/response logging (development)
- [ ] Actualizar imports en todos los componentes
- [ ] Hacer lo mismo con `shared/interfaces.tsx` (9,690 líneas)

**Estimación**: 3-4 días

---

### 3.3 Implementar Validación de Formularios

**Prioridad**: 🟡 ALTA

**Problema**: No hay validación client-side consistente

**Solución**: React Hook Form + Zod

**Instalación**:
```bash
cd futura-tickets-admin
npm install react-hook-form zod @hookform/resolvers
```

**Ejemplo de uso**:
```typescript
// schemas/event.schema.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  capacity: z.number().positive(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string()
  }),
  dateTime: z.object({
    startDate: z.date(),
    endDate: z.date()
  })
});

// components/CreateEvent/CreateEventForm.tsx
const form = useForm({
  resolver: zodResolver(createEventSchema)
});
```

**Tareas**:
- [ ] Instalar dependencias
- [ ] Crear carpeta `schemas/` con esquemas Zod
- [ ] Migrar form de CreateEvent a React Hook Form + Zod
- [ ] Migrar form de EditEvent
- [ ] Migrar forms de Payments
- [ ] Migrar forms de Promocodes/Coupons
- [ ] Agregar mensajes de error user-friendly

**Estimación**: 2-3 días

---

### 3.4 Mejorar Dashboard de Analytics

**Prioridad**: 🟢 MEDIA

**Features actuales**:
- Sales por evento (pie chart)
- Revenue por mes (column chart)
- Top eventos (table)

**Mejoras a implementar**:
- [ ] Filtro de rango de fechas (date picker)
- [ ] Comparación mes actual vs mes anterior
- [ ] Tickets vendidos por tipo (VIP, General, etc.)
- [ ] Tasa de conversión (views → sales)
- [ ] Revenue por canal (web, mobile, resale)
- [ ] Métricas en tiempo real (WebSocket)
- [ ] Export a PDF/CSV
- [ ] Dashboard personalizable (drag & drop widgets)

**Librerías recomendadas**:
- `recharts` (alternativa a Google Charts, más customizable)
- `date-fns` (manejo de fechas)
- `react-beautiful-dnd` (drag & drop)

**Tareas**:
- [ ] Diseñar mockups de nuevo dashboard
- [ ] Implementar filtro de fechas
- [ ] Crear nuevos endpoints en API para métricas adicionales
- [ ] Migrar de Google Charts a Recharts
- [ ] Implementar export a CSV
- [ ] Agregar caching en backend para queries pesadas

**Estimación**: 5-7 días

---

### 3.5 Sistema de Notificaciones Mejorado

**Prioridad**: 🟢 MEDIA

**Estado actual**:
- Notificaciones vía WebSocket (órdenes, ventas)
- Dropdown menu básico

**Mejoras**:
- [ ] Persistencia de notificaciones en BD
- [ ] Marcar como leído/no leído
- [ ] Filtros (por tipo, por evento)
- [ ] Notificaciones push (browser notifications API)
- [ ] Sonido configurable para nuevas notificaciones
- [ ] Centro de notificaciones con historial completo
- [ ] Configuración de preferencias de notificaciones

**Tareas**:
- [ ] Crear schema `Notification` en Admin API
- [ ] Endpoint GET `/notifications` con paginación
- [ ] Endpoint PATCH `/notifications/:id/read`
- [ ] Implementar browser notifications (requestPermission)
- [ ] Agregar toggle en Settings para habilitar/deshabilitar
- [ ] Diseñar nuevo UI para notification center

**Estimación**: 3-4 días

---

### 3.6 Gestión de Campañas de Marketing

**Prioridad**: 🟢 BAJA

**Features existentes**:
- Promo codes básicos
- Coupons con descuento

**Mejoras**:
- [ ] Campaign creator (wizard multi-step)
- [ ] Segmentación de audiencia (clientes por evento, ubicación, etc.)
- [ ] Templates de emails para campañas
- [ ] A/B testing de promociones
- [ ] Analytics de campañas (open rate, conversion rate)
- [ ] Integración con SendGrid/Mailchimp
- [ ] Landing pages para campañas
- [ ] Tracking de referrals

**Estimación**: 2 semanas (feature completa)

---

## FASE 4: CALIDAD DE CÓDIGO Y TESTING (1-2 semanas)

### 4.1 Implementar Testing

**Prioridad**: 🟡 ALTA

**Estado actual**: 0% coverage

**Setup**:
```bash
# Admin Frontend
cd futura-tickets-admin
npm install -D @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Admin API
cd futura-tickets-admin-api
npm install -D @nestjs/testing supertest
```

**Tareas Frontend**:
- [ ] Configurar Jest + Testing Library
- [ ] Tests unitarios para utils y helpers
- [ ] Tests de componentes críticos (Login, CreateEvent)
- [ ] Tests de services (mock axios)
- [ ] Tests de context providers
- [ ] Tests de custom hooks

**Tareas Backend**:
- [ ] Tests unitarios para services
- [ ] Tests de integración para controllers
- [ ] Tests E2E para flujos críticos (crear evento, comprar ticket)
- [ ] Mock de Stripe, Azure Storage
- [ ] Tests de WebSocket gateway

**Goal**: 70% coverage en 2 semanas

**Estimación**: 7-10 días

---

### 4.2 Implementar Error Boundaries

**Prioridad**: 🟡 ALTA

**Propósito**: Capturar errores React y mostrar UI de fallback

**Implementación**:
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to Sentry
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**Tareas**:
- [ ] Crear componente ErrorBoundary
- [ ] Envolver rutas principales con ErrorBoundary
- [ ] Diseñar UI de error fallback
- [ ] Agregar botón "Report this error"
- [ ] Integrar con Sentry (opcional)

**Estimación**: 1 día

---

### 4.3 Setup Linting y Formatting

**Prioridad**: 🟢 MEDIA

**Herramientas**:
- ESLint (ya configurado parcialmente)
- Prettier
- Husky (pre-commit hooks)

**Tareas**:
- [ ] Configurar Prettier en todos los proyectos
- [ ] Instalar Husky + lint-staged
- [ ] Pre-commit hook: lint + format
- [ ] Pre-push hook: tests
- [ ] Agregar scripts `npm run lint:fix`
- [ ] CI: Verificar linting en GitHub Actions

**Estimación**: 1 día

---

## FASE 5: OPTIMIZACIÓN Y PERFORMANCE (1 semana)

### 5.1 Optimizar Imágenes

**Problema**: Uso de `<img>` en lugar de Next.js Image

**Tareas**:
- [ ] Migrar todos los `<img>` a `<Image>` de Next.js
- [ ] Configurar loader para Azure Blob Storage
- [ ] Implementar lazy loading
- [ ] Usar formato WebP cuando sea posible
- [ ] Agregar placeholders (blur)

---

### 5.2 Code Splitting

**Tareas**:
- [ ] Lazy load de rutas con `React.lazy()`
- [ ] Lazy load de componentes grandes (Charts, Tables)
- [ ] Lazy load de modales
- [ ] Analizar bundle size con `@next/bundle-analyzer`
- [ ] Optimizar imports (evitar barrel exports grandes)

---

### 5.3 Caching en Backend

**Tareas**:
- [ ] Implementar Redis cache para queries frecuentes
- [ ] Cache de eventos activos (TTL 5min)
- [ ] Cache de analytics (TTL 1h)
- [ ] Invalidación de cache al actualizar datos
- [ ] Agregar header Cache-Control en respuestas

---

## FASE 6: SEGURIDAD Y PRODUCCIÓN (1 semana)

### 6.1 Security Hardening

**Tareas API**:
- [ ] Habilitar Helmet.js para headers de seguridad
- [ ] Configurar rate limiting por IP y por usuario
- [ ] Implementar CSRF protection
- [ ] Validar todos los inputs con class-validator
- [ ] Sanitizar datos para prevenir NoSQL injection
- [ ] Agregar Content Security Policy (CSP)
- [ ] Implementar API key rotation

**Tareas Frontend**:
- [ ] Migrar auth tokens a httpOnly cookies
- [ ] Implementar CSRF tokens
- [ ] Sanitizar user-generated content (XSS prevention)
- [ ] Validar HTTPS en producción
- [ ] Configurar Subresource Integrity (SRI)

**Estimación**: 3-4 días

---

### 6.2 Monitoring y Observability

**Herramientas recomendadas**:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic** / **Datadog**: APM
- **Grafana**: Métricas custom

**Tareas**:
- [ ] Integrar Sentry en frontend y backend
- [ ] Configurar source maps para stack traces
- [ ] Setup logging estructurado con Winston/Pino
- [ ] Agregar health checks `/health` y `/ready`
- [ ] Métricas de performance (Core Web Vitals)
- [ ] Alertas para errores críticos
- [ ] Dashboard de monitoreo en Grafana

**Estimación**: 3-4 días

---

### 6.3 CI/CD Pipeline

**Herramienta**: GitHub Actions

**Pipeline propuesto**:
```yaml
# .github/workflows/admin-api.yml
name: Admin API CI/CD
on:
  push:
    branches: [main, staging]
    paths:
      - 'futura-tickets-admin-api/**'

jobs:
  test:
    - npm install
    - npm run lint
    - npm run test
    - npm run build

  deploy-staging:
    if: branch == 'staging'
    - Build Docker image
    - Push to Azure Container Registry
    - Deploy to Azure App Service (staging)

  deploy-production:
    if: branch == 'main'
    - Build Docker image
    - Push to ACR
    - Deploy to Azure App Service (production)
```

**Tareas**:
- [ ] Crear workflows para cada servicio
- [ ] Configurar secrets en GitHub
- [ ] Setup Azure Container Registry
- [ ] Configurar Azure App Service / Azure Container Instances
- [ ] Implementar blue-green deployment
- [ ] Rollback automático en caso de fallo

**Estimación**: 3-5 días

---

## FASE 7: DOCUMENTACIÓN (3-4 días)

### 7.1 Documentación Técnica

**Tareas**:
- [ ] Actualizar README.md de cada proyecto
- [ ] Documentar arquitectura del sistema
- [ ] Crear diagramas de flujo (Mermaid o Lucidchart)
- [ ] Documentar decisiones de arquitectura (ADRs)
- [ ] Guía de setup para nuevos developers
- [ ] Guía de deployment

---

### 7.2 Documentación de API

**Tareas**:
- [ ] Configurar Swagger en Admin API
- [ ] Agregar decoradores @ApiTags, @ApiOperation
- [ ] Documentar todos los DTOs
- [ ] Agregar ejemplos de requests/responses
- [ ] Generar Postman collection automáticamente
- [ ] Publicar docs en Swagger UI

---

### 7.3 Documentación de Usuario

**Tareas**:
- [ ] Manual de usuario del Admin Panel
- [ ] Tutoriales en video (opcional)
- [ ] FAQ section
- [ ] Troubleshooting guide
- [ ] Changelog

---

## BACKLOG DE FEATURES FUTURAS

### Blockchain Integration Completa
- [ ] Auto-deploy de smart contracts al crear evento
- [ ] Mint NFTs automáticamente al comprar ticket
- [ ] Verificación on-chain de ownership
- [ ] Marketplace de NFTs integrado
- [ ] Royalties automáticos en reventa

### Multi-tenancy
- [ ] Soporte para múltiples promotores en un solo admin panel
- [ ] Permisos granulares por rol
- [ ] White-label solution para promotores

### Mobile App
- [ ] React Native app para admin panel
- [ ] Push notifications nativas
- [ ] Offline support

### Advanced Analytics
- [ ] Machine learning para predicción de ventas
- [ ] Recomendaciones de precios dinámicos
- [ ] Segmentación automática de audiencia
- [ ] Heatmaps de comportamiento de usuario

### Integraciones
- [ ] Integración con Google Analytics
- [ ] Integración con Facebook Pixel
- [ ] Integración con CRM (Salesforce, HubSpot)
- [ ] Integración con herramientas de email marketing

---

## CÓMO USAR ESTA LISTA

### Para Empezar HOY:

1. **Día 1-2**: Configuración inicial
   - Crear todos los archivos `.env`
   - Instalar y configurar MongoDB
   - Instalar y configurar Redis
   - Corregir error de Marketplace favicon

2. **Día 3-5**: Servicios externos
   - Configurar Stripe (test mode)
   - Configurar Azure Storage (o Azurite)
   - Configurar Google OAuth

3. **Día 6-10**: Primer feature development
   - Refactorizar services.tsx
   - Implementar validación de formularios
   - Mejorar sistema de auth

### Metodología Recomendada:

- **Sprints de 2 semanas**
- **Daily standups** (15 min)
- **Code reviews obligatorios**
- **Testing antes de merge a main**
- **Deploy a staging antes de producción**

### Priorización:

🔴 **Crítico**: Bloquea desarrollo o es riesgo de seguridad
🟡 **Alto**: Importante pero no bloquea
🟢 **Medio/Bajo**: Nice to have, puede esperar

---

## RECURSOS Y ENLACES ÚTILES

### Documentación
- Next.js 15: https://nextjs.org/docs
- NestJS: https://docs.nestjs.com
- Stripe: https://stripe.com/docs
- MongoDB: https://docs.mongodb.com
- Socket.IO: https://socket.io/docs

### Herramientas
- MongoDB Compass: https://www.mongodb.com/products/compass
- Postman: https://www.postman.com
- Redis Insight: https://redis.com/redis-enterprise/redis-insight/
- Stripe CLI: https://stripe.com/docs/stripe-cli

### Comunidades
- NestJS Discord: https://discord.gg/nestjs
- Next.js Discussions: https://github.com/vercel/next.js/discussions

---

## NOTAS FINALES

- Este documento es un **plan vivo** que debe actualizarse regularmente
- Priorizar según feedback de usuarios y métricas de uso
- No intentar hacer todo a la vez - ir por fases
- Cada feature debe incluir tests antes de considerarse "done"
- Documentar decisiones importantes en ADRs
- Celebrar los wins del equipo 🎉

**Última actualización**: 2025-10-14
**Próxima revisión**: 2025-10-21
