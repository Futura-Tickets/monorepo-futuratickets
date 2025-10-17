# Guía Completa de Desarrollo - FuturaTickets

> Documentación exhaustiva para desarrolladores del monorepo FuturaTickets

**Versión**: 1.0  
**Última actualización**: 2025-10-17

---

## 📑 Tabla de Contenidos

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Setup de Desarrollo](#setup-de-desarrollo)
3. [Estructura del Monorepo](#estructura-del-monorepo)
4. [APIs Backend](#apis-backend)
5. [Aplicaciones Frontend](#aplicaciones-frontend)
6. [Base de Datos](#base-de-datos)
7. [Sistema de Pagos](#sistema-de-pagos)
8. [Blockchain Integration](#blockchain-integration)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)
13. [Code Style](#code-style)
14. [Git Workflow](#git-workflow)
15. [FAQ](#faq)

---

## 1. Arquitectura del Sistema

### 1.1 Vista General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────────┐
│                   FRONTEND LAYER                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Marketplace  │ │ Admin Panel  │ │  Access Web  │       │
│  │  (Next.js)   │ │  (Next.js)   │ │  (Next.js)   │       │
│  │  Port 3000   │ │  Port 3001   │ │  Port 3007   │       │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ REST API         │ REST API         │ REST API
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    BACKEND LAYER                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Marketplace  │ │  Admin API   │ │  Access API  │       │
│  │     API      │ │   (NestJS)   │ │   (NestJS)   │       │
│  │  (NestJS)    │ │  Port 3002   │ │  Port 3005   │       │
│  │  Port 3004   │ └──────┬───────┘ └──────┬───────┘       │
│  └──────┬───────┘        │                  │               │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ Mongoose         │ Mongoose         │ Mongoose
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    DATA LAYER                               │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │           MongoDB Atlas                       │          │
│  │  Collections: events, orders, sales,         │          │
│  │             accounts, promoters               │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                EXTERNAL SERVICES                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Stripe  │ │  Azure   │ │ Google   │ │Blockchain│      │
│  │ Payments │ │  Blob    │ │  OAuth   │ │ (Ganache)│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tecnologías por Capa

**Frontend**:
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS
- Radix UI

**Backend**:
- NestJS 10
- TypeScript 5
- Mongoose 8
- Passport JWT
- Bull (job queues)

**Database**:
- MongoDB Atlas (production)
- MongoDB local (development)

**DevOps**:
- Docker
- GitHub Actions
- Google Cloud Run

---

## 2. Setup de Desarrollo

### 2.1 Requisitos

```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
docker --version  # >= 20.0.0 (opcional)
```

### 2.2 Setup Automático

```bash
# Opción A: Setup completo automático
./scripts/utilities/setup-dev-environment.sh

# Opción B: Setup manual por servicio
cd futura-tickets-admin-api && npm install --legacy-peer-deps
cd ../futura-market-place-api && npm install --legacy-peer-deps
cd ../futura-access-api && npm install --legacy-peer-deps
# ... repetir para frontends
```

### 2.3 Configuración de Variables

```bash
# En cada servicio, copiar .env.example a .env
cp futura-tickets-admin-api/.env.example futura-tickets-admin-api/.env
cp futura-market-place-api/.env.example futura-market-place-api/.env
cp futura-access-api/.env.example futura-access-api/.env

# Editar valores
# MONGO_URL=mongodb+srv://...
# JWT_SECRET=tu-secret-ultra-secreto
# STRIPE_SECRET_KEY=sk_test_...
```

### 2.4 Arrancar Servicios

```bash
# Todo a la vez
./start-all.sh

# Backend solo
./start-all-backends.sh

# Frontend solo
./start-all-frontends.sh

# Servicio individual
cd futura-tickets-admin-api && npm run start:dev
```

---

## 3. Estructura del Monorepo

### 3.1 Servicios Backend

```
futura-tickets-admin-api/       # Admin & Events API
├── src/
│   ├── Event/                  # Gestión de eventos
│   ├── Account/                # Usuarios y auth
│   ├── Orders/                 # Órdenes de compra
│   ├── Sales/                  # Tickets vendidos
│   ├── Stripe/                 # Pagos
│   ├── Mail/                   # Emails
│   ├── Socket/                 # WebSockets
│   └── CronJobs/               # Tareas programadas
├── test/
├── .env
└── package.json

futura-market-place-api/        # Marketplace API
├── src/
│   ├── Orders/                 # Creación de órdenes
│   ├── Stripe/                 # Procesamiento pagos
│   ├── Sales/                  # Gestión tickets
│   ├── Event/                  # Eventos
│   └── Mail/                   # Notificaciones
├── .env
└── package.json

futura-access-api/              # Control de Acceso
├── src/
│   ├── Event/                  # Validación acceso
│   ├── Account/                # Personal acceso
│   ├── Auth/                   # JWT
│   └── Socket/                 # Notificaciones tiempo real
├── .env
└── package.json
```

### 3.2 Servicios Frontend

```
futura-market-place-v2/         # Marketplace Web
├── app/
│   ├── page.tsx                # Home
│   ├── checkout/               # Checkout
│   ├── cart/                   # Carrito
│   ├── account/                # Cuenta usuario
│   └── api/                    # API routes (BFF)
├── components/
├── contexts/
└── .env.local

futura-tickets-admin/           # Admin Panel
├── app/
│   ├── dashboard/              # Dashboard
│   ├── events/                 # Gestión eventos
│   └── analytics/              # Analytics
└── .env.local

futura-tickets-access-app/      # Access Web
├── app/
│   ├── scan/                   # Escaneo QR
│   └── validate/               # Validación
└── .env.local
```

---

## 4. APIs Backend

### 4.1 Admin API (Puerto 3002)

**Responsabilidades**:
- CRUD de eventos
- Gestión de promotores
- Estadísticas y analytics
- Sistema de emails
- Tareas programadas (CronJobs)

**Endpoints Principales**:
```typescript
// Eventos
POST   /admin/events                    // Crear evento
GET    /admin/events                    // Listar eventos
GET    /admin/events/:id                // Detalle evento
PATCH  /admin/events/:id                // Actualizar evento
DELETE /admin/events/:id                // Eliminar evento

// Órdenes
GET    /orders                          // Listar órdenes
GET    /orders/:paymentId               // Detalle orden

// Promocodes
POST   /events/promocodes/create        // Crear promocode
GET    /events/promocodes/:eventId      // Listar promocodes
DELETE /events/promocodes/:eventId/:code // Eliminar
```

**CronJobs**:
```typescript
// Ejecuta cada 15 minutos
@Cron('*/15 * * * *')
async checkEventDates() {
  // Actualiza eventos a LIVE cuando llega su fecha
  // Cierra eventos cuando termina su fecha
}
```

### 4.2 Marketplace API (Puerto 3004)

**Responsabilidades**:
- Creación de órdenes
- Procesamiento de pagos (Stripe)
- Gestión de tickets (compra, reventa, transferencia)
- Emails transaccionales

**Endpoints Principales**:
```typescript
// Stripe
GET    /stripe/config                   // Public key

// Órdenes
POST   /orders/create                   // Crear orden
GET    /orders/:paymentId               // Obtener orden

// Ventas
GET    /sales/profile/:userId           // Tickets de usuario
GET    /resales/:eventId                // Tickets en reventa

// Reventa
POST   /resales/create                  // Poner en reventa
POST   /resales/cancel-resale           // Cancelar reventa

// Transferencia
POST   /transfer                        // Transferir ticket
```

### 4.3 Access API (Puerto 3005)

**Responsabilidades**:
- Validación de tickets (check-in)
- Autenticación de personal de acceso
- Notificaciones en tiempo real (WebSockets)

**Endpoints Principales**:
```typescript
// Auth
POST   /accounts/login                  // Login personal acceso
POST   /accounts/validate               // Validar token

// Validación
PATCH  /events/access                   // Validar ticket
GET    /events/attendants/:event        // Lista asistentes

// Health
GET    /health                          // Health check
GET    /health/ready                    // Readiness check
GET    /health/info                     // System info
```

---

## 5. Aplicaciones Frontend

### 5.1 Marketplace Web (Puerto 3000)

**Páginas**:
- `/` - Home con listado de eventos
- `/checkout` - Proceso de compra
- `/cart` - Carrito de compras
- `/account` - Perfil y tickets del usuario
- `/resume` - Confirmación de orden

**Flujo de Compra**:
```typescript
1. Usuario busca evento
2. Selecciona tickets → addToCart()
3. Cart → Checkout
4. Contact form → createOrder()
5. Stripe payment → confirmPayment()
6. Redirect a /resume con success
```

### 5.2 Admin Panel (Puerto 3001)

**Páginas**:
- `/dashboard` - Estadísticas generales
- `/events` - Gestión de eventos
- `/events/create` - Crear evento
- `/events/:id` - Editar evento
- `/analytics` - Analytics avanzado

### 5.3 Access Web (Puerto 3007)

**Páginas**:
- `/scan` - Escanear QR de tickets
- `/validate` - Validar manualmente
- `/attendants` - Lista de asistentes

---

## 6. Base de Datos

### 6.1 Colecciones MongoDB

```typescript
// Events
{
  _id, name, description, image, capacity,
  location, dateTime, tickets[], ticketLots[],
  promoter, status, commission, resale
}

// Orders
{
  _id, paymentId, account, event, promoter,
  items[], resaleItems[], contactDetails,
  status, createdAt
}

// Sales (tickets)
{
  _id, order, event, client, promoter,
  type, price, qrCode, tokenId, status,
  resale, history[], activity
}

// Accounts
{
  _id, email, password, name, lastName,
  role, promoter, accessEvent, address
}

// Promoters
{
  _id, name, address, key, mnemonic,
  events[], clients[]
}
```

### 6.2 Relaciones

```
Promoter (1) ──► (N) Event
Event (1) ──► (N) Order
Order (1) ──► (N) Sale
Account (1) ──► (N) Order
Account (N) ──► (1) Promoter
```

### 6.3 Índices Importantes

```typescript
// Sales
SalesSchema.index({ event: 1, status: 1 });
SalesSchema.index({ client: 1 });
SalesSchema.index({ qrCode: 1 }, { unique: true });

// Orders
OrdersSchema.index({ paymentId: 1 });
OrdersSchema.index({ account: 1, createdAt: -1 });

// Events
EventSchema.index({ status: 1, 'dateTime.startDate': 1 });
EventSchema.index({ promoter: 1 });
```

---

## 7. Sistema de Pagos

### 7.1 Flujo Stripe

```typescript
// 1. Frontend solicita Payment Intent
const response = await fetch('/api/events/create-order', {
  method: 'POST',
  body: JSON.stringify({
    contactDetails,
    orders: [{ event, promoter, items }]
  })
});
const { paymentId, clientSecret } = await response.json();

// 2. Frontend inicializa Stripe
const stripe = await loadStripe(publishableKey);
const elements = stripe.elements({ clientSecret });

// 3. Usuario ingresa tarjeta en PaymentElement

// 4. Confirmar pago
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/resume`
  }
});

// 5. Stripe procesa y envía webhook al backend

// 6. Backend actualiza orden y crea tickets
```

### 7.2 Webhooks Stripe

```typescript
@Post('/stripe/webhook')
async handleWebhook(@Req() req, @Res() res) {
  const sig = req.headers['stripe-signature'];
  const event = this.stripeService.constructEvent(
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

  res.status(200).send();
}
```

---

## 8. Blockchain Integration

### 8.1 Stack

- **Hardhat**: Development environment
- **Ganache**: Local blockchain (puerto 8545)
- **ethers.js**: Library para interactuar
- **Smart Contracts**: EventNFT contract

### 8.2 Minteo de NFTs

```typescript
// Cuando se completa un pago
async function mintTicketNFT(sale: Sale, event: Event) {
  const contract = new ethers.Contract(
    event.address,
    EventNFTABI,
    signer
  );

  const tx = await contract.mint(
    sale.client.address,
    sale._id,
    tokenURI
  );

  const receipt = await tx.wait();

  await salesService.updateSale(sale._id, {
    tokenId: receipt.events[0].args.tokenId,
    hash: tx.hash,
    blockNumber: receipt.blockNumber,
    status: TicketStatus.OPEN
  });
}
```

---

## 9. Testing

### 9.1 Unit Tests

```bash
# Ejecutar todos los tests
npm test

# Con coverage
npm run test:cov

# Watch mode
npm run test:watch

# Test específico
npm test -- sales.service.spec.ts
```

**Estructura de tests**:
```typescript
describe('SalesService', () => {
  let service: SalesService;
  let model: Model<Sale>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getModelToken(Sale.name), useValue: mockModel }
      ]
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should create a sale', async () => {
    const createSaleDto = { ... };
    const result = await service.createSale(createSaleDto);
    expect(result).toBeDefined();
  });
});
```

### 9.2 Smoke Tests

```bash
# Verificar que todos los servicios responden
./scripts/utilities/smoke-tests.sh
```

### 9.3 E2E Tests

```bash
# E2E tests con Playwright
npm run test:e2e

# Con UI
npm run test:e2e:ui
```

---

## 10. Deployment

### 10.1 Docker Build

```bash
# Build image
docker build -t futura-tickets-admin-api:latest futura-tickets-admin-api/

# Run locally
docker run -p 3002:3002 \
  -e MONGO_URL=$MONGO_URL \
  -e JWT_SECRET=$JWT_SECRET \
  futura-tickets-admin-api:latest
```

### 10.2 Google Cloud Run

```bash
# Build y push
gcloud builds submit --tag gcr.io/PROJECT_ID/admin-api

# Deploy
gcloud run deploy admin-api \
  --image gcr.io/PROJECT_ID/admin-api \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

---

## 11. Troubleshooting

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para guía completa.

**Problemas comunes**:
- Puerto ocupado: `lsof -ti:3000 | xargs kill`
- Dependencias rotas: `rm -rf node_modules && npm install --legacy-peer-deps`
- MongoDB no conecta: Verificar MONGO_URL en .env

---

## 12. Best Practices

### 12.1 Código

- ✅ Usar TypeScript strict mode
- ✅ Interfaces para todos los DTOs
- ✅ Validación con class-validator
- ✅ Error handling consistente
- ✅ Logging estructurado

### 12.2 Git

- ✅ Commits con Conventional Commits
- ✅ Branches: feature/*, bugfix/*, hotfix/*
- ✅ PRs con descripción detallada
- ✅ Code review obligatorio

### 12.3 Seguridad

- ❌ NUNCA commitear .env
- ❌ NUNCA hardcodear secrets
- ✅ Usar variables de entorno
- ✅ Rotar credentials regularmente

---

## 13. Code Style

### 13.1 TypeScript

```typescript
// ✅ Good
interface CreateOrderDto {
  contactDetails: ContactDetails;
  orders: OrderItem[];
}

// ❌ Bad
function createOrder(data: any) { ... }
```

### 13.2 NestJS

```typescript
// ✅ Good - Dependency injection
@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>
  ) {}
}

// ❌ Bad - Direct instantiation
const eventModel = new EventModel();
```

---

## 14. Git Workflow

```bash
# 1. Crear branch
git checkout -b feature/new-feature

# 2. Desarrollar
# ... hacer cambios

# 3. Commit
git add .
git commit -m "feat: add new feature"

# 4. Push
git push origin feature/new-feature

# 5. Crear PR en GitHub

# 6. Code review y merge
```

---

## 15. FAQ

**Q: ¿Cómo agrego un nuevo endpoint?**
A: Ver sección 4 de APIs Backend, crear controller + service + DTO.

**Q: ¿Cómo ejecuto solo un servicio?**
A: `cd servicio && npm run start:dev`

**Q: ¿Dónde están los logs?**
A: stdout en desarrollo, archivos en producción.

**Q: ¿Cómo hago debug?**
A: `npm run start:debug` y adjuntar debugger en puerto 9229.

---

**Fin de la Guía de Desarrollo**

Para más información, consulta:
- [README.md](./README.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
