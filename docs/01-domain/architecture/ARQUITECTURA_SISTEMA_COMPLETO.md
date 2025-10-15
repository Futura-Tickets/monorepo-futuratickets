# ARQUITECTURA DEL SISTEMA FUTURA TICKETS - DOCUMENTACIÓN COMPLETA

> **Fecha**: 2025-01-14
> **Estado**: Producción
> **Versión**: 2.0

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura de Microservicios](#2-arquitectura-de-microservicios)
3. [Componentes Principales](#3-componentes-principales)
4. [Flujos de Datos Críticos](#4-flujos-de-datos-críticos)
5. [Integraciones Externas](#5-integraciones-externas)
6. [Seguridad y Autenticación](#6-seguridad-y-autenticación)
7. [Base de Datos y Modelos](#7-base-de-datos-y-modelos)
8. [Infraestructura y Deployment](#8-infraestructura-y-deployment)

---

## 1. VISIÓN GENERAL DEL SISTEMA

### 1.1 Propósito

**Futura Tickets** es una plataforma completa de gestión y venta de tickets para eventos que incluye:

- 🎫 **Marketplace público** para compra de tickets
- 🎛️ **Panel de administración** para promotores
- ✅ **Sistema de control de acceso** para validación de entradas
- 💳 **Procesamiento de pagos** con Stripe
- 🔄 **Mercado secundario** (reventa y transferencia)
- 🔗 **Integración blockchain** (NFTs - en desarrollo)

### 1.2 Stack Tecnológico Global

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Frontend** | Next.js | 15.3.1 |
| **UI Framework** | React | 19 |
| **Backend** | NestJS | 10.x |
| **Base de Datos** | MongoDB Atlas | 5.x |
| **Pagos** | Stripe | API 2024-11-20 |
| **Autenticación** | JWT + Google OAuth | - |
| **Cache/Colas** | Redis + Bull | 5.4.1 |
| **Emails** | NodeMailer + Bull Queues | - |
| **WebSockets** | Socket.IO + Azure Web PubSub | 4.7.5 |
| **Blockchain** | ethers.js + viem | 6.13.1 |
| **Storage** | Azure Blob Storage | - |
| **Deployment** | Docker + Google Cloud Run | - |

### 1.3 Métricas del Sistema

```
Total Repositorios: 13+
Líneas de Código (estimado): 150,000+
Microservicios Activos: 5
APIs Principales: 3
Frontends: 2 (Marketplace + Admin)
Usuarios Activos: [Producción]
```

---

## 2. ARQUITECTURA DE MICROSERVICIOS

### 2.1 Diagrama de Arquitectura Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIOS FINALES                            │
│              (Compradores, Promotores, Personal de Acceso)          │
└────────────────┬───────────────────────────┬────────────────────────┘
                 │                           │
                 ▼                           ▼
    ┌────────────────────────┐   ┌────────────────────────┐
    │  MARKETPLACE FRONTEND  │   │   ADMIN PANEL          │
    │  (Next.js 15 - 3001)   │   │   (Next.js 15 - 3001)  │
    │  - Compra tickets      │   │   - Gestión eventos    │
    │  - Reventa             │   │   - Analytics          │
    │  - Transferencias      │   │   - Pagos promotores   │
    └────────────┬───────────┘   └────────────┬───────────┘
                 │                           │
                 │ HTTP/REST                 │ HTTP/REST
                 │                           │
                 ▼                           ▼
    ┌────────────────────────┐   ┌────────────────────────┐
    │  MARKETPLACE API       │   │   ADMIN API            │
    │  (NestJS - 3002)       │   │   (NestJS - 3003)      │
    │  - Stripe Integration  │   │   - Event Management   │
    │  - Order Processing    │   │   - Promoter Dashboard │
    │  - Email System        │   │   - Analytics          │
    └────────────┬───────────┘   └────────────┬───────────┘
                 │                           │
                 └───────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │      MongoDB Atlas           │
              │   (Shared Database)          │
              │   - Events                   │
              │   - Orders                   │
              │   - Sales                    │
              │   - Accounts                 │
              └──────────────────────────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
    ┌────────────────┐ ┌─────────┐ ┌──────────┐
    │  Stripe API    │ │  Redis  │ │  Azure   │
    │  (Payments)    │ │  (Bull) │ │  Storage │
    └────────────────┘ └─────────┘ └──────────┘

              ┌────────────────────────┐
              │   ACCESS CONTROL API   │
              │   (NestJS - 3004)      │
              │   - QR Validation      │
              │   - Check-in/Check-out │
              └────────────────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │   ACCESS FRONTEND      │
              │   (Next.js - 3005)     │
              │   - Scanner Interface  │
              └────────────────────────┘
```

### 2.2 Responsabilidades por Servicio

#### **Marketplace API (futura-market-place-api)**
**Puerto**: 3002
**Responsabilidades**:
- ✅ Procesamiento de pagos con Stripe
- ✅ Creación y gestión de órdenes
- ✅ Sistema de emails transaccionales (9 tipos)
- ✅ Gestión de tickets/sales
- ✅ WebSockets para notificaciones en tiempo real
- ⚠️ Integración blockchain (en desarrollo)

**Endpoints Principales**:
- `POST /stripe/config` - Obtener Stripe public key
- `POST /orders/create-order` - Crear orden con Payment Intent
- `GET /orders/profile` - Obtener órdenes del usuario
- `GET /orders/paymentId/:id` - Obtener orden por Payment Intent ID
- `POST /sales/create` - Crear ticket individual
- `GET /sales/event/:id` - Obtener ventas por evento

#### **Admin API (futura-tickets-admin-api)**
**Puerto**: 3003
**Responsabilidades**:
- ✅ Gestión completa de eventos
- ✅ Dashboard de promotores
- ✅ Analytics y reportes
- ✅ Gestión de códigos promocionales y cupones
- ✅ Sistema de invitaciones
- ✅ Gestión de pagos a promotores

**Endpoints Principales**:
- `POST /events` - Crear evento
- `PATCH /events/:id` - Actualizar evento
- `POST /events/:id/launch` - Lanzar evento al marketplace
- `GET /sales/event/:id` - Obtener ventas por evento
- `GET /analytics/promoter` - Analytics del promotor
- `POST /promocodes/:eventId` - Crear código promocional
- `POST /coupons/:eventId` - Crear cupón de descuento

#### **Access Control API (futura-access-api)**
**Puerto**: 3004
**Responsabilidades**:
- ✅ Validación de QR codes
- ✅ Check-in/Check-out de asistentes
- ✅ Control de acceso en tiempo real
- ✅ Logging de accesos

**Endpoints Principales**:
- `POST /access/validate` - Validar QR code
- `POST /access/check-in` - Registrar entrada
- `GET /access/event/:id/stats` - Estadísticas de acceso

#### **Marketplace Frontend (futura-market-place-v2)**
**Puerto**: 3001
**Stack**: Next.js 15 + React 19 + Tailwind + Radix UI
**Características**:
- Catálogo de eventos con filtros
- Carrito de compras
- Checkout con Stripe Elements
- Gestión de cuenta de usuario
- Mis tickets con QR codes
- Sistema de reventa
- Transferencia de tickets

#### **Admin Frontend (futura-tickets-admin)**
**Puerto**: 3001 (diferente instancia)
**Stack**: Next.js 15 + React 19 + Ant Design
**Características**:
- Gestión completa de eventos
- Dashboard con analytics
- Gestión de clientes
- Sistema de pagos y withdrawals
- Campañas de marketing
- Configuración de promociones

---

## 3. COMPONENTES PRINCIPALES

### 3.1 Sistema de Autenticación

#### JWT Token Flow

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. Login (email/password o Google)
       ▼
┌──────────────────┐
│   Backend API    │
│   Valida creds   │
└──────┬───────────┘
       │ 2. Genera JWT token
       ▼
┌──────────────────┐
│   localStorage   │
│   'auth_token'   │
└──────┬───────────┘
       │ 3. Incluye en headers
       ▼
┌──────────────────┐
│  API Requests    │
│  Authorization:  │
│  Bearer {token}  │
└──────────────────┘
```

**Schemas Zod para Autenticación**:

```typescript
// Login
const loginCredentialsSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Register
const registerCredentialsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain lowercase, uppercase, and number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});
```

### 3.2 Sistema de Validación con Zod

#### Arquitectura de Validación

**Archivo**: `/lib/validations.ts` - 15 schemas
**Archivo**: `/lib/api-helpers.ts` - Utilities de validación

**Patrón de Validación Implementado**:

```typescript
// 1. Define schema
export const createOrderSchema = z.object({
  contactDetails: contactDetailsSchema.optional(),
  orders: z.array(z.object({
    event: z.string().min(1, 'Event ID is required'),
    promoter: z.string().min(1, 'Promoter ID is required'),
    items: z.array(orderItemSchema).min(1, 'At least one item required')
  })).min(1, 'At least one order required')
});

// 2. Use in API route
async function handler(request: NextRequest) {
  const validation = await validateRequest(request, createOrderSchema);
  if (!validation.success) {
    return validation.error; // Returns formatted Zod errors
  }

  const validatedData = validation.data; // Fully typed!
  // ... proceed with validated data
}

export const POST = withErrorHandling(handler);
```

**Schemas Implementados**:

1. `loginCredentialsSchema` - Login con email/password
2. `registerCredentialsSchema` - Registro de usuario
3. `createOrderSchema` - Creación de órdenes (el más complejo)
4. `createResaleSchema` - Poner ticket en reventa
5. `transferTicketSchema` - Transferir ticket
6. `updateUserProfileSchema` - Actualizar perfil
7. `updatePasswordSchema` - Cambiar contraseña
8. `recoverPasswordSchema` - Recuperar cuenta
9. `couponCodeSchema` - Validar cupón
10. `promoCodeSchema` - Validar código promocional

**Beneficios**:
- ✅ Runtime type safety
- ✅ Errores de validación estructurados
- ✅ TypeScript inference automático
- ✅ Validación consistente en todas las rutas
- ✅ Mensajes de error claros para el frontend

### 3.3 Sistema de Procesamiento de Pagos (Stripe)

#### Flujo Completo de Pago

```
FASE 1: INICIALIZACIÓN
┌──────────────────────────────────────────────────────┐
│ Frontend                                             │
│ 1. Usuario selecciona tickets                       │
│ 2. Añade al carrito                                 │
│ 3. Click "Checkout"                                 │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
FASE 2: CREAR PAYMENT INTENT
┌──────────────────────────────────────────────────────┐
│ Frontend → Marketplace API                           │
│ POST /api/events/create-order                        │
│ Body: {                                              │
│   contactDetails: {...},                             │
│   orders: [{event, promoter, items: [...]}]         │
│ }                                                    │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ Marketplace API → Stripe API                         │
│ stripe.paymentIntents.create({                       │
│   amount: totalAmount * 100,  // En centavos        │
│   currency: 'eur',                                   │
│   capture_method: 'automatic'                        │
│ })                                                   │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ Backend Crea:                                        │
│ 1. Order document en MongoDB                         │
│    - paymentId: "pi_xxxxx"                          │
│    - status: PENDING                                 │
│    - items, contactDetails, etc.                     │
│                                                      │
│ 2. Retorna:                                          │
│    {                                                 │
│      paymentId: "pi_xxxxx",                         │
│      clientSecret: "pi_xxxxx_secret_xxxxx"          │
│    }                                                 │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
FASE 3: PROCESAR PAGO EN FRONTEND
┌──────────────────────────────────────────────────────┐
│ Frontend con Stripe Elements                         │
│                                                      │
│ const stripe = await loadStripe(publishableKey);    │
│                                                      │
│ <Elements stripe={stripe}                            │
│           options={{clientSecret}}>                  │
│   <PaymentElement />                                 │
│   <button onClick={handleSubmit}>Pay</button>        │
│ </Elements>                                          │
│                                                      │
│ handleSubmit():                                      │
│   stripe.confirmPayment({                            │
│     elements,                                        │
│     confirmParams: {                                 │
│       return_url: '/resume?paymentId=...'           │
│     }                                                │
│   })                                                 │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
FASE 4: WEBHOOK DE CONFIRMACIÓN
┌──────────────────────────────────────────────────────┐
│ Stripe → Marketplace API                             │
│ POST /stripe/webhook                                 │
│ Headers:                                             │
│   stripe-signature: t=...,v1=...                    │
│ Body:                                                │
│ {                                                    │
│   type: "payment_intent.succeeded",                 │
│   data: {                                            │
│     object: {                                        │
│       id: "pi_xxxxx",                               │
│       amount: 5000,                                  │
│       status: "succeeded"                            │
│     }                                                │
│   }                                                  │
│ }                                                    │
└────────────────┬─────────────────────────────────────┘
                 │
                 ▼
FASE 5: PROCESAR ORDEN
┌──────────────────────────────────────────────────────┐
│ Marketplace API procesa:                             │
│                                                      │
│ 1. Validar webhook signature                         │
│    stripe.webhooks.constructEvent(body, sig, secret)│
│                                                      │
│ 2. Buscar órdenes por paymentId                      │
│    const orders = await getOrdersByPaymentId(id);   │
│                                                      │
│ 3. Actualizar órdenes                                │
│    status: PENDING → SUCCEEDED                       │
│                                                      │
│ 4. Crear tickets (Sales)                             │
│    for cada item en order.items:                     │
│      - Crear Sale document                           │
│      - Generar QR code único                         │
│      - status: OPEN                                  │
│                                                      │
│ 5. Enviar email de confirmación (Bull queue)        │
│    mailQueue.add({                                   │
│      type: 'order-confirmation',                     │
│      order, tickets                                  │
│    })                                                │
│                                                      │
│ 6. Emitir evento WebSocket                           │
│    socket.emit('order-created', {...})              │
└──────────────────────────────────────────────────────┘
```

**Código del Webhook Handler** (Implementado):

```typescript
// stripe.controller.ts
@Post('/webhook')
@HttpCode(HttpStatus.OK)
async handleWebhook(@Req() req: Request, @Res() res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = this.stripeService.registerEvents(req.body, sig);
  } catch (err) {
    this.logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentIntentFailed(failedPayment);
        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Charge;
        await this.handleChargeRefunded(refund);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    this.logger.error(`Error handling webhook: ${err.message}`);
    res.status(500).send(`Webhook handler error: ${err.message}`);
  }
}
```

### 3.4 Sistema de Emails con Bull Queues

#### Arquitectura de Email System

**Componentes**:
- **MailService** (`mail.service.ts` - 1761 líneas)
- **Bull Queues** - 5 colas de email
- **Mail Processors** - Procesadores asíncronos
- **Templates HTML** - Inline en el código

**Colas de Email**:

```typescript
// Configuración de colas
BullModule.registerQueue(
  { name: 'new-account-mail' },
  { name: 'ticket-resale-mail' },
  { name: 'ticket-transfer-from-mail' },
  { name: 'ticket-transfer-to-mail' },
  { name: 'recover-account-mail' }
)
```

**Tipos de Emails** (9 implementados):

1. **Order Confirmation** - Confirmación de compra
2. **Resale Confirmation** - Ticket puesto en reventa
3. **Cancel Resale** - Reventa cancelada
4. **Ticket Sold** - Ticket vendido en mercado secundario
5. **Transfer From** - Email al que transfiere
6. **Transfer To** - Email al que recibe
7. **Invitation** - Invitación gratuita
8. **Account Created** - Nueva cuenta
9. **Password Recovery** - Recuperar contraseña

**Ejemplo de Procesador**:

```typescript
@Processor('ticket-resale-mail')
export class TicketResaleMailProcessor {
  constructor(private mailService: MailService) {}

  @Process()
  async handleResaleMail(job: Job<{ sale: Sale, price: number }>) {
    await this.mailService.sendResaleConfirmation(
      job.data.sale,
      job.data.price
    );
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing resale email for job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log(`Resale email sent! Job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed:`, err.message);
  }
}
```

**Ventajas del Sistema de Colas**:
- ✅ Procesamiento asíncrono (no bloquea requests)
- ✅ Reintentos automáticos si falla
- ✅ Concurrencia configurable
- ✅ Persistencia en Redis
- ✅ Monitoreo con Bull Board

---

## 4. FLUJOS DE DATOS CRÍTICOS

### 4.1 Flujo de Compra de Tickets (Completo)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: EXPLORACIÓN Y SELECCIÓN                            │
└─────────────────────────────────────────────────────────────┘

Usuario → Marketplace Frontend (localhost:3001)
├─ Home page (/)
│  ├─ Busca eventos por país/ciudad
│  ├─ Aplica filtros (venue, artist, genre, price)
│  └─ Click en evento
│
├─ Event Modal/Detail
│  ├─ Ve información del evento
│  ├─ Selecciona tipo de ticket (VIP, General, etc.)
│  ├─ Selecciona cantidad
│  └─ Click "Add to Cart"
│
└─ CartContext.addToCart()
   └─ localStorage.setItem('futura-cart', JSON.stringify(cart))

┌─────────────────────────────────────────────────────────────┐
│ PASO 2: CHECKOUT                                            │
└─────────────────────────────────────────────────────────────┘

Usuario → /cart
├─ Revisa items
├─ Puede aplicar Promo Code (sessionStorage)
└─ Click "Proceed to Checkout"

Usuario → /checkout
│
├─ STEP 1: Contact Information
│  ├─ Formulario: name, email, phone, birthdate
│  ├─ Validación con Zod (contactDetailsSchema)
│  └─ Submit → handleContactSubmit()
│
├─ API Call: POST /api/events/create-order
│  └─ Body: {
│       contactDetails: {...},
│       orders: [{
│         event: "event_id",
│         promoter: "promoter_id",
│         items: [{ type: "VIP", amount: 2, price: 50 }]
│       }]
│     }
│
├─ Marketplace API procesa:
│  ├─ Valida con createOrderSchema (Zod)
│  ├─ Calcula total (items + comisión + service fee)
│  ├─ Crea Payment Intent en Stripe
│  │  └─ stripe.paymentIntents.create({
│  │       amount: total * 100,
│  │       currency: 'eur'
│  │     })
│  │
│  ├─ Crea Order en MongoDB
│  │  └─ {
│  │       paymentId: "pi_xxxxx",
│  │       status: PENDING,
│  │       contactDetails, items, ...
│  │     }
│  │
│  └─ Retorna: { paymentId, clientSecret }
│
├─ Frontend guarda en sessionStorage:
│  ├─ futura-payment-id
│  ├─ futura-client-secret
│  └─ futura-order-items
│
└─ Muestra STEP 2: Payment Method

┌─────────────────────────────────────────────────────────────┐
│ PASO 3: PAGO CON STRIPE                                     │
└─────────────────────────────────────────────────────────────┘

Frontend carga Stripe Elements:
├─ const stripe = await loadStripe(publishableKey)
├─ <Elements stripe={stripe} options={{clientSecret}}>
│    <PaymentElement />
│  </Elements>
│
├─ Usuario ingresa datos de tarjeta
│  └─ Stripe Elements maneja validación
│
├─ Click "Pay Now"
│  └─ stripe.confirmPayment({
│       elements,
│       confirmParams: {
│         return_url: `/resume?paymentId=${paymentId}&amount=${total}`
│       }
│     })
│
├─ Stripe procesa pago
│  ├─ Valida tarjeta
│  ├─ Maneja 3D Secure si es necesario
│  └─ Cargo exitoso
│
└─ Stripe envía Webhook a API

┌─────────────────────────────────────────────────────────────┐
│ PASO 4: WEBHOOK Y PROCESAMIENTO                             │
└─────────────────────────────────────────────────────────────┘

Stripe → POST /stripe/webhook
├─ Headers: stripe-signature
├─ Body: {
│    type: "payment_intent.succeeded",
│    data: { object: { id: "pi_xxxxx", ... } }
│  }
│
API valida y procesa:
├─ stripe.webhooks.constructEvent(body, signature, secret)
├─ Busca órdenes: getOrdersByPaymentId(paymentId)
│
├─ Actualiza Orders:
│  └─ status: PENDING → SUCCEEDED
│
├─ Crea Sales (tickets):
│  └─ for each item in order.items:
│       ├─ Create Sale {
│       │    client, event, order, promoter,
│       │    type, price, status: OPEN
│       │  }
│       ├─ Generate QR code
│       │  └─ qrcode.toDataURL(sale._id)
│       └─ Save sale
│
├─ Envía email de confirmación:
│  └─ mailQueue.add('order-confirmation', {
│       order, sales, contactDetails
│     })
│
└─ Emite evento WebSocket:
   └─ socket.emit('order-created', { orderId, eventId })

┌─────────────────────────────────────────────────────────────┐
│ PASO 5: CONFIRMACIÓN Y ENTREGA                              │
└─────────────────────────────────────────────────────────────┘

Frontend redirige a /resume?paymentId=xxx&amount=xxx
├─ Carga orden: GET /api/orders/paymentId/${paymentId}
├─ Muestra resumen de compra
├─ Muestra botón "View Tickets"
└─ CartContext.clearCart()

Usuario puede ver tickets en /account?tab=tickets
├─ GET /api/orders/profile (con JWT)
├─ Muestra lista de órdenes con:
│  ├─ Imagen del evento
│  ├─ Nombre y fecha
│  ├─ Tickets con QR codes
│  └─ Opciones: Resell, Transfer
│
└─ QR codes listos para escanear en el evento
```

### 4.2 Flujo de Reventa (Mercado Secundario)

```
┌─────────────────────────────────────────────────────────────┐
│ USUARIO PONE TICKET EN REVENTA                              │
└─────────────────────────────────────────────────────────────┘

Usuario → /account?tab=tickets
├─ Ve sus tickets comprados
├─ Selecciona ticket con status: OPEN
├─ Click "Resell Ticket"
│
└─ Modal: ResellTicketModal
   ├─ Input: Precio de reventa
   ├─ Validación: precio <= event.resale.maxPrice
   ├─ Submit
   │
   └─ POST /api/resales/create
      ├─ Headers: Authorization: Bearer {token}
      ├─ Body: { saleId, resalePrice }
      └─ Validación: createResaleSchema (Zod)

API procesa:
├─ requireAuth(request) - Valida JWT
├─ Valida datos con Zod
│
├─ PATCH ${REFACTOR_RESALE_API}/user/events/resale
│  └─ Backend actualiza Sale:
│       ├─ resale.isResale = true
│       ├─ resale.resalePrice = resalePrice
│       ├─ resale.resaleDate = new Date()
│       └─ status: OPEN → SALE
│
├─ Envía email de confirmación:
│  └─ mailQueue.add('ticket-resale', { sale, price })
│
└─ Socket emit:
   └─ socket.emit('resale-created', { saleId, eventId })

┌─────────────────────────────────────────────────────────────┐
│ OTRO USUARIO COMPRA TICKET EN REVENTA                       │
└─────────────────────────────────────────────────────────────┘

Comprador → Event page
├─ Ve badge "Reventa disponible"
├─ GET /api/resales/${eventId}
│  └─ Retorna lista de sales con isResale: true
│
├─ Selecciona ticket en reventa
├─ Add to cart
│  └─ CartContext.addToCart({
│       ...ticket,
│       resaleId: sale._id,
│       price: resalePrice  // Precio de reventa
│     })
│
└─ Checkout normal (mismo flujo que compra primaria)
   pero con items en resaleItems[] en lugar de items[]

Webhook de Stripe procesa:
├─ Detecta que es reventa (por resaleItems[])
├─ Actualiza Sale original:
│  ├─ status: SALE → SOLD
│  ├─ isResale = false
│  └─ client = nuevo comprador
│
├─ Transfiere fondos al vendedor (TODO en código)
│
├─ Envía email al vendedor:
│  └─ "Your ticket was sold for €XX"
│
└─ Nuevo comprador recibe ticket normal
```

### 4.3 Flujo de Transferencia de Tickets

```
Usuario → /account → My Tickets
├─ Selecciona ticket
├─ Click "Transfer"
│
└─ Modal: TransferTicketModal
   ├─ Formulario:
   │  ├─ name, lastName
   │  ├─ email
   │  ├─ phone (optional)
   │  └─ birthdate (optional)
   │
   └─ Submit → POST /api/transfer
      ├─ Validación: transferTicketSchema (Zod)
      └─ Body: {
           saleId,
           transferTo: { name, lastName, email, ... }
         }

API procesa:
├─ requireAuth(request)
├─ Validación con Zod
│
├─ PATCH ${REFACTOR_RESALE_API}/user/events/transfer
│  └─ Backend:
│       ├─ Busca o crea Account para recipient
│       ├─ Crea nuevo Sale para recipient
│       ├─ Actualiza Sale original:
│       │  └─ status: OPEN → TRANSFERED
│       └─ Guarda historial de transferencia
│
├─ Envía 2 emails:
│  ├─ Email al sender:
│  │  └─ mailQueue.add('transfer-from', { sale, recipient })
│  └─ Email al recipient:
│     └─ mailQueue.add('transfer-to', { sale, sender, link })
│
└─ Socket emit:
   └─ socket.emit('ticket-transferred', { saleId, from, to })

Recipient recibe email:
├─ Link con JWT token para acceso
├─ Click link → Redirige a /account?token=xxx
└─ Ve nuevo ticket en su cuenta
```

---

## 5. INTEGRACIONES EXTERNAS

### 5.1 Stripe Integration

**Versión API**: 2024-11-20.acacia
**SDK**: stripe@17.4.0

**Configuración**:
```typescript
this.stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia"
});
```

**Payment Intent Creation**:
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  currency: 'eur',
  amount: totalAmount * 100,  // Convertir a centavos
  capture_method: 'automatic',
  automatic_payment_methods: {
    enabled: true  // Acepta tarjetas, wallets, etc
  }
});
```

**Webhook Signature Validation**:
```typescript
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
);
```

**Eventos Manejados**:
- ✅ `payment_intent.succeeded` - Pago exitoso
- ✅ `payment_intent.payment_failed` - Pago fallido
- ✅ `charge.refunded` - Reembolso procesado

### 5.2 Google OAuth

**Librería**: @react-oauth/google@0.12.1

**Flow**:
```typescript
// Frontend setup
<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>

// Login
const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    const result = await loginWithGoogle(tokenResponse.access_token);
    localStorage.setItem('auth_token', result.token);
    setUserData(result.user);
  }
});

// Backend validation
POST /accounts/login-google
Body: { accessToken }
→ Valida con Google APIs
→ Busca o crea Account
→ Genera JWT token
```

### 5.3 Azure Services

#### Azure Blob Storage

**Uso**: Almacenamiento de imágenes de eventos

```typescript
const imageUrl = `${process.env.BLOB_URL}/${event.image}`;
// Ejemplo: https://futurastorage.blob.core.windows.net/images/event-123.jpg
```

#### Azure Web PubSub

**Uso**: WebSockets escalables

```typescript
import { useAzureSocketIO } from '@azure/web-pubsub-socket.io';

const socket = new Server(443);
useAzureSocketIO(socket, {
  hub: 'Centro',
  connectionString: process.env.SOCKET_MARKETPLACE
});
```

### 5.4 MongoDB Atlas

**Versión**: 5.x
**Driver**: mongoose@8.4.3

**Conexión**:
```typescript
MongooseModule.forRoot(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
```

**Collections Principales**:
- `accounts` - Usuarios
- `events` - Eventos
- `orders` - Órdenes de compra
- `sales` - Tickets vendidos
- `promoters` - Organizadores
- `notifications` - Notificaciones

### 5.5 Redis (Bull Queues)

**Versión**: ioredis@5.4.1
**Bull**: 4.14.0
**BullMQ**: 5.8.3

**Configuración**:
```typescript
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379
  }
})
```

**Colas Activas**:
- `new-account-mail`
- `ticket-resale-mail`
- `ticket-transfer-from-mail`
- `ticket-transfer-to-mail`
- `recover-account-mail`
- `resale-ticket` (procesamiento - vacío)
- `transfer-ticket` (procesamiento - vacío)

---

## 6. SEGURIDAD Y AUTENTICACIÓN

### 6.1 JWT Token Structure

**Generación**:
```typescript
const token = jwt.sign(
  {
    id: account._id,
    email: account.email,
    role: account.role
  },
  JWT_SECRET_KEY,
  { expiresIn: '7d' }
);
```

**Validación en API Routes**:
```typescript
// Con helper requireAuth
const authResult = requireAuth(request);
if (authResult instanceof NextResponse) {
  return authResult; // 401 Unauthorized
}
const token = authResult;

// Header format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Validación de Inputs (Zod)

**Implementado en todas las rutas críticas**:

```typescript
// Ejemplo: Register
const validation = await validateRequest(request, registerCredentialsSchema);
if (!validation.success) {
  return validation.error; // 400 con detalles de validación
}

// Error response format
{
  "error": "Validation failed",
  "statusCode": 400,
  "details": {
    "validationErrors": [
      {
        "field": "password",
        "message": "Password must contain lowercase, uppercase, and number"
      }
    ]
  }
}
```

### 6.3 Stripe Webhook Security

**Validación de Firma**:
```typescript
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
);
// Si la firma no coincide, lanza error
```

**⚠️ Issues de Seguridad Pendientes**:

1. **Tokens en localStorage** (vulnerable a XSS)
   ```typescript
   // ❌ Actual
   localStorage.setItem('auth_token', token);

   // ✅ Recomendado
   // Usar httpOnly cookies en su lugar
   ```

2. **Password en email plaintext** (mail.service.ts)
   ```typescript
   // ❌ No enviar password en emails
   await sendAccountConfirmation(account, password);
   ```

3. **URL hardcoded** (verifyAccount en mail.service.ts:1720)
   ```typescript
   // ❌ URL de localhost en producción
   <a href="http://localhost:3002/">Verify account</a>
   ```

---

## 7. BASE DE DATOS Y MODELOS

### 7.1 Diagrama de Relaciones

```
┌─────────────┐
│  Promoter   │
└──────┬──────┘
       │ 1:N
       ├──────────────────┐
       │                  │
       ▼                  ▼
  ┌─────────┐      ┌──────────┐
  │  Event  │      │ Account  │
  └────┬────┘      └────┬─────┘
       │ 1:N           │ 1:N
       │               │
       ▼               ▼
  ┌─────────┐      ┌──────────┐
  │ Orders  │◄─────┤ Orders   │
  └────┬────┘      └──────────┘
       │ 1:N
       ▼
  ┌─────────┐
  │  Sales  │
  └─────────┘
```

### 7.2 Schemas Principales

#### Event Schema
```typescript
{
  _id: ObjectId,
  promoter: ObjectId (ref: Promoter),
  name: string,
  description: string,
  image: string,
  ticketImage: string,
  capacity: number,
  maxQuantity: number,
  commission: number,
  resale: {
    maxPrice: number,
    enabled: boolean,
    percentage: number
  },
  artists: [{
    name: string,
    image: string,
    genre: string
  }],
  location: {
    address: string,
    city: string,
    country: string,
    postalCode: string,
    venue: string,
    lat: number,
    lon: number
  },
  dateTime: {
    launchDate: Date,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date
  },
  tickets: [{
    type: string,      // "VIP", "General", etc.
    price: number,
    available: number
  }],
  ticketLots: [{
    name: string,
    startDate: Date,
    endDate: Date,
    tickets: [TicketType]
  }],
  status: EventStatus,  // CREATED, LAUNCHED, LIVE, CLOSED
  isBlockchain: boolean,
  url: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Schema
```typescript
{
  _id: ObjectId,
  account: ObjectId (ref: Account),
  event: ObjectId (ref: Event),
  promoter: ObjectId (ref: Promoter),
  items: [{
    sale: ObjectId,
    type: string,
    amount: number,
    price: number
  }],
  resaleItems: [{
    sale: ObjectId,
    type: string,
    amount: number,
    price: number
  }],
  sales: [ObjectId] (ref: Sales),
  paymentId: string,     // Stripe Payment Intent ID
  contactDetails: {
    name: string,
    lastName: string,
    email: string,
    phone: string,
    birthdate: Date
  },
  status: OrderStatus,    // PENDING, SUCCEEDED
  commission: number,
  couponCode: string,
  promoCode: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### Sale Schema (Tickets)
```typescript
{
  _id: ObjectId,
  client: ObjectId (ref: Account),
  event: ObjectId (ref: Event),
  order: ObjectId (ref: Order),
  promoter: ObjectId (ref: Promoter),
  tokenId: number,        // NFT Token ID (blockchain)
  type: string,
  price: number,
  resale: {
    resalePrice: number,
    resaleDate: Date
  },
  signature: string,      // Blockchain signature
  isResale: ObjectId,     // Ref a sale original
  isTransfer: ObjectId,   // Ref si es transferido
  isInvitation: boolean,
  blockNumber: number,
  hash: string,           // Transaction hash
  qrCode: string,         // QR único para validación
  history: [{
    activity: TicketActivity,
    reason: string,
    blockNumber: number,
    hash: string,
    from: { account, name, email },
    to: { account, name, email },
    status: TicketStatus,
    createdAt: Date
  }],
  status: TicketStatus,   // PENDING, OPEN, SALE, SOLD, TRANSFERED
  createdAt: Date,
  updatedAt: Date
}
```

#### Account Schema
```typescript
{
  _id: ObjectId,
  name: string,
  lastName: string,
  email: string (unique),
  password: string (hashed),
  birthdate: Date,
  phone: string,
  avatar: string,
  role: AccountRole,      // USER, PROMOTER, ADMIN, ACCESS
  registered: boolean,
  promoter: ObjectId (ref: Promoter),
  accessEvent: ObjectId (ref: Event),
  createdAt: Date,
  updatedAt: Date
}
```

### 7.3 Enums Importantes

```typescript
enum EventStatus {
  HOLD = "HOLD",
  CREATED = "CREATED",
  LAUNCHED = "LAUNCHED",
  LIVE = "LIVE",
  CLOSED = "CLOSED"
}

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

enum OrderStatus {
  PENDING = "PENDING",
  SUCCEEDED = "SUCCEEDED"
}
```

---

## 8. INFRAESTRUCTURA Y DEPLOYMENT

### 8.1 Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                  Google Cloud Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │   Cloud Run      │    │   Cloud Run      │             │
│  │   Marketplace    │    │   Admin Panel    │             │
│  │   Frontend       │    │   Frontend       │             │
│  │   (Port 3001)    │    │   (Port 3001)    │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
│  ┌──────────────────┐    ┌──────────────────┐             │
│  │   Cloud Run      │    │   Cloud Run      │             │
│  │   Marketplace    │    │   Admin API      │             │
│  │   API            │    │   (Port 3003)    │             │
│  │   (Port 3002)    │    │                  │             │
│  └──────────────────┘    └──────────────────┘             │
│                                                             │
│  ┌──────────────────┐                                      │
│  │   Cloud Run      │                                      │
│  │   Access API     │                                      │
│  │   (Port 3004)    │                                      │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
  ┌──────────────┐  ┌───────────┐  ┌──────────────┐
  │  MongoDB     │  │   Redis   │  │   Azure      │
  │  Atlas       │  │   Cloud   │  │   Services   │
  └──────────────┘  └───────────┘  └──────────────┘
```

### 8.2 Dockerfile Multi-Stage

**Marketplace API Example**:
```dockerfile
# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Stage 3: Builder
FROM base AS builder
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 4: Runner (Production)
FROM base AS runner
ENV NODE_ENV production
ENV PORT 3002

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nestjs
EXPOSE 3002
CMD ["node", "dist/main.js"]
```

### 8.3 Variables de Entorno (Por Servicio)

#### Marketplace Frontend (.env.local)
```bash
NEXT_PUBLIC_FUTURA_API=http://localhost:3002
NEXT_PUBLIC_FUTURA=http://localhost:3003
NEXT_PUBLIC_REFACTOR_RESALE_API=http://localhost:3003
NEXT_PUBLIC_BLOB_URL=https://futurastorage.blob.core.windows.net/images
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
```

#### Marketplace API (.env)
```bash
PORT=3002
NODE_ENV=production
MONGO_URL=mongodb+srv://admin:password@cluster.mongodb.net/futura-prod
JWT_SECRET_KEY=your-super-secret-jwt-key
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRIVATE_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_ENDPOINT_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=6379
REDIS_PASSWORD=xxxxxxxxxxxxxxx
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=noreply@futuratickets.com
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
BLOB_URL=https://futuratickets.blob.core.windows.net
SOCKET_MARKETPLACE=Endpoint=https://...;AccessKey=...;Version=1.0;
FUTURA_MARKET_PLACE=https://marketplace.futuratickets.com
```

#### Admin API (.env)
```bash
PORT=3003
MONGO_URL=mongodb+srv://admin:password@cluster.mongodb.net/futura-prod
JWT_SECRET_KEY=same-as-marketplace-api
AZURE_STORAGE_CONNECTION_STRING=...
BLOB_URL=...
```

### 8.4 Comandos de Deployment

#### Build Docker Images
```bash
# Marketplace API
cd futura-market-place-api
docker build -t gcr.io/PROJECT_ID/marketplace-api:latest .
docker push gcr.io/PROJECT_ID/marketplace-api:latest

# Marketplace Frontend
cd futura-market-place-v2
docker build -t gcr.io/PROJECT_ID/marketplace-frontend:latest .
docker push gcr.io/PROJECT_ID/marketplace-frontend:latest

# Admin API
cd futura-tickets-admin-api
docker build -t gcr.io/PROJECT_ID/admin-api:latest .
docker push gcr.io/PROJECT_ID/admin-api:latest

# Admin Frontend
cd futura-tickets-admin
docker build -t gcr.io/PROJECT_ID/admin-frontend:latest .
docker push gcr.io/PROJECT_ID/admin-frontend:latest
```

#### Deploy to Cloud Run
```bash
# Marketplace API
gcloud run deploy marketplace-api \
  --image gcr.io/PROJECT_ID/marketplace-api:latest \
  --platform managed \
  --region europe-west1 \
  --port 3002 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars MONGO_URL=$MONGO_URL,JWT_SECRET_KEY=$JWT_SECRET

# Marketplace Frontend
gcloud run deploy marketplace-frontend \
  --image gcr.io/PROJECT_ID/marketplace-frontend:latest \
  --platform managed \
  --region europe-west1 \
  --port 3001 \
  --allow-unauthenticated \
  --memory 512Mi \
  --set-env-vars NEXT_PUBLIC_FUTURA_API=https://api.futuratickets.com
```

### 8.5 Servicios Externos Requeridos

| Servicio | Propósito | Configuración Necesaria |
|----------|-----------|------------------------|
| **MongoDB Atlas** | Base de datos principal | Cluster M10+, IP Whitelist |
| **Redis Cloud** | Bull queues + cache | 256MB+, persistencia habilitada |
| **Stripe** | Procesamiento pagos | Live keys, webhooks configurados |
| **SendGrid** | Envío de emails | API key, dominio verificado |
| **Azure Blob Storage** | Almacenamiento imágenes | Storage account, container público |
| **Azure Web PubSub** | WebSockets escalables | Connection string, hub configurado |
| **Google OAuth** | Autenticación social | OAuth 2.0 Client ID configurado |

---

## 9. PRÓXIMOS PASOS Y MEJORAS RECOMENDADAS

### 9.1 Crítico (P0) 🔴

1. **Migrar tokens a httpOnly cookies**
   - Eliminar localStorage para auth tokens
   - Implementar cookie-based authentication
   - Actualizar todos los endpoints

2. **Completar Stripe Webhook Processing**
   - Implementar lógica completa de procesamiento
   - Generar QR codes
   - Crear sales/tickets
   - Enviar emails

3. **Implementar ResaleProcessor y TransferProcessor**
   - Completar lógica de Bull processors
   - Transferir fondos en reventa
   - Actualizar ownership

### 9.2 Alto (P1) 🟡

1. **Testing**
   - Unit tests para services
   - Integration tests para API routes
   - E2E tests para flujos críticos
   - Coverage mínimo 70%

2. **Blockchain Integration**
   - Mintear NFTs al crear tickets
   - Transferir NFTs en reventa
   - Verificar ownership on-chain

3. **Monitoring y Observability**
   - Integrar Sentry para error tracking
   - Logging estructurado con Winston/Pino
   - Métricas con Prometheus
   - Health checks

### 9.3 Medio (P2) 🟢

1. **Documentación API**
   - Configurar Swagger/OpenAPI
   - Documentar todos los endpoints
   - Generar Postman collection

2. **Performance**
   - Optimizar consultas MongoDB
   - Implementar caching con Redis
   - Code splitting en frontend
   - Lazy loading de componentes

3. **Refactoring**
   - Dividir mail.service.ts (1761 líneas)
   - Refactorizar componentes >10k líneas
   - Extraer lógica de negocio a servicios

---

## 10. CONTACTO Y RECURSOS

### Repositorios
- Marketplace Frontend: `futura-market-place-v2-main`
- Marketplace API: `futura-market-place-api-main`
- Admin Frontend: `futura-tickets-admin-main`
- Admin API: `futura-tickets-admin-api-main`
- Access API: `futura-access-api-main`

### Documentación Adicional
- `/CLAUDE.md` en cada repositorio
- `/RESUMEN_FINAL_COMPLETO.md` (resumen de trabajo previo)
- `/TAREAS_PRIORITARIAS.md` (roadmap)

### Credenciales de Prueba
- **Usuario Marketplace**: marketplace-test@futuratickets.com / Test123456
- **Admin**: (ver MongoDB directamente)

---

**Última Actualización**: 2025-01-14
**Autor**: Claude Code
**Versión**: 1.0
