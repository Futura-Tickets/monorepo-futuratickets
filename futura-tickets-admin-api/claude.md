# FUTURA-TICKETS-ADMIN-API-MAIN - ANÁLISIS TÉCNICO

## 1. RESUMEN EJECUTIVO

**Propósito**: Backend principal de administración y gestión de eventos, órdenes, pagos y tickets para Futura Tickets. NestJS API con MongoDB, Stripe, WebSockets y tareas programadas.

**Stack Tecnológico**:
- NestJS 10.0.0 + TypeScript 5.1.3
- MongoDB + Mongoose 8.4.3
- Stripe 17.4.0 (payment processing)
- Bull 4.14.0 + BullMQ 5.8.3 (job queues)
- Socket.IO 4.7.5 + Azure Web PubSub
- JWT Authentication (passport-jwt)
- Blockchain: ethers 6.13.1 + viem 2.20.0

**Métricas**: 9,485 líneas totales, 19 módulos, puerto 3000

---

## 2. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────┐
│      FUTURA TICKETS ADMIN API (NestJS)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │          HTTP REST Controllers              │  │
│  │  AdminEvent │ UserEvent │ Orders │ Sales   │  │
│  │  Payments │ Stripe │ Promoter │ Account    │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │        WebSocket Gateway (Socket.IO)        │  │
│  │  Real-time notifications & updates          │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │           Services Layer                    │  │
│  │  Event │ Orders │ Sales │ Mail │ Stripe     │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │      Background Jobs (Bull Queues)          │  │
│  │  Event Processor │ Mail Processor           │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │       CronJobs (@nestjs/schedule)           │  │
│  │  Check event dates every 15 min            │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   MongoDB Database    │
        │  Events, Orders, Sales│
        │  Accounts, Promoters  │
        └───────────────────────┘
```

---

## 3. ESTRUCTURA DE DIRECTORIOS

```
src/
├── main.ts                    # Bootstrap (puerto 3000, CORS habilitado)
├── app.module.ts             # Root module
├── app.controller.ts
├── app.service.ts
│
├── Abstraction/              # Capa de abstracción
├── Account/                  # Gestión de cuentas de usuario
│   ├── account.controller.ts
│   ├── account.service.ts    # UserPipeService
│   ├── account.schema.ts
│   └── account.interface.ts
│
├── Auth/                     # Autenticación JWT
│   ├── auth.module.ts
│   ├── auth.decorator.ts     # @Auth decorator
│   ├── jwt.strategy.ts
│   ├── services/auth.service.ts
│   └── guards/account.guard.ts
│
├── CronJobs/                 # Tareas programadas
│   ├── cron-jobs.module.ts
│   └── cron-jobs.service.ts  # @Cron('*/15 * * * *')
│
├── Event/                    # Gestión de eventos
│   ├── event.module.ts
│   ├── event.schema.ts       # MongoDB schema (3,509 líneas)
│   ├── event.service.ts
│   ├── event.processor.ts    # Bull processor
│   ├── admin-event.controller.ts  (7,486 líneas)
│   ├── admin-event.service.ts     (35,424 líneas)
│   ├── user-event.controller.ts
│   ├── user-event.service.ts      (20,497 líneas)
│   └── invitations.service.ts
│
├── Mail/                     # Sistema de correos
│   ├── mail.module.ts
│   ├── mail.service.ts
│   ├── mail.processor.ts     # Bull mail queue
│   └── mail.interface.ts
│
├── Notifications/            # Sistema de notificaciones
│   └── notifications.module.ts
│
├── Orders/                   # Gestión de órdenes
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.schema.ts
│   └── orders.interface.ts
│
├── Payments/                 # Gestión de pagos
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   ├── payments.schema.ts
│   ├── payments.interface.ts
│   ├── payment-methods.controller.ts
│   └── payment-methods.service.ts
│
├── Promoter/                 # Gestión de promotores
│   ├── promoter.controller.ts
│   ├── promoter.service.ts
│   └── promoter.schema.ts
│
├── Provider/                 # Proveedor de servicios
│   ├── provider.module.ts
│   └── provider.service.ts
│
├── QrCode/                   # Generación de QR codes
│   └── qrcode.service.ts     # Usa librería 'qrcode'
│
├── Sales/                    # Gestión de ventas/tickets
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   ├── sales.schema.ts
│   └── sales.interface.ts
│
├── Socket/                   # WebSocket gateway
│   ├── socket.module.ts
│   └── socket.gateway.ts
│
├── Stripe/                   # Integración Stripe
│   ├── stripe.controller.ts
│   ├── stripe.service.ts
│   └── stripe.module.ts
│
├── abis/                     # Smart contract ABIs
│   └── EventNFT.json
│
├── shared/
│   └── interface.ts          # Interfaces compartidas
│
└── utils/
    └── password.ts           # bcrypt utilities
```

---

## 4. MÓDULOS PRINCIPALES

### 4.1 Event Module (65,917 líneas)

**Controllers**:
- `admin-event.controller.ts` (7,486 líneas): Admin panel endpoints
- `user-event.controller.ts` (1,491 líneas): User-facing endpoints

**Services**:
- `admin-event.service.ts` (35,424 líneas): Lógica de negocio admin
- `user-event.service.ts` (20,497 líneas): Lógica de negocio usuario
- `invitations.service.ts` (2,004 líneas): Sistema de invitaciones

**Funcionalidades**:
- CRUD de eventos
- Gestión de tickets por lote (ticketLots)
- Sistema de reventa
- Blockchain integration (isBlockchain flag)
- Upload de imágenes (Azure Blob Storage)
- Estadísticas y views
- Condiciones y FAQs

**Event Schema**:
```typescript
{
  promoter: ObjectId,
  name: string,
  description: string,
  genres: string[],
  image: string,
  ticketImage: string,
  availableTickets: number,  // default: 3
  maxQuantity: number,
  capacity: number,
  commission: number,        // default: 5%
  resale: Resale,
  artists: Artist[],
  location: Location,
  dateTime: DateTime,
  conditions: Condition[],
  faqs: Faq[],
  isBlockchain: boolean,     // default: true
  views: number,
  address: string,           // Blockchain address
  blockNumber: number,
  hash: string,
  url: string,
  tickets: Ticket[],
  ticketLots: TicketLot[],
  orders: ObjectId[],
  status: EventStatus
}
```

### 4.2 CronJobs Module

**Cron Job**: Ejecuta cada 15 minutos
```typescript
@Cron('*/15 * * * *')
async handleCron() {
  const activeEvents = await this.eventService.getActiveEvents();

  for (event of activeEvents) {
    // Check if event should start (change to LIVE)
    await this.checkEventStartDate(event._id, event.dateTime.startDate);

    // Check if event should close (CLOSED + expire tickets)
    // await this.checkEventExpireDate(event._id, event.dateTime.endDate);
  }
}
```

**Funcionalidad**:
- Actualiza eventos a status `LIVE` cuando llega su fecha de inicio
- ⚠️ Expiración de eventos comentada pero no activa

### 4.3 Auth Module

**JWT Strategy**: Passport-JWT

**Auth Decorator**:
```typescript
@Auth(UserPipeService) user: Account
@Auth(PromoterPipeService) promoter: Promoter
```

**Guard**: `account.guard.ts` - Protege rutas con JWT

### 4.4 Stripe Module

**Controller**:
```typescript
@Get('/config')
getStripeConfig(): { config: string } {
  return { config: this.stripeService.publishableKey() };
}
```

**Service**: Gestiona PaymentIntents, webhooks, etc.

### 4.5 Mail Module

**Bull Queue**: Procesa envío de emails asíncronamente

**Mail Processor**: `mail.processor.ts`

**Funcionalidades**:
- Envío de emails transaccionales
- Templates con EJS/Pug
- Queue para procesamiento en background

### 4.6 Sales Module

**Schema**: Representa un ticket vendido
```typescript
{
  order: ObjectId,
  event: ObjectId,
  client: ObjectId,
  type: string,           // tipo de ticket
  price: number,
  qrCode: string,
  status: TicketStatus,
  activity: TicketActivity,
  resale: {
    isResale: boolean,
    resalePrice: number,
    resaleDate: Date
  },
  transfer: {
    from: string,
    to: string
  },
  history: SaleHistory[]
}
```

### 4.7 Orders Module

**Funcionalidad**:
- Crear órdenes de compra
- Asociar con PaymentIntent de Stripe
- Referenciar ventas (Sales)

**Controller**:
```typescript
@Get('/config')
getOrderConfig(): { config: string }

@Get('/')
async getOrdersByAccount(@Auth(UserPipeService) user): Promise<Order[]>
```

### 4.8 Socket Module

**WebSocket Gateway**: Socket.IO con Azure Web PubSub

**Uso**:
- Notificaciones en tiempo real
- Actualizaciones de estado de órdenes/tickets

### 4.9 Payments Module

**Controllers**:
- `payments.controller.ts`: Gestión de pagos
- `payment-methods.controller.ts`: Métodos de pago

**Integración con Stripe** para procesar pagos

---

## 5. CONFIGURACIÓN Y DEPLOYMENT

### Variables de Entorno

```bash
# MongoDB
MONGO_URL=mongodb://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=...

# Redis (Bull queues)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=10

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASSWORD=...

# Blockchain
RPC_URL=https://...
PRIVATE_KEY=0x...
```

### Dockerfile

```dockerfile
FROM node:18-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/main"]
```

### Scripts NPM

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "jest",
  "test:cov": "jest --coverage"
}
```

---

## 6. INTERFACES Y TIPOS CLAVE

### EventStatus Enum
```typescript
enum EventStatus {
  HOLD = "HOLD",
  CREATED = "CREATED",
  LAUNCHED = "LAUNCHED",
  LIVE = "LIVE",
  CLOSED = "CLOSED"
}
```

### TicketStatus Enum
```typescript
enum TicketStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  OPEN = "OPEN",
  SALE = "SALE",
  SOLD = "SOLD",
  CLOSED = "CLOSED",
  TRANSFERED = "TRANSFERED",
  EXPIRED = "EXPIRED"
}
```

### TicketActivity Enum
```typescript
enum TicketActivity {
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  GRANTED = "GRANTED",
  DENIED = "DENIED",
  TRANSFERING = "TRANSFERING",
  TRANSFERED = "TRANSFERED"
}
```

---

## 7. FLUJOS DE DATOS PRINCIPALES

### Flujo de Creación de Evento

```
1. Admin → POST /admin/events
   Body: { name, description, tickets, location, dateTime, ... }

2. admin-event.service.ts
   └─> Validar datos
   └─> Upload imagen a Azure Blob Storage
   └─> Si isBlockchain: deploy smart contract (⚠️ implementación pendiente)
   └─> Crear evento en MongoDB (status: CREATED)
   └─> Retornar evento creado

3. Admin → PATCH /admin/events/:id/status
   Body: { status: "LAUNCHED" }
   └─> Evento visible en marketplace
```

### Flujo de Compra de Tickets

```
1. Cliente → POST /orders/create
   Body: { event, items: [{ type, amount, price }], contact }

2. orders.service.ts
   └─> Validar disponibilidad de tickets
   └─> Crear PaymentIntent en Stripe
   └─> Crear Order en MongoDB (status: PENDING)
   └─> Retornar { paymentId, clientSecret }

3. Cliente → Paga con Stripe

4. Stripe Webhook → POST /stripe/webhook
   └─> Verificar firma
   └─> Si payment succeeded:
       └─> Actualizar Order (status: COMPLETED)
       └─> Crear N Sales (uno por ticket)
       └─> Generar QR codes únicos
       └─> Enviar email con tickets (Bull queue)
       └─> Emitir WebSocket notification
```

### Flujo de Reventa

```
1. Usuario → PATCH /sales/:id/resale
   Body: { resalePrice }
   └─> Validar resalePrice <= event.resale.maxPrice
   └─> Actualizar Sale { resale: { isResale: true, resalePrice, resaleDate } }
   └─> Sale.status = SALE

2. Comprador → Compra ticket en reventa (mismo flujo de compra)
   └─> Order incluye resaleItems[]
   └─> Sale original: Transfer de ownership
   └─> Nueva Sale para comprador
```

### Flujo de Transferencia

```
1. Usuario → POST /sales/:id/transfer
   Body: { to: { name, email, ... } }
   └─> Validar que usuario sea dueño
   └─> Actualizar Sale { transfer: { from, to } }
   └─> Sale.status = TRANSFERED
   └─> Crear nueva Sale para receptor
   └─> Enviar email a receptor
```

---

## 8. INTEGRACIONES EXTERNAS

### Stripe
- Payment Intents API
- Webhooks para confirmación de pago
- Customer management
- Refunds (⚠️ no implementado completamente)

### Azure Blob Storage
- Upload de imágenes de eventos
- Almacenamiento de ticket images
- CDN para servir assets

### Blockchain (Partial)
- ethers.js para interactuar con smart contracts
- viem para utilidades
- ABI de EventNFT contract
- ⚠️ Integración incompleta

### Email (SMTP)
- NestJS Mailer module
- Templates con EJS
- Bull queue para envío asíncrono

---

## 9. PROBLEMAS DETECTADOS

### 9.1 CORS Abierto
**Archivo**: `main.ts:14`
```typescript
app.enableCors();  // ❌ Permite cualquier origen
```
**Solución**: Descomentar whitelist (líneas 15-26)

### 9.2 CronJob de Expiración Deshabilitado
**Archivo**: `cron-jobs.service.ts:31`
```typescript
// await this.checkEventExpireDate(...);  // ❌ Comentado
```
**Impacto**: Eventos no se cierran automáticamente, tickets no expiran

### 9.3 Error Handling Inconsistente
```typescript
try {
  ...
} catch (error) {
  console.log(error);  // ❌ Solo log, no propaga error
}
```

### 9.4 README Genérico
README.md es el template por defecto de NestJS, sin información del proyecto.

### 9.5 0% Test Coverage
No hay archivos `.spec.ts` implementados.

### 9.6 TypeScript @ts-ignore
**Archivo**: `app.module.ts:49`
```typescript
// @ts-ignore
useFactory: (config: ConfigService) => [...]
```

---

## 10. ARQUITECTURA DE DATOS

### Relaciones MongoDB

```
Account (users)
   │
   │ 1:N
   ▼
Order
   │
   │ N:1
   ├─> Event
   │
   │ 1:N
   └─> Sale (tickets)
       │
       │ N:1
       └─> Event

Promoter
   │
   │ 1:N
   └─> Event
```

---

## 11. RECOMENDACIONES

### Crítico (P0)
1. **Habilitar CORS whitelist**: Usar lista de orígenes permitidos
2. **Activar expiración de eventos**: Descomentar `checkEventExpireDate`
3. **Mejorar error handling**: Propagar errores correctamente
4. **Documentar README**: Agregar info específica del proyecto

### Alto (P1)
1. **Implementar tests**: Unit + integration tests
2. **Remover @ts-ignore**: Tipado correcto en ThrottlerModule
3. **Logging estructurado**: Winston o Pino
4. **Monitoreo**: Sentry para error tracking
5. **Health checks**: Endpoints `/health` y `/ready`

### Medio (P2)
1. **Completar integración blockchain**: Deploy automático de contratos
2. **Refactorizar admin-event.service**: 35k líneas es excesivo
3. **API documentation**: Swagger/OpenAPI
4. **Rate limiting específico**: Por ruta
5. **Backup strategy**: MongoDB backups automáticos

### Bajo (P3)
1. **Migrations**: Sistema de migraciones para MongoDB
2. **Feature flags**: Para despliegues graduales
3. **Performance monitoring**: APM con New Relic
4. **Cache layer**: Redis para queries frecuentes

---

## CONCLUSIÓN

**futura-tickets-admin-api-main** es un backend NestJS robusto con 9,485 líneas que gestiona todo el ciclo de vida de eventos y tickets.

✅ **Fortalezas**:
- Arquitectura modular bien organizada
- Integración completa con Stripe
- Sistema de CronJobs para automatización
- WebSockets para notificaciones en tiempo real
- Bull queues para tareas asíncronas
- JWT authentication implementado

⚠️ **Áreas de Mejora**:
- CORS completamente abierto (seguridad)
- Expiración de eventos deshabilitada
- 0% test coverage
- Error handling básico
- Componentes muy grandes (admin-event.service: 35k líneas)
- Blockchain integration incompleta
- README genérico sin documentación

🎯 **Prioridades**:
1. Cerrar CORS a dominios específicos
2. Activar CronJob de expiración
3. Implementar tests para módulos críticos
4. Refactorizar services grandes
5. Documentar APIs con Swagger
6. Agregar logging y monitoring

**Complejidad**: Alta
**Estado**: Funcional en producción pero requiere hardening
**Tiempo estimado mejoras**: 4-6 semanas (2 developers)
