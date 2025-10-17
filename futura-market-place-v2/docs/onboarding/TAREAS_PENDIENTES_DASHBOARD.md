# TAREAS PENDIENTES - DASHBOARD FUTURA TICKETS

> Última actualización: 2025-10-14
> Estado: Fase 1 completada ✅ | Iniciando Fase 2

---

## 📊 ESTADO ACTUAL

### ✅ Completado (Fase 1)
- [x] Generación de JWT secret key seguro
- [x] Configuración `.env` Admin API (puerto 3004)
- [x] Configuración `.env.local` Admin Frontend (puerto 3006)
- [x] Servicio Redis corriendo
- [x] CORS configurado correctamente
- [x] Favicon Marketplace corregido
- [x] Todos los servicios reiniciados con nueva configuración

### 🏃 Servicios Activos
- Admin API: `http://localhost:3004` ✅
- Admin Frontend: `http://localhost:3006` ✅
- Marketplace Frontend: `http://localhost:3001` ✅
- Redis: `localhost:6379` ✅
- Swagger Docs: `http://localhost:3004/api/docs` ✅

---

## 🔴 FASE 2: INFRAESTRUCTURA EXTERNA (Prioridad Alta)

### 2.1 Configuración de Stripe 🔴
**Archivos a modificar:**
- `futura-tickets-admin-api/.env`

**Tareas:**
- [ ] Obtener Stripe Test Keys desde https://dashboard.stripe.com/test/apikeys
  - Stripe Publishable Key (pk_test_...)
  - Stripe Secret Key (sk_test_...)
  - Stripe Webhook Secret (whsec_...) - para producción

- [ ] Actualizar `.env` con claves reales:
```bash
STRIPE_PUBLIC_KEY=pk_test_REAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_REAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_REAL_SECRET_HERE
```

- [ ] Reiniciar Admin API después de configurar
- [ ] Probar endpoint `/stripe/config` devuelve la publishable key
- [ ] Probar creación de PaymentIntent desde Admin Frontend

**Verificación:**
```bash
# Debe retornar la clave pk_test_...
curl http://localhost:3004/stripe/config
```

---

### 2.2 Azure Blob Storage (o Azurite Local) 🟡
**Opciones:**

#### Opción A: Usar Azure Blob Storage Real
- [ ] Crear cuenta Azure Storage
- [ ] Crear container "images"
- [ ] Obtener connection string
- [ ] Actualizar `.env`:
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=images
```

#### Opción B: Usar Azurite (Emulador Local) - RECOMENDADO
- [ ] Instalar Azurite:
```bash
npm install -g azurite
```

- [ ] Iniciar Azurite:
```bash
azurite --silent --location /tmp/azurite --debug /tmp/azurite-debug.log &
```

- [ ] Configurar `.env` con connection string local:
```bash
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;
AZURE_STORAGE_CONTAINER_NAME=images
```

- [ ] Crear container "images":
```bash
# Instalar Azure CLI si no lo tienes
brew install azure-cli

# Crear container
az storage container create --name images --connection-string "..."
```

**Verificación:**
- [ ] Subir imagen de prueba desde Admin Frontend
- [ ] Verificar que la imagen aparece en el evento

---

### 2.3 MongoDB Community (Local) 🟡
**Estado:** Tap mongodb/brew instalándose en background

- [ ] Verificar si el tap terminó de instalarse:
```bash
brew tap | grep mongodb
```

- [ ] Instalar MongoDB Community:
```bash
brew install mongodb-community@7.0
```

- [ ] Iniciar servicio MongoDB:
```bash
brew services start mongodb-community@7.0
```

- [ ] Verificar conexión:
```bash
mongosh "mongodb://localhost:27017"
```

**Opción:** Si prefieres usar MongoDB Atlas (producción), mantén la configuración actual.

---

### 2.4 Email Service (SMTP) 🟢
**Archivos:** `futura-tickets-admin-api/.env`

#### Opción A: Gmail SMTP (Desarrollo)
- [ ] Crear cuenta Gmail de prueba o usar existente
- [ ] Habilitar "App Password" en configuración de seguridad
- [ ] Configurar `.env`:
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password-aqui
MAIL_FROM=noreply@futuratickets.com
```

#### Opción B: Mailhog (Email Testing Local) - RECOMENDADO
- [ ] Instalar Mailhog:
```bash
brew install mailhog
```

- [ ] Iniciar Mailhog:
```bash
mailhog &
```

- [ ] Configurar `.env`:
```bash
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@futuratickets.com
```

- [ ] Acceder a interfaz web: http://localhost:8025

**Verificación:**
- [ ] Crear orden de prueba con email
- [ ] Verificar que el email llega (Mailhog o Gmail)

---

### 2.5 Google OAuth Configuration 🟡
**Estado:** Client ID ya está configurado pero hardcoded

- [ ] Mover Client ID a variable de entorno en Admin Frontend
  - Archivo: `futura-tickets-admin/.env.local`
  - Agregar: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com`

- [ ] Actualizar `app/layout.tsx` para usar variable:
```typescript
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
```

- [ ] Verificar que el login con Google sigue funcionando

---

## 🟡 FASE 3: DESARROLLO DE FEATURES (Prioridad Media)

### 3.1 Refactorización de Autenticación 🟡

#### Mover Token de localStorage a httpOnly Cookies
**Problema actual:** Token JWT en localStorage es vulnerable a XSS

**Archivos a modificar:**
- `futura-tickets-admin/contexts/auth-context.tsx`
- `futura-tickets-admin-api` (crear middleware de cookies)

**Tareas:**
- [ ] Instalar cookie-parser en Admin API:
```bash
cd futura-tickets-admin-api
npm install cookie-parser @types/cookie-parser
```

- [ ] Modificar login para setear cookie httpOnly:
```typescript
// En auth controller del backend
res.cookie('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
});
```

- [ ] Modificar frontend para NO usar localStorage
- [ ] Crear middleware que lee cookie automáticamente
- [ ] Actualizar AuthContext para usar cookies

---

### 3.2 Refactorización de Services 🟡
**Problema:** `shared/services.tsx` tiene 28,142 líneas

**Tareas:**
- [ ] Crear carpeta `futura-tickets-admin/services/`
- [ ] Dividir en módulos:
  - `services/auth.service.ts` (login, register, tokens)
  - `services/events.service.ts` (CRUD eventos)
  - `services/sales.service.ts` (ventas, tickets)
  - `services/orders.service.ts` (órdenes)
  - `services/payments.service.ts` (pagos, withdrawals)
  - `services/analytics.service.ts` (estadísticas)
  - `services/clients.service.ts` (clientes)

- [ ] Crear `services/api.config.ts` con configuración base:
```typescript
export const API_CONFIG = {
  FUTURA: process.env.NEXT_PUBLIC_FUTURA!,
  FUTURA_API: process.env.NEXT_PUBLIC_FUTURA_API!,
  TIMEOUT: 30000
};
```

- [ ] Actualizar imports en componentes

---

### 3.3 Validación de Formularios con Zod 🟡
**Archivos afectados:** Todos los formularios en Admin Frontend

**Tareas:**
- [ ] Instalar dependencias:
```bash
cd futura-tickets-admin
npm install zod react-hook-form @hookform/resolvers
```

- [ ] Crear schemas de validación en `schemas/`:
  - `schemas/event.schema.ts`
  - `schemas/account.schema.ts`
  - `schemas/payment.schema.ts`

- [ ] Ejemplo para CreateEvent:
```typescript
// schemas/event.schema.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().min(10),
  capacity: z.number().min(1).max(100000),
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
```

- [ ] Integrar en formularios con react-hook-form

---

### 3.4 Sistema de Analytics Mejorado 🟢

**Tareas:**
- [ ] Crear dashboard de métricas en tiempo real
- [ ] Implementar gráficos con Recharts:
  - Ventas por día/semana/mes
  - Top eventos por revenue
  - Conversión de visitantes a compradores
  - Tasa de cancelación/reventa

- [ ] Agregar filtros por fecha
- [ ] Exportar reportes a CSV/PDF

---

### 3.5 Sistema de Notificaciones 🟢

**Tareas:**
- [ ] Implementar notificaciones en tiempo real con Socket.IO
- [ ] Crear NotificationsController en Admin API
- [ ] Tipos de notificaciones:
  - Nueva orden de compra
  - Solicitud de retiro de fondos
  - Evento próximo a iniciar (24h antes)
  - Reporte de problema con ticket

- [ ] Agregar badge de notificaciones no leídas
- [ ] Dropdown de notificaciones en header

---

## 🟢 FASE 4: TESTING (Prioridad Media-Baja)

### 4.1 Tests Unitarios 🟢

**Setup:**
```bash
cd futura-tickets-admin-api
npm install --save-dev @nestjs/testing jest ts-jest
```

**Tareas:**
- [ ] Configurar Jest para NestJS
- [ ] Tests para EventService
- [ ] Tests para AuthService
- [ ] Tests para OrdersService
- [ ] Target: 60% coverage mínimo

**Ejemplo:**
```typescript
// event.service.spec.ts
describe('EventService', () => {
  it('should create an event', async () => {
    const event = await service.createEvent(mockEventData);
    expect(event).toBeDefined();
    expect(event.name).toBe(mockEventData.name);
  });
});
```

---

### 4.2 Tests E2E 🟢

**Tareas:**
- [ ] Tests para flujo de creación de evento
- [ ] Tests para flujo de lanzamiento de evento
- [ ] Tests para flujo de venta de tickets
- [ ] Tests de autenticación

---

### 4.3 Tests Frontend (React Testing Library) 🟢

**Setup:**
```bash
cd futura-tickets-admin
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

**Tareas:**
- [ ] Tests para componentes críticos
- [ ] Tests para Context providers
- [ ] Tests para custom hooks

---

## 🟢 FASE 5: OPTIMIZACIÓN Y PERFORMANCE

### 5.1 Optimización de Imágenes 🟢
- [ ] Habilitar optimización de Next.js Image
- [ ] Configurar CDN para Azure Blob Storage
- [ ] Implementar lazy loading de imágenes

### 5.2 Code Splitting 🟢
- [ ] Lazy load de componentes grandes:
  - EventModal
  - Analytics dashboard
  - Payment forms

```typescript
const EventModal = dynamic(() => import('@/components/EventModal'), {
  loading: () => <Spinner />
});
```

### 5.3 Caching con Redis 🟢
- [ ] Cache de eventos activos (TTL: 5 min)
- [ ] Cache de analytics (TTL: 15 min)
- [ ] Cache de configuración (TTL: 1 hora)

---

## 🟢 FASE 6: SEGURIDAD Y HARDENING

### 6.1 Seguridad Backend 🟢
- [ ] Implementar rate limiting real (no solo configurado)
- [ ] Agregar Helmet.js para headers de seguridad
- [ ] Validar todos los DTOs con class-validator
- [ ] Implementar CSRF protection
- [ ] Sanitizar inputs para prevenir NoSQL injection

### 6.2 Seguridad Frontend 🟢
- [ ] Implementar Content Security Policy
- [ ] Validar variables de entorno al inicio
- [ ] Implementar error boundaries
- [ ] Sanitizar inputs de usuario

### 6.3 Logging y Monitoring 🟢
- [ ] Instalar Winston para logging estructurado
- [ ] Integrar Sentry para error tracking
- [ ] Configurar health checks avanzados
- [ ] Métricas de performance (APM)

---

## 🟢 FASE 7: DOCUMENTACIÓN Y DEPLOYMENT

### 7.1 Documentación API 🟢
- [ ] Configurar Swagger/OpenAPI en Admin API
- [ ] Documentar todos los endpoints
- [ ] Crear Postman collection
- [ ] Escribir README con instrucciones de setup

### 7.2 Documentación Frontend 🟢
- [ ] Documentar arquitectura de componentes
- [ ] Crear guía de contribución
- [ ] Documentar flujos de datos principales

### 7.3 CI/CD 🟢
- [ ] Crear GitHub Actions workflow
- [ ] Tests automáticos en PRs
- [ ] Build automático
- [ ] Deploy automático a staging

### 7.4 Docker Compose 🟢
- [ ] Crear `docker-compose.yml` para desarrollo:
  - Admin API
  - Admin Frontend
  - Marketplace Frontend
  - MongoDB
  - Redis
  - Mailhog
  - Azurite

---

## 🔧 BUGS CONOCIDOS A CORREGIR

### Críticos 🔴
- [ ] **GlobalContext mal implementado** en Marketplace Frontend
  - Archivo: `futura-market-place-v2/contexts/global-context.tsx`
  - Bug: Spread de arrays en lugar de pasar como propiedades

- [ ] **API Response vacía** en resales/create
  - Archivo: `futura-market-place-v2/app/api/resales/create/route.ts`
  - Bug: Retorna objeto vacío en lugar de response del backend

### Importantes 🟡
- [ ] **Componentes muy grandes** requieren refactorización:
  - `user-info.tsx`: 13,212 líneas
  - `user-tickets.tsx`: 14,090 líneas
  - `header.tsx`: 16,211 líneas
  - `admin-event.service.ts`: 35,424 líneas

- [ ] **TypeScript checks deshabilitados** en next.config.mjs
  - Habilitar `typescript: { ignoreBuildErrors: false }`
  - Corregir errores TypeScript antes de producción

### Menores 🟢
- [ ] Sass deprecation warnings en Admin Frontend
- [ ] Falta favicon en Admin Frontend
- [ ] Warnings de peer dependencies en npm install

---

## 📝 NOTAS DE CONFIGURACIÓN

### Variables de Entorno Requeridas

#### Admin API (.env)
```bash
PORT=3004
NODE_ENV=development
MONGO_URL=mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod
JWT_SECRET_KEY=c98d1f9b952194d8c86e61abc86b8282ccd81c583dcf5284ef15cab03b3f8c6596263f401a4118cf20a398c5e49b9b604197acbc7e9a46f44c9592085025dc23
JWT_EXPIRES_IN=7d
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGINS=http://localhost:3006,http://localhost:3001,http://localhost:3007
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER_NAME=images
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=noreply@futuratickets.com
```

#### Admin Frontend (.env.local)
```bash
NEXT_PUBLIC_FUTURA=http://localhost:3004
NEXT_PUBLIC_FUTURA_API=http://localhost:3004
NEXT_PUBLIC_BLOB_URL=https://futuratickets.blob.core.windows.net/images
NEXT_PUBLIC_MARKET_PLACE=http://localhost:3001
NEXT_PUBLIC_BASE_SEPOLIA_SCAN=https://sepolia.etherscan.io
NEXT_PUBLIC_GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com
```

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### Esta Semana (Must Have)
1. Configurar Stripe con claves reales
2. Configurar Azurite para almacenamiento de imágenes
3. Configurar Mailhog para testing de emails
4. Corregir bugs críticos (GlobalContext, API response vacía)

### Próxima Semana
1. Refactorizar services.tsx
2. Implementar validación con Zod
3. Mover token a httpOnly cookies
4. Tests unitarios básicos

### Mes 1
1. Sistema de notificaciones completo
2. Analytics avanzado
3. Optimización de performance
4. Documentación completa

---

## 📞 COMANDOS ÚTILES

```bash
# Verificar servicios corriendo
lsof -i TCP:3004,3006,3001,6379 | grep LISTEN

# Ver logs en tiempo real
tail -f /tmp/admin-api-newest.log
tail -f /tmp/admin-frontend-newest.log
tail -f /tmp/marketplace-final.log

# Reiniciar todos los servicios
pkill -f "npm.*dev"
pkill -f "npm.*start:dev"

# Verificar Redis
redis-cli PING

# Verificar MongoDB (si local)
mongosh --eval "db.adminCommand('ping')"

# Health check Admin API
curl http://localhost:3004/health
```

---

**Última actualización:** 2025-10-14
**Total tareas pendientes:** ~80 tareas
**Progreso Fase 1:** 100% ✅
**Progreso Fase 2:** 0% 🏃
