# FUTURA MARKETPLACE API - Documentación Técnica Completa

> **Repositorio:** `futura-market-place-api-main`
> **Tipo:** Backend API (NestJS)
> **Propósito:** API principal del marketplace - Procesamiento de pagos, órdenes y gestión de tickets
> **Versión:** 0.0.1
> **Estado:** En desarrollo

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Módulos y Funcionalidades](#4-módulos-y-funcionalidades)
5. [Sistema de Pagos (Stripe)](#5-sistema-de-pagos-stripe)
6. [Sistema de Emails](#6-sistema-de-emails)
7. [Sistema de Colas (Bull)](#7-sistema-de-colas-bull)
8. [Modelos de Datos](#8-modelos-de-datos)
9. [API Endpoints](#9-api-endpoints)
10. [WebSockets y Tiempo Real](#10-websockets-y-tiempo-real)
11. [Integración Blockchain](#11-integración-blockchain)
12. [Configuración y Variables de Entorno](#12-configuración-y-variables-de-entorno)
13. [Deployment](#13-deployment)
14. [Dependencias con Otros Repositorios](#14-dependencias-con-otros-repositorios)
15. [Estado Actual del Proyecto](#15-estado-actual-del-proyecto)
16. [Tareas Pendientes](#16-tareas-pendientes)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito
**Futura Marketplace API** es el backend principal del marketplace de tickets de FuturaTickets. Gestiona el **procesamiento de pagos con Stripe**, **creación de órdenes**, **envío de emails transaccionales**, y **comunicación en tiempo real** con los clientes.

### 1.2 Responsabilidades Principales
- ✅ **Procesamiento de pagos** con Stripe Payment Intents
- ✅ **Gestión de órdenes** de compra de tickets
- ✅ **Sistema de emails transaccionales** (confirmaciones, transferencias, etc.)
- ✅ **Gestión de tickets/sales** (compra, reventa, transferencia)
- ✅ **WebSockets** para notificaciones en tiempo real
- ✅ **Integración blockchain** con ethers.js/viem
- ✅ **Sistema de colas** para procesamiento asíncrono (Bull/BullMQ)

### 1.3 Tecnologías Clave
| Categoría | Tecnología | Uso |
|-----------|------------|-----|
| **Pagos** | Stripe 17.4.0 | Payment Intents, Webhooks |
| **Emails** | NestJS Mailer + Bull | Templates HTML transaccionales |
| **Blockchain** | ethers 6.13.1, viem 2.20.0 | Interacción con smart contracts |
| **Colas** | Bull 4.14.0, BullMQ 5.8.3 | Procesamiento asíncrono |
| **WebSockets** | Socket.IO 4.7.5 + Azure PubSub | Notificaciones tiempo real |
| **Base de Datos** | MongoDB + Mongoose 8.4.3 | Persistencia |
| **Cache** | ioredis 5.4.1 | Redis para Bull queues |

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Stack Tecnológico

#### Backend Framework
- **NestJS 10.x** - Framework enterprise-grade
- **TypeScript 5.1.3** - Lenguaje tipado
- **Express 4.21.2** - Server HTTP

#### Procesamiento de Pagos
- **Stripe SDK 17.4.0** - Payment Intents API
- **Webhooks** para confirmación de pagos

#### Sistema de Emails
- **@nestjs-modules/mailer 2.0.2** - Wrapper de NodeMailer
- **EJS 3.1.10** - Engine de templates (aunque se usan inline HTML)
- **Bull queues** para envío asíncrono

#### Colas y Jobs
- **Bull 4.14.0** - Job queues basadas en Redis
- **BullMQ 5.8.3** - Versión moderna de Bull
- **ioredis 5.4.1** - Cliente Redis

#### Blockchain
- **ethers 6.13.1** - Librería Ethereum
- **viem 2.20.0** - TypeScript-first Ethereum
- **permissionless 0.2.0** - Account abstraction

#### Otros
- **qrcode 1.5.4** - Generación de códigos QR
- **Azure Storage** - Almacenamiento de archivos
- **@nestjs/schedule 5.0.1** - Cron jobs

### 2.2 Arquitectura de Microservicios

```
┌────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                      │
│   (Marketplace V2, Admin Panel, Mobile Apps)               │
└────────────────────┬───────────────────────────────────────┘
                     │ HTTP / WebSocket
                     ▼
┌────────────────────────────────────────────────────────────┐
│            FUTURA MARKETPLACE API (ESTE REPO)              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Orders     │  │   Stripe     │  │    Sales     │    │
│  │   Module     │  │   Module     │  │   Module     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│  ┌──────▼──────────────────▼──────────────────▼───────┐   │
│  │             MongoDB Database                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Mail      │  │   Socket     │  │   Event      │    │
│  │   Module     │  │   Module     │  │   Module     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
     ┌────▼────┐      ┌──────▼──────┐    ┌─────▼──────┐
     │  Redis  │      │   Azure     │    │ Blockchain │
     │  (Bull) │      │  Web PubSub │    │  Network   │
     └─────────┘      └─────────────┘    └────────────┘
          │
     ┌────▼────────┐
     │ Email SMTP  │
     │  Provider   │
     └─────────────┘
          │
     ┌────▼────────┐
     │   Stripe    │
     │  Payment    │
     │  Gateway    │
     └─────────────┘
```

### 2.3 Flujo de Compra de Tickets

```
┌────────────────────────────────────────────────────────────┐
│              TICKET PURCHASE FLOW                          │
└────────────────────────────────────────────────────────────┘

  Cliente              Frontend            API           Stripe
    │                     │                 │              │
    │  1. Selecciona      │                 │              │
    │     tickets         │                 │              │
    ├────────────────────►│                 │              │
    │                     │                 │              │
    │                     │ 2. Create       │              │
    │                     │    Payment      │              │
    │                     │    Intent       │              │
    │                     ├────────────────►│              │
    │                     │                 │ createPayment│
    │                     │                 │   Intent     │
    │                     │                 ├─────────────►│
    │                     │                 │              │
    │                     │                 │◄─────────────┤
    │                     │◄────────────────┤ Client Secret│
    │  3. Client Secret   │                 │              │
    │◄────────────────────┤                 │              │
    │                     │                 │              │
    │  4. Ingresa datos   │                 │              │
    │     de pago         │                 │              │
    │  (Stripe Elements)  │                 │              │
    ├─────────────────────┼─────────────────┼─────────────►│
    │                     │                 │   Confirm    │
    │                     │                 │   Payment    │
    │                     │                 │              │
    │◄────────────────────┼─────────────────┼──────────────┤
    │  Payment Success    │                 │   Webhook    │
    │                     │                 │◄─────────────┤
    │                     │                 │              │
    │                     │                 │ 5. Process   │
    │                     │                 │    Order     │
    │                     │                 ├──────┐       │
    │                     │                 │      │       │
    │                     │                 │ Create│       │
    │                     │                 │ Order │       │
    │                     │                 │ Sales │       │
    │                     │                 │ QR    │       │
    │                     │                 │◄──────┘       │
    │                     │                 │              │
    │                     │                 │ 6. Send      │
    │                     │                 │    Email     │
    │                     │                 ├──────►Queue  │
    │                     │                 │              │
    │  7. Email           │                 │              │
    │     Confirmación    │                 │              │
    │◄────────────────────┴─────────────────┴──────────────┘
    │
```

---

## 3. ESTRUCTURA DEL PROYECTO

### 3.1 Árbol de Directorios

```
futura-market-place-api-main/
├── src/
│   ├── Account/                     # Módulo de cuentas de usuario
│   │   ├── account.controller.ts    # Endpoints de cuentas
│   │   ├── account.interface.ts     # Interfaces TypeScript
│   │   ├── account.module.ts        # Módulo NestJS
│   │   ├── account.schema.ts        # Schema MongoDB
│   │   └── account.service.ts       # Lógica de negocio
│   ├── Auth/                        # Módulo de autenticación
│   │   ├── guards/
│   │   ├── services/
│   │   │   └── auth.service.ts      # Servicio JWT
│   │   ├── auth.decorator.ts        # Decorador @Auth
│   │   ├── auth.module.ts
│   │   └── jwt.strategy.ts          # Estrategia Passport
│   ├── Event/                       # Módulo de eventos
│   │   ├── event.controller.ts
│   │   ├── event.module.ts
│   │   ├── event.schema.ts          # Event, Invitation, Coupon, Promocode
│   │   ├── event.service.ts
│   │   └── promocode.service.ts
│   ├── Mail/                        # Sistema de emails
│   │   ├── mail.interface.ts
│   │   ├── mail.module.ts
│   │   ├── mail.processor.ts        # Bull processors para emails
│   │   └── mail.service.ts          # 9 tipos de emails (1761 líneas!)
│   ├── Notifications/               # Notificaciones
│   │   ├── notifications.controller.ts
│   │   ├── notifications.interface.ts
│   │   ├── notifications.module.ts
│   │   ├── notifications.schema.ts
│   │   └── notifications.service.ts
│   ├── Orders/                      # Gestión de órdenes
│   │   ├── orders.controller.ts     # Endpoints de órdenes
│   │   ├── orders.interface.ts
│   │   ├── orders.module.ts
│   │   ├── orders.processor.ts      # Procesadores Bull (resale, transfer)
│   │   ├── orders.schema.ts
│   │   └── orders.service.ts
│   ├── Promoter/                    # Promotores
│   │   ├── promoter.interface.ts
│   │   ├── promoter.module.ts
│   │   └── promoter.schema.ts
│   ├── Sales/                       # Gestión de tickets/ventas
│   │   ├── sales.controller.ts
│   │   ├── sales.interface.ts
│   │   ├── sales.module.ts
│   │   ├── sales.schema.ts
│   │   └── sales.service.ts
│   ├── Socket/                      # WebSockets
│   │   ├── socket.module.ts
│   │   └── socket.service.ts
│   ├── Stripe/                      # Integración Stripe
│   │   ├── stripe.controller.ts     # Endpoint config + webhooks
│   │   ├── stripe.module.ts
│   │   └── stripe.service.ts        # Payment Intents
│   ├── shared/                      # Código compartido
│   │   └── interface.ts             # Interfaces globales
│   ├── utils/                       # Utilidades
│   │   └── password.ts
│   ├── app.controller.ts
│   ├── app.module.ts                # Módulo raíz
│   ├── app.service.ts
│   └── main.ts                      # Punto de entrada
├── test/
│   └── app.e2e-spec.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### 3.2 Módulos Principales

| Módulo | Líneas | Responsabilidad |
|--------|--------|-----------------|
| **Mail** | 1761 | Sistema completo de emails transaccionales |
| **Account** | 371 | Gestión de usuarios y autenticación |
| **Event** | 347 | Eventos, coupons, promocodes |
| **Sales** | 237 | Tickets vendidos (compra, reventa, transferencia) |
| **Orders** | 127 | Órdenes de compra |
| **Stripe** | 44 | Procesamiento de pagos |
| **Socket** | 64 | Comunicación tiempo real |

---

## 4. MÓDULOS Y FUNCIONALIDADES

### 4.1 Orders Module (`src/Orders/`)

**Responsabilidad:** Gestión completa del ciclo de vida de órdenes de compra.

#### Funcionalidades

##### 1. Creación de Órdenes
```typescript
async createOrder(createOrder: CreateNewOrder): Promise<Order>
```

- Recibe detalles de compra (items, cliente, evento)
- Crea registro en MongoDB
- Asocia con Payment Intent de Stripe

##### 2. Consulta de Órdenes
```typescript
// Por cuenta de usuario
async getOrdersByAccount(account: string): Promise<Order[]>

// Por Payment ID (desde webhook Stripe)
async getOrdersByPaymentId(paymentId: string): Promise<Order[]>

// Órdenes del usuario autenticado
async getAccountOrders(accountId: string): Promise<Order[]>
```

##### 3. Actualización de Órdenes
```typescript
// Actualizar orden individual
async updateOrderById(orderId: string, updateOrder: UpdateOrder)

// Actualizar múltiples órdenes
async updateOrdersById(orders: string[], updateOrder: UpdateOrder)
```

##### 4. Validación de Cupones
```typescript
async getOrdersWithCoupon(couponCode): Promise<Order[]>
async getOrdersWithCouponCount(couponCode): Promise<number>
```

#### Schema: Orders
```typescript
{
  _id: ObjectId,
  account: ObjectId (ref: Account),
  event: ObjectId (ref: Event),
  promoter: ObjectId (ref: Promoter),
  items: Item[] {                    // Tickets primarios
    sale: ObjectId,
    type: string,
    amount: number,
    price: number
  },
  resaleItems: Item[],               // Tickets de reventa
  sales: [ObjectId] (ref: Sales),
  paymentId: string,                 // Stripe Payment Intent ID
  contactDetails: ContactDetails {
    name: string,
    lastName: string,
    email: string,
    phone: string
  },
  status: OrderStatus (PENDING | SUCCEEDED),
  commission: number,
  couponCode: string,                // Cupón aplicado
  promoCode: string,                 // Código promocional
  timestamps: true
}
```

#### Procesadores Bull (Background Jobs)

##### ResaleProcessor
```typescript
@Processor('resale-ticket')
export class ResaleProcessor {
  @Process({ concurrency: 10 })
  async transcode(job: Job<{ paymentId: string }>): Promise<void> {
    // TODO: Implementar lógica de reventa
  }
}
```

**Estado:** ⚠️ Vacío (solo comentarios)

##### TransferProcessor
```typescript
@Processor('transfer-ticket')
export class TransferProcessor {
  @Process({ concurrency: 10 })
  async transcode(job: Job<{ paymentId: string }>): Promise<void> {
    // TODO: Implementar lógica de transferencia
  }
}
```

**Estado:** ⚠️ Vacío (solo comentarios)

---

### 4.2 Stripe Module (`src/Stripe/`)

**Responsabilidad:** Integración completa con Stripe para procesamiento de pagos.

#### StripeService

##### Configuración
```typescript
constructor(configService: ConfigService) {
  this.stripePublicKey = configService.get('STRIPE_PUBLIC_KEY');
  this.stripeSecretKey = configService.get('STRIPE_PRIVATE_KEY');
  this.stripeEndpointSecret = configService.get('STRIPE_ENDPOINT_SECRET');

  this.stripe = new Stripe(this.stripeSecretKey, {
    apiVersion: "2024-11-20.acacia"
  });
}
```

##### Métodos

**1. Obtener Public Key**
```typescript
publishableKey(): string {
  return this.stripePublicKey;
}
```

**Uso:** Frontend necesita la public key para Stripe Elements

---

**2. Crear Payment Intent**
```typescript
async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
  return await this.stripe.paymentIntents.create({
    currency: 'eur',
    amount,                              // En centavos (€50 = 5000)
    capture_method: 'automatic',
    automatic_payment_methods: {
      enabled: true                      // Acepta tarjetas, wallets, etc
    }
  });
}
```

**Flujo:**
```
1. Frontend solicita Payment Intent con monto total
2. API crea Payment Intent en Stripe
3. Stripe retorna client_secret
4. Frontend usa client_secret en Stripe Elements
5. Usuario completa pago
6. Stripe envía webhook a API
7. API procesa orden
```

---

**3. Validar Webhooks**
```typescript
registerEvents(payload: Buffer, signature: string): Stripe.Event {
  return this.stripe.webhooks.constructEvent(
    payload,
    signature,
    this.stripeEndpointSecret
  );
}
```

**Seguridad:**
- Valida que el webhook viene de Stripe (firma HMAC)
- Previene ataques de replay
- Asegura integridad de datos

#### StripeController

**GET /stripe/config**
```typescript
@Get('/config')
getStripeConfig(): { config: string } {
  return { config: this.stripeService.publishableKey() };
}
```

**Respuesta:**
```json
{
  "config": "pk_live_xxxxxxxxxxxxxxxxxxxxx"
}
```

**Uso:** Frontend obtiene la public key al cargar

---

### 4.3 Sales Module (`src/Sales/`)

**Responsabilidad:** Gestión de tickets vendidos (sales), reventa y transferencias.

#### Funcionalidades Clave

##### 1. Consultar Ventas
```typescript
// Por evento (con paginación)
async getSalesByEventId(skip: number, limit: number, eventId: string)

// Por promotor
async getSales(promoter: string): Promise<Sale[]>

// Por cuenta de usuario
async getAccountSales(accountId: string): Promise<Sale[]>

// Tickets en reventa
async getEventResales(event: string): Promise<Sale[]>
```

##### 2. Crear Tickets
```typescript
// Crear ticket individual
async createSale(createSale: CreateSale): Promise<Sale>

// Crear múltiples tickets (orden completa)
async createSales(createSale: CreateSale[]): Promise<Sale[]>
```

##### 3. Actualizar Estado
```typescript
// Actualizar ticket individual
async updateSale(saleId: string, updateSale: UpdateSale)

// Actualizar todos los tickets de un evento (ej: marcar EXPIRED)
async updateSalesStatus(event: string, history: SaleHistory, status: TicketStatus)
```

##### 4. Validación de Acceso
```typescript
// Verificar estado de ticket para check-in
async checkTicketStatus(promoter: string, sale: string): Promise<Sale>
```

##### 5. Analytics
```typescript
// Total de ventas de un evento
async getEventSales(eventId: string): Promise<number>

// Ventas por tipo de ticket
async getEventSalesByType(eventId: string, type: string): Promise<number>

// Ventas de un usuario en un evento
async getEventSalesByAccount(account: string, eventId: string): Promise<number>
```

#### Schema: Sales
```typescript
{
  _id: ObjectId,
  client: ObjectId (ref: Account),
  event: ObjectId (ref: Event),
  order: ObjectId (ref: Order),
  promoter: ObjectId (ref: Promoter),
  tokenId: number,                   // NFT Token ID (si blockchain)
  type: string,                      // VIP, General, etc
  price: number,
  resale: Resale {                   // Si está en reventa
    resalePrice: number,
    resaleDate: Date
  },
  signature: string,                 // Firma blockchain
  isResale: ObjectId (ref: Sales),   // Ref a sale original
  isTransfer: ObjectId (ref: Sales), // Ref si es transferido
  isInvitation: boolean,
  blockNumber: number,
  hash: string,                      // Transaction hash
  qrCode: string,                    // QR único para validación
  history: SaleHistory[] {
    activity: TicketActivity,
    reason: string,
    blockNumber: number,
    hash: string,
    from: TransferAccount,
    to: TransferAccount,
    status: TicketStatus,
    createdAt: Date
  },
  status: TicketStatus (default: PENDING),
  timestamps: true
}
```

**Índices:**
```typescript
SalesSchema.index({ sales: 1 });   // Búsqueda rápida por sales
```

---

## 5. SISTEMA DE PAGOS (STRIPE)

### 5.1 Flujo Completo de Pago

#### Paso 1: Configuración Inicial
```typescript
// Frontend solicita public key
GET /stripe/config

Response:
{
  "config": "pk_live_xxxxx"
}
```

#### Paso 2: Crear Payment Intent
```typescript
// Frontend calcula total y solicita Payment Intent
const amount = totalPrice * 100;  // Convertir a centavos

POST /create-payment-intent  // (Este endpoint no está en el código actual)
{
  "amount": 5000,  // €50.00
  "eventId": "event_id",
  "items": [...]
}

Response:
{
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

#### Paso 3: Procesamiento en Frontend
```typescript
// Frontend usa Stripe Elements
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(publicKey);
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'Usuario' }
    }
  }
);
```

#### Paso 4: Webhook de Confirmación
```typescript
// Stripe envía webhook a /stripe/webhook
POST /stripe/webhook
Headers:
  stripe-signature: t=...,v1=...,v0=...
Body: (raw)
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxxxx",
      "amount": 5000,
      "status": "succeeded"
    }
  }
}

// API valida webhook
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  webhookSecret
);

// Procesar según tipo de evento
switch (event.type) {
  case 'payment_intent.succeeded':
    await processSuccessfulPayment(event.data.object);
    break;
  case 'payment_intent.payment_failed':
    await handleFailedPayment(event.data.object);
    break;
}
```

#### Paso 5: Procesamiento de Orden
```typescript
async function processSuccessfulPayment(paymentIntent) {
  // 1. Buscar órdenes por paymentId
  const orders = await ordersService.getOrdersByPaymentId(paymentIntent.id);

  // 2. Actualizar estado de órdenes
  await ordersService.updateOrdersById(
    orders.map(o => o._id),
    { status: OrderStatus.SUCCEEDED }
  );

  // 3. Crear tickets (sales)
  for (const order of orders) {
    const sales = await createTicketsForOrder(order);

    // 4. Generar QR codes
    for (const sale of sales) {
      sale.qrCode = await qrcode.toDataURL(sale._id);
    }

    // 5. Enviar email de confirmación
    await mailService.sendOrderConfirmation(order);
  }
}
```

### 5.2 Webhooks de Stripe

#### Eventos Soportados
| Evento | Acción |
|--------|--------|
| `payment_intent.succeeded` | Procesar orden, crear tickets, enviar email |
| `payment_intent.payment_failed` | Marcar orden como fallida, notificar usuario |
| `charge.refunded` | Procesar reembolso, cancelar tickets |
| `customer.subscription.created` | (Si aplica) Gestionar subscripciones |

#### Validación de Webhooks
```typescript
try {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    webhookSecret
  );

  // Evento válido, procesar
} catch (err) {
  console.log('⚠️  Webhook signature verification failed.');
  return res.status(400).send(`Webhook Error: ${err.message}`);
}
```

### 5.3 Manejo de Errores

#### Errores Comunes
```typescript
// Pago rechazado
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "decline_code": "insufficient_funds"
  }
}

// Tarjeta expirada
{
  "error": {
    "type": "card_error",
    "code": "expired_card"
  }
}

// Autenticación 3D Secure requerida
{
  "error": {
    "type": "card_error",
    "code": "authentication_required"
  }
}
```

---

## 6. SISTEMA DE EMAILS

### 6.1 Mail Service (`src/Mail/mail.service.ts`)

**Archivo más grande del proyecto:** 1761 líneas

#### Configuración
```typescript
constructor(
  private mailerService: MailerService,
  private authService: AuthService,
  @InjectQueue('new-account-mail') private newAccountMailQueue: Queue,
  @InjectQueue('ticket-resale-mail') private ticketResaleQueue: Queue,
  @InjectQueue('ticket-transfer-from-mail') private ticketTransferFromMailQueue: Queue,
  @InjectQueue('ticket-transfer-to-mail') private ticketTransferToMailQueue: Queue,
  @InjectQueue('recover-account-mail') private recoverAccountMailQueue: Queue
) {
  this.blobUrl = configService.get('BLOB_URL');
  this.marketPlaceUrl = configService.get('FUTURA_MARKET_PLACE');
}
```

### 6.2 Tipos de Emails

#### 1. Confirmación de Orden (`sendOrderConfirmation`)

**Disparado cuando:** Pago exitoso

**Template:**
```html
<!doctype html>
<html>
  <head>
    <title>Futura Tickets - Order Confirmation</title>
    <style>
      /* 180 líneas de CSS inline */
    </style>
  </head>
  <body>
    <table class="main">
      <tr>
        <td class="image">
          <img src="${BLOB_URL}/${event.image}"/>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h1>${event.name}</h1>
          <p>Your order has been processed correctly!</p>

          <!-- Tabla de items -->
          <table class="order">
            ${orders}  <!-- Loop de tickets -->
          </table>

          <table class="order-total">
            <tr>
              <td>Total Amount:</td>
              <td>${totalAmount} EUR</td>
            </tr>
          </table>

          <a href="${marketPlaceUrl}/account?token=${JWT}"
             class="check-tickets-btn">
            Check Tickets
          </a>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <!-- Logo y contacto -->
        </td>
      </tr>
    </table>
  </body>
</html>
```

**Datos incluidos:**
- Imagen del evento
- Nombre del evento
- Lista de tickets con tipo y precio
- Total con comisión aplicada
- Link autenticado para ver tickets

---

#### 2. Confirmación de Reventa (`sendResaleConfirmation`)

**Disparado cuando:** Usuario pone ticket en reventa

**Contenido:**
```
Subject: Futura Tickets - Resale Confirmation #${tokenId}

Body:
- Imagen del evento
- "Your ticket #${tokenId} was correctly placed for resale"
- Precio de reventa: ${price} EUR
- Link a cuenta
```

---

#### 3. Cancelación de Reventa (`sendCancelResaleConfirmation`)

**Disparado cuando:** Usuario cancela reventa

**Contenido:**
```
Subject: Futura Tickets - Resale Confirmation #${tokenId}

Body:
- "Your ticket ${tokenId} was canceled for resale"
- Link a cuenta
```

---

#### 4. Ticket Vendido (`sendTicketSoldConfirmation`)

**Disparado cuando:** Ticket en reventa se vende

**Contenido:**
```
Subject: Futura Tickets - Ticket sold

Body:
- "Your ticket #${tokenId} was sold correctly"
- "You will receive your funds soon"
- Link a cuenta
```

---

#### 5. Transferencia - Origen (`sendTransferFromConfirmation`)

**Disparado cuando:** Usuario transfiere ticket

**Contenido:**
```
Subject: Futura Tickets - Ticket Transfer

Body:
- "Your ticket #${tokenId} has been transfered to ${email}"
- Link a cuenta
```

---

#### 6. Transferencia - Destino (`sendTransferToConfirmation`)

**Disparado cuando:** Usuario recibe ticket transferido

**Contenido:**
```
Subject: Futura Tickets - Ticket Transfer

Body:
- "You have received a new ticket from ${senderEmail}"
- Tipo de ticket y precio
- Link para ver ticket
```

---

#### 7. Confirmación de Invitación (`sendInvitationToConfirmation`)

**Disparado cuando:** Usuario recibe invitación gratuita

**Contenido:**
```
Subject: Futura Tickets - New Invitation ${orderId}

Body:
- "Your invitation has been processed correctly!"
- Lista de tickets
- Total Amount: 0 EUR
- Link para ver tickets
```

---

#### 8. Confirmación de Cuenta (`sendAccountConfirmation`)

**Disparado cuando:** Nueva cuenta creada

**Contenido:**
```
Subject: Futura Tickets - Account Confirmation

Body:
- User: ${email}
- Password: ${password}  ⚠️ Password en plaintext!
- Link a cuenta
```

**⚠️ SEGURIDAD:** Enviar password en email es una mala práctica

---

#### 9. Recuperar Cuenta (`sendRecoverAccount`)

**Disparado cuando:** Usuario solicita recuperación

**Contenido:**
```
Subject: Futura Tickets - Recover your account

Body:
- "Click on the link to recover your account"
- Link: ${marketPlaceUrl}/recover-account?token=${JWT}
```

---

#### 10. Verificar Cuenta (`verifyAccount`)

**Disparado cuando:** Verificación de email

**Contenido:**
```
Subject: Futura Tickets - Verify your account

Body:
- "Click on the link to verify your account"
- Link: http://localhost:3002/  ⚠️ HARDCODED!
```

**⚠️ BUG:** URL hardcoded a localhost

---

### 6.3 Sistema de Colas de Email

#### Procesadores Bull
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

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log('Resale email sent!');
  }
}
```

#### Añadir a Cola
```typescript
await mailService.addTicketResaleMailQueue(sale, price);
```

**Ventajas:**
- ✅ Procesamiento asíncrono (no bloquea request)
- ✅ Reintentos automáticos si falla
- ✅ Concurrencia configurable
- ✅ Monitoreo con Bull Board (si está configurado)

---

## 7. SISTEMA DE COLAS (BULL)

### 7.1 Configuración

**Redis requerido:**
```typescript
import { BullModule } from '@nestjs/bull';

BullModule.registerQueue({
  name: 'ticket-resale-mail',
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379
  }
})
```

### 7.2 Colas Definidas

| Queue Name | Propósito | Concurrency |
|------------|-----------|-------------|
| `new-account-mail` | Envío de confirmación de cuenta | - |
| `ticket-resale-mail` | Email de confirmación de reventa | - |
| `ticket-transfer-from-mail` | Email a quien transfiere | - |
| `ticket-transfer-to-mail` | Email a quien recibe | - |
| `recover-account-mail` | Email de recuperación | - |
| `resale-ticket` | Procesamiento de reventa (vacío) | 10 |
| `transfer-ticket` | Procesamiento de transferencia (vacío) | 10 |

### 7.3 Jobs y Procesadores

#### Ejemplo: Transfer From Email
```typescript
// Añadir job a la cola
async addTicketTransferFromMailQueue(
  transferFromEmail: TransferFromEmail
): Promise<Job> {
  return this.ticketTransferFromMailQueue.add({ transferFromEmail });
}

// Processor
@Processor('ticket-transfer-from-mail')
export class TransferFromMailProcessor {
  constructor(private mailService: MailService) {}

  @Process()
  async handleTransferFrom(job: Job<{ transferFromEmail }>) {
    await this.mailService.sendTransferFromConfirmation(
      job.data.transferFromEmail
    );
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing transfer-from email for job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(`Transfer-from email sent! Job ${job.id}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed:`, err.message);
  }
}
```

---

## 8. MODELOS DE DATOS

### 8.1 Relaciones Entre Schemas

```
┌────────────┐
│  Promoter  │
└──────┬─────┘
       │ 1:N
       ├──────────────────────┐
       │                      │
       ▼                      ▼
  ┌─────────┐           ┌──────────┐
  │  Event  │           │ Account  │
  └────┬────┘           └────┬─────┘
       │ 1:N                 │ 1:N
       │                     │
       ▼                     ▼
  ┌─────────┐           ┌──────────┐
  │ Orders  │◄──────────┤ Orders   │
  └────┬────┘           └──────────┘
       │ 1:N
       ▼
  ┌─────────┐
  │  Sales  │
  └─────────┘
```

### 8.2 Interfaces Compartidas (`src/shared/interface.ts`)

#### Event
```typescript
interface Event {
  _id: string;
  promoter: string;
  name: string;
  description: string;
  image: string;
  capacity: number;
  commission: number;
  resale: Resale;
  artists: Artist[];
  location: Location {
    address: string;
    city: string;
    country: string;
    postalCode: string;
    venue: string;
    lat: number;
    lon: number;
  };
  dateTime: DateTime {
    launchDate: Date;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
  };
  conditions: Condition[];
  isBlockchain: boolean;
  address: string;           // Smart contract address
  blockNumber: number;
  hash: string;
  url: string;
  orders: string[];
  status: EventStatus;
  tickets: Ticket[];
  maxQuantity: number;
  availableTickets: number;
}
```

#### Enums Clave
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
```

---

## 9. API ENDPOINTS

### 9.1 Orders Endpoints

#### GET /orders/config
**Descripción:** Obtener Stripe public key

**Auth:** No requiere

**Response:**
```json
{
  "config": "pk_live_xxxxx"
}
```

---

#### GET /orders/paymentId/:paymentId
**Descripción:** Obtener órdenes por Payment Intent ID

**Auth:** No requiere (usado por webhooks)

**Response:**
```json
[
  {
    "_id": "order_id_1",
    "account": {...},
    "event": {...},
    "sales": [...],
    "paymentId": "pi_xxxxx",
    "status": "SUCCEEDED"
  }
]
```

---

#### GET /orders/profile
**Descripción:** Obtener órdenes del usuario autenticado

**Auth:** USER role (via @Auth decorator)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "_id": "order_1",
    "event": {
      "name": "Concierto Rock 2025",
      "image": "event.jpg",
      "dateTime": {...}
    },
    "sales": [
      {
        "_id": "sale_1",
        "qrCode": "data:image/png;base64,...",
        "status": "OPEN",
        "tokenId": 123
      }
    ],
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

---

### 9.2 Stripe Endpoints

#### GET /stripe/config
**Descripción:** Obtener Stripe publishable key

**Response:**
```json
{
  "config": "pk_live_xxxxx"
}
```

---

## 10. WEBSOCKETS Y TIEMPO REAL

### 10.1 Socket Module (`src/Socket/`)

**Responsabilidad:** Notificaciones en tiempo real para actualizaciones de órdenes.

#### Configuración
```typescript
import { Server } from 'socket.io';
import { useAzureSocketIO } from '@azure/web-pubsub-socket.io';

export class SocketService {
  public socket = new Server(443, {
    pingTimeout: 10000
  });

  constructor(configService: ConfigService) {
    const socketEndpoint = configService.get('SOCKET_MARKETPLACE');

    useAzureSocketIO(this.socket, {
      hub: 'Centro',
      connectionString: socketEndpoint
    });
  }
}
```

#### Eventos Emitidos

**order.created** - Nueva orden creada
**order.updated** - Orden actualizada
**ticket.sold** - Ticket vendido en mercado secundario
**ticket.transferred** - Ticket transferido

---

## 11. INTEGRACIÓN BLOCKCHAIN

### 11.1 Librerías Instaladas

```json
{
  "ethers": "^6.13.1",          // Librería completa Ethereum
  "viem": "^2.20.0",            // TypeScript-first Ethereum
  "permissionless": "^0.2.0"    // Account abstraction
}
```

### 11.2 Uso Potencial

**⚠️ NOTA:** El código actual NO usa estas librerías activamente

**Casos de uso planeados:**
1. **Mintear NFTs** de tickets al completar pago
2. **Transferir NFTs** al revender o transferir
3. **Verificar ownership** on-chain antes de validar acceso
4. **Quemar NFTs** al hacer check-in (opcional)

---

## 12. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### 12.1 Variables Requeridas

```bash
# Application
PORT=3000
NODE_ENV=production

# Database
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/futuratickets

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PRIVATE_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_ENDPOINT_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Redis (Bull queues)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=noreply@futuratickets.com

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
BLOB_URL=https://futuratickets.blob.core.windows.net

# WebSocket
SOCKET_MARKETPLACE=Endpoint=https://...;AccessKey=...;Version=1.0;

# Frontend URLs
FUTURA_MARKET_PLACE=https://marketplace.futuratickets.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 12.2 Archivo .env.example
```bash
PORT=3000
MONGO_URL=mongodb://localhost:27017/futuratickets
JWT_SECRET_KEY=dev-secret-key
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_PRIVATE_KEY=sk_test_...
STRIPE_ENDPOINT_SECRET=whsec_...
REDIS_HOST=localhost
REDIS_PORT=6379
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASSWORD=
BLOB_URL=http://localhost:10000
SOCKET_MARKETPLACE=
FUTURA_MARKET_PLACE=http://localhost:3001
```

---

## 13. DEPLOYMENT

### 13.1 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

# RUN npm install --force && npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Nota:** Build comentado, se asume pre-build

### 13.2 Scripts npm

```json
{
  "start:prod": "node dist/main",
  "build": "nest build",
  "start:dev": "nest start --watch"
}
```

### 13.3 Servicios Externos Requeridos

1. **MongoDB Atlas** - Base de datos
2. **Redis Cloud** - Para Bull queues
3. **Stripe** - Procesamiento de pagos
4. **SendGrid / SMTP** - Envío de emails
5. **Azure Web PubSub** - WebSockets escalables
6. **Azure Blob Storage** - Almacenamiento de imágenes

---

## 14. DEPENDENCIAS CON OTROS REPOSITORIOS

### 14.1 Diagrama de Dependencias

```
┌───────────────────────────────┐
│  futura-market-place-v2-main  │  ──►  Consume esta API
│  (Frontend Next.js)           │       (Checkout, payments)
└───────────────────────────────┘

┌───────────────────────────────┐
│  futura-tickets-admin-main    │  ──►  Consume esta API
│  (Admin Panel)                │       (Gestión órdenes)
└───────────────────────────────┘

┌───────────────────────────────┐
│  futura-tickets-smartcontracts│  ◄──  Interactúa con
│  (Smart Contracts)            │       (Mintear NFTs)
└───────────────────────────────┘

┌───────────────────────────────┐
│  futura-access-api-main       │  ──►  Lee datos de
│  (Access Control)             │       (Sales para validación)
└───────────────────────────────┘
```

### 14.2 APIs Que Consumen Este Servicio

1. **futura-market-place-v2** (Frontend)
   - `/orders/config` - Obtener Stripe key
   - `/orders/profile` - Ver órdenes del usuario
   - WebSocket connection - Actualizaciones en vivo

2. **futura-tickets-admin** (Admin Panel)
   - `/orders/paymentId/:id` - Consultar órdenes
   - Sales endpoints - Ver todas las ventas

---

## 15. ESTADO ACTUAL DEL PROYECTO

### 15.1 Funcionalidades Implementadas ✅

#### Stripe Integration
- ✅ Crear Payment Intents
- ✅ Obtener publishable key
- ✅ Validar webhooks
- ✅ API versión 2024-11-20

#### Orders Management
- ✅ Crear órdenes
- ✅ Consultar órdenes por usuario
- ✅ Consultar por Payment ID
- ✅ Actualización de estado
- ✅ Validación de cupones

#### Sales Management
- ✅ Crear tickets (sales)
- ✅ Consultar por evento/usuario/promotor
- ✅ Tickets en reventa (getEventResales)
- ✅ Analytics de ventas
- ✅ Paginación en consultas

#### Email System
- ✅ 9 tipos diferentes de emails
- ✅ Templates HTML inline completos
- ✅ Sistema de colas con Bull
- ✅ Tokens JWT en links de email
- ✅ Logo y branding en emails

#### WebSockets
- ✅ Integración Azure Web PubSub
- ✅ Servidor Socket.IO configurado
- ✅ Hub "Centro" configurado

### 15.2 Funcionalidades Parciales ⚠️

#### Bull Processors
- ⚠️ `ResaleProcessor` - Definido pero vacío
- ⚠️ `TransferProcessor` - Definido pero vacío
- ⚠️ Solo los processors de email están implementados

#### Blockchain Integration
- ⚠️ Librerías instaladas (ethers, viem)
- ⚠️ NO hay código que las use
- ⚠️ Campos blockchain en schemas (tokenId, hash) no se populan

#### WebSocket Events
- ⚠️ Servicio configurado
- ⚠️ NO hay eventos emitidos en el código actual
- ⚠️ Falta `emitOrderCreated()` y similares

### 15.3 Funcionalidades Faltantes ❌

#### Testing
- ❌ 0% test coverage
- ❌ Solo archivo E2E base sin tests

#### Payment Webhooks
- ❌ No hay controller/endpoint para webhooks Stripe
- ❌ No hay procesamiento de `payment_intent.succeeded`
- ❌ No hay manejo de `charge.refunded`

#### Blockchain
- ❌ No hay minteo de NFTs
- ❌ No hay transferencias on-chain
- ❌ No hay verificación de ownership

#### API Documentation
- ❌ Swagger no configurado
- ❌ No hay OpenAPI spec
- ❌ No hay Postman collection

#### Security
- ❌ Passwords en plaintext en emails (sendAccountConfirmation)
- ❌ URL hardcoded a localhost (verifyAccount)
- ❌ No hay validación de inputs
- ❌ No hay rate limiting específico por endpoint

#### Monitoring
- ❌ No hay logging estructurado
- ❌ No hay error tracking (Sentry)
- ❌ No hay métricas

---

## 16. TAREAS PENDIENTES

### 16.1 Prioridad Crítica 🔴

#### Stripe Webhooks
- [ ] **Crear endpoint para webhooks**
  ```typescript
  @Post('/stripe/webhook')
  async handleWebhook(@Req() req, @Res() res) {
    const sig = req.headers['stripe-signature'];
    const event = stripeService.registerEvents(req.rawBody, sig);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await processSuccessfulPayment(event.data.object);
        break;
    }

    res.status(200).send();
  }
  ```

- [ ] **Procesar payment_intent.succeeded**
  - Buscar órdenes por paymentId
  - Actualizar status a SUCCEEDED
  - Crear tickets (sales)
  - Generar QR codes
  - Enviar email confirmación

#### Security Fixes
- [ ] **FIX: Password en email plaintext**
  ```typescript
  // ❌ ACTUAL
  sendAccountConfirmation(account, password)  // Password visible

  // ✅ DEBERÍA SER
  sendAccountConfirmation(account)  // Sin password
  // Usar reset password flow en su lugar
  ```

- [ ] **FIX: URL hardcoded**
  ```typescript
  // ❌ ACTUAL (mail.service.ts:1720)
  <a href="http://localhost:3002/">Verify account</a>

  // ✅ DEBERÍA SER
  <a href="${this.marketPlaceUrl}/verify?token=${token}">Verify account</a>
  ```

#### Bull Processors
- [ ] **Implementar ResaleProcessor**
  - Procesar pago de reventa
  - Transferir fondos a vendedor
  - Actualizar ownership del ticket
  - Emitir eventos

- [ ] **Implementar TransferProcessor**
  - Validar transferencia
  - Actualizar cliente del ticket
  - Enviar emails a ambas partes

---

### 16.2 Prioridad Alta 🟡

#### Blockchain Integration
- [ ] **Mintear NFTs al crear tickets**
  ```typescript
  import { ethers } from 'ethers';

  async function mintTicketNFT(sale: Sale, event: Event) {
    const contract = new ethers.Contract(
      event.address,
      ABI,
      signer
    );

    const tx = await contract.mint(
      sale.client.address,
      sale._id,
      tokenURI
    );

    await tx.wait();

    // Actualizar sale con tokenId y hash
    await salesService.updateSale(sale._id, {
      tokenId: tx.events[0].args.tokenId,
      hash: tx.hash,
      blockNumber: tx.blockNumber
    });
  }
  ```

- [ ] **Transferir NFTs en reventa**
- [ ] **Quemar NFTs al hacer check-in** (opcional)

#### WebSocket Events
- [ ] **Emitir evento order.created**
  ```typescript
  socketService.emitOrderCreated(promoter, {
    orderId: order._id,
    event: order.event,
    items: order.items,
    total: calculateTotal(order)
  });
  ```

- [ ] **Emitir ticket.sold** (mercado secundario)
- [ ] **Emitir ticket.transferred**

#### Testing
- [ ] **Tests unitarios** de servicios
- [ ] **Tests de integración** con Stripe Test Mode
- [ ] **Tests E2E** del flujo completo de compra
- [ ] **Coverage mínimo 70%**

---

### 16.3 Prioridad Media 🟢

#### API Documentation
- [ ] **Configurar Swagger**
  ```typescript
  import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

  const config = new DocumentBuilder()
    .setTitle('Futura Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  ```

- [ ] **Documentar todos los endpoints**
- [ ] **Generar Postman collection**

#### Monitoring
- [ ] **Integrar Sentry** para error tracking
- [ ] **Logging estructurado** con Winston/Pino
- [ ] **Métricas con Prometheus**
- [ ] **Health checks** (`/health`, `/ready`)

#### Performance
- [ ] **Optimizar consultas MongoDB**
  - Añadir índices faltantes
  - Usar lean() en queries de solo lectura
- [ ] **Caching con Redis**
  - Cache de eventos
  - Cache de configuración Stripe
- [ ] **Paginación** en todos los listados

---

### 16.4 Roadmap

#### Fase 1: Webhooks & Security (1 semana)
1. Implementar endpoint de webhooks Stripe
2. Procesar pagos exitosos
3. Fixes de seguridad (passwords, URLs)
4. Testing básico

#### Fase 2: Blockchain (2 semanas)
1. Mintear NFTs al crear tickets
2. Transferencias on-chain
3. Verificación de ownership

#### Fase 3: Processors (1 semana)
1. Implementar ResaleProcessor
2. Implementar TransferProcessor
3. Testing de colas

#### Fase 4: Observability (1 semana)
1. Swagger documentation
2. Logging estructurado
3. Error tracking
4. Métricas

---

**FIN DEL DOCUMENTO**
