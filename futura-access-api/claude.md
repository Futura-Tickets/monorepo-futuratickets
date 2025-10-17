# FUTURA ACCESS API - Documentación Técnica Completa

> **Repositorio:** `futura-access-api-main`
> **Tipo:** Backend API (NestJS)
> **Propósito:** Sistema de control de acceso y validación de tickets para eventos
> **Versión:** 0.0.1
> **Estado:** En desarrollo

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Módulos y Funcionalidades](#4-módulos-y-funcionalidades)
5. [Modelos de Datos (Schemas MongoDB)](#5-modelos-de-datos-schemas-mongodb)
6. [API Endpoints](#6-api-endpoints)
7. [Autenticación y Autorización](#7-autenticación-y-autorización)
8. [Integraciones Externas](#8-integraciones-externas)
9. [Configuración y Variables de Entorno](#9-configuración-y-variables-de-entorno)
10. [Deployment y Containerización](#10-deployment-y-containerización)
11. [Dependencias con Otros Repositorios](#11-dependencias-con-otros-repositorios)
12. [Estado Actual del Proyecto](#12-estado-actual-del-proyecto)
13. [Tareas Pendientes y Próximos Pasos](#13-tareas-pendientes-y-próximos-pasos)
14. [Diagramas y Visualizaciones](#14-diagramas-y-visualizaciones)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito
**Futura Access API** es un microservicio backend construido con NestJS que gestiona el **sistema de control de acceso y validación de tickets** para eventos en la plataforma FuturaTickets. Este servicio permite a los promotores y personal de acceso validar tickets mediante códigos QR, gestionar el check-in de asistentes, y monitorear en tiempo real las validaciones de acceso.

### 1.2 Responsabilidades Principales
- ✅ **Validación de tickets** mediante QR y base de datos
- ✅ **Control de acceso** a eventos (check-in/check-out)
- ✅ **Gestión de personal de acceso** (cuentas tipo ACCESS)
- ✅ **Monitoreo en tiempo real** de accesos vía WebSockets
- ✅ **Gestión de promocodes** e invitaciones
- ✅ **Notificaciones** de eventos de acceso
- ✅ **Auditoría** de accesos con historial completo

### 1.3 Usuarios del Sistema
| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ACCESS** | Personal de control de acceso en eventos | Validar tickets, ver asistentes del evento asignado |
| **PROMOTER** | Organizadores de eventos | Gestionar eventos, ver analytics, configurar promocodes |
| **ADMIN** | Administradores del sistema | Acceso completo |

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Stack Tecnológico

#### Backend Framework
- **NestJS 11.0.1** - Framework Node.js enterprise-grade
- **TypeScript 5.7.3** - Lenguaje tipado
- **Node.js 20** (Alpine) - Runtime

#### Base de Datos
- **MongoDB** (vía Mongoose) - Base de datos NoSQL
- **Mongoose 11.x** - ODM para MongoDB

#### Autenticación
- **Passport JWT** - Estrategia de autenticación
- **@nestjs/jwt** - Manejo de tokens JWT
- **bcryptjs** - Hashing de contraseñas

#### Comunicación en Tiempo Real
- **Socket.IO 4.8.1** - WebSockets bidireccionales
- **Azure Web PubSub** - Servicio de WebSocket escalable en Azure

#### Seguridad y Rate Limiting
- **@nestjs/throttler** - Rate limiting y protección contra DDoS

#### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing de endpoints HTTP

#### Build Tools
- **SWC** - Compilador ultra-rápido de TypeScript/JavaScript
- **ESLint + Prettier** - Linting y formateo de código

### 2.2 Patrones de Arquitectura

#### Arquitectura en Capas
```
┌─────────────────────────────────────┐
│     Controllers (HTTP Endpoints)     │ ← Capa de presentación
├─────────────────────────────────────┤
│         Services (Lógica)           │ ← Capa de negocio
├─────────────────────────────────────┤
│     Schemas/Models (Mongoose)       │ ← Capa de datos
├─────────────────────────────────────┤
│          MongoDB Database            │ ← Persistencia
└─────────────────────────────────────┘
```

#### Patrones Implementados
- **Dependency Injection** - Inyección de dependencias nativa de NestJS
- **Repository Pattern** - Abstracción de acceso a datos vía Mongoose
- **Decorator Pattern** - Decoradores personalizados para auth (`@Auth()`)
- **Pipe Transform Pattern** - Validación y transformación de datos
- **Guard Pattern** - Protección de rutas con guards de autenticación
- **Module Pattern** - Organización modular del código

### 2.3 Principios de Diseño
- ✅ **Separation of Concerns** - Cada módulo tiene una responsabilidad única
- ✅ **DRY (Don't Repeat Yourself)** - Código reutilizable
- ✅ **SOLID Principles** - Especialmente Single Responsibility y Dependency Inversion
- ✅ **API-First Design** - Diseño centrado en la API REST

---

## 3. ESTRUCTURA DEL PROYECTO

### 3.1 Árbol de Directorios
```
futura-access-api-main/
├── src/
│   ├── Account/                    # Módulo de cuentas de usuario
│   │   ├── account.controller.ts   # Controller HTTP
│   │   ├── account.interface.ts    # Interfaces TypeScript
│   │   ├── account.module.ts       # Módulo NestJS
│   │   ├── account.schema.ts       # Schema de MongoDB
│   │   └── account.service.ts      # Lógica de negocio + Pipes
│   ├── Auth/                       # Módulo de autenticación
│   │   ├── guards/
│   │   │   └── account.guard.ts    # Guard de autenticación
│   │   ├── services/
│   │   │   └── auth.service.ts     # Servicio de JWT
│   │   ├── auth.decorator.ts       # Decorador @Auth()
│   │   ├── auth.module.ts          # Módulo de auth
│   │   └── jwt.strategy.ts         # Estrategia Passport JWT
│   ├── Event/                      # Módulo de eventos
│   │   ├── event.controller.ts     # Endpoints de eventos
│   │   ├── event.module.ts         # Módulo de eventos
│   │   ├── event.schema.ts         # Schemas: Event, Invitation, Coupon, Promocode
│   │   ├── event.service.ts        # Lógica de validación de acceso
│   │   └── promocode.service.ts    # Gestión de promocodes
│   ├── Notifications/              # Módulo de notificaciones
│   │   ├── notifications.controller.ts
│   │   ├── notifications.interface.ts
│   │   ├── notifications.module.ts
│   │   ├── notifications.schema.ts
│   │   └── notifications.service.ts
│   ├── Orders/                     # Módulo de órdenes
│   │   ├── orders.interface.ts
│   │   ├── orders.module.ts
│   │   └── orders.schema.ts
│   ├── Promoter/                   # Módulo de promotores
│   │   ├── promoter.interface.ts
│   │   ├── promoter.module.ts
│   │   └── promoter.schema.ts
│   ├── Sales/                      # Módulo de ventas/tickets
│   │   ├── sales.interface.ts
│   │   ├── sales.module.ts
│   │   ├── sales.schema.ts
│   │   └── sales.service.ts
│   ├── Socket/                     # Módulo de WebSockets
│   │   ├── socket.module.ts
│   │   └── socket.service.ts       # Servicio Socket.IO + Azure PubSub
│   ├── shared/                     # Código compartido
│   │   └── interface.ts            # Interfaces globales
│   ├── utils/                      # Utilidades
│   │   └── password.ts             # Helpers de password hashing
│   ├── app.module.ts               # Módulo raíz de la aplicación
│   └── main.ts                     # Punto de entrada de la app
├── test/                           # Tests E2E
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── Dockerfile                      # Configuración Docker
├── package.json                    # Dependencias y scripts
├── tsconfig.json                   # Configuración TypeScript
├── nest-cli.json                   # Configuración NestJS CLI
└── eslint.config.mjs              # Configuración ESLint
```

### 3.2 Descripción de Carpetas Principales

| Carpeta | Propósito | Responsabilidad |
|---------|-----------|-----------------|
| `Account/` | Gestión de usuarios | Login, validación de tokens, gestión de cuentas ACCESS/PROMOTER |
| `Auth/` | Autenticación | JWT, guards, strategies, decoradores |
| `Event/` | Gestión de eventos | Validación de acceso, promocodes, invitaciones |
| `Sales/` | Gestión de tickets | Schema de tickets vendidos, historial de accesos |
| `Socket/` | Comunicación real-time | WebSockets para notificaciones de acceso en vivo |
| `Notifications/` | Notificaciones | Sistema de notificaciones del sistema |
| `Orders/` | Órdenes de compra | Schema de órdenes |
| `Promoter/` | Promotores | Información de organizadores de eventos |
| `shared/` | Código compartido | Interfaces y tipos reutilizables |
| `utils/` | Utilidades | Helpers y funciones auxiliares |

---

## 4. MÓDULOS Y FUNCIONALIDADES

### 4.1 Account Module (`src/Account/`)

**Responsabilidad:** Gestión de cuentas de usuario, autenticación de personal de acceso.

#### Funcionalidades
1. **Login de cuentas ACCESS**
   - Endpoint: `POST /accounts/login`
   - Validación de credenciales (email + password)
   - Generación de JWT token
   - Respuesta incluye datos del usuario y evento asignado

2. **Validación de tokens**
   - Endpoint: `POST /accounts/validate`
   - Verifica validez y expiración de JWT
   - Retorna payload decodificado del token

3. **Pipes de autorización**
   - `PromoterPipeService` - Valida que el usuario sea PROMOTER o ADMIN
   - `AccessPipeService` - Valida que el usuario sea ACCESS

#### Schema: Account
```typescript
{
  _id: ObjectId,
  name: string,
  lastName: string,
  gender: Gender (MALE | FEMALE),
  promoter: ObjectId (ref: Promoter),
  accessEvent: ObjectId (ref: Event),    // Evento asignado para personal ACCESS
  accessPass: string,                     // Password de acceso
  address: string,                        // Dirección blockchain
  key: string,                            // Clave privada
  mnemonic: string,                       // Mnemonic seed
  role: Roles (ACCESS | ADMIN | PROMOTER | USER),
  email: string (unique),
  phone: string,
  payment: Payment {                      // Info de pago
    bank, bankAddress, iban, swift
  },
  orders: [ObjectId] (ref: Order),
  password: string (hashed),
  registered: boolean (default: true),
  active: boolean (default: false),
  timestamps: true
}
```

#### Roles del Sistema
```typescript
enum Roles {
  ACCESS = 'ACCESS',      // Personal de control de acceso
  ADMIN = 'ADMIN',        // Administradores
  PROMOTER = 'PROMOTER',  // Organizadores de eventos
  USER = 'USER'           // Compradores de tickets
}
```

---

### 4.2 Auth Module (`src/Auth/`)

**Responsabilidad:** Sistema de autenticación y autorización con JWT.

#### Funcionalidades
1. **JWT Token Management**
   - Generación de tokens firmados
   - Decodificación de tokens
   - Validación de expiración

2. **Decorador @Auth()**
   - Decorador personalizado para proteger rutas
   - Acepta pipes de validación (PromoterPipe, AccessPipe)
   - Extrae y valida el token del header Authorization

3. **Guards**
   - `AccountGuard` - Protección de rutas que requieren autenticación

#### Estrategia JWT
```typescript
{
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: process.env.JWT_SECRET_KEY
}
```

#### Payload del Token
```typescript
interface DecodedToken {
  account: string,       // ID de la cuenta
  name: string,
  lastName: string,
  email: string,
  address: string,       // Dirección blockchain
  role: Roles,
  promoter?: string,     // ID del promotor (si aplica)
  accessEvent?: string,  // ID del evento asignado (si es ACCESS)
  iat: number,           // Issued at
  exp: number            // Expiration
}
```

---

### 4.3 Event Module (`src/Event/`)

**Responsabilidad:** Gestión de eventos, validación de acceso, promocodes.

#### Funcionalidades Principales

##### 1. Validación de Acceso a Eventos
**Endpoint:** `PATCH /events/access`
**Auth:** Requiere rol ACCESS

**Flujo de Validación:**
```
1. Recibe sale._id (ticket a validar)
2. Busca el ticket en BD (con promoter match)
3. Verifica status del ticket:
   - OPEN → GRANTED → Marca como CLOSED
   - CLOSED → DENIED (ya usado)
   - SALE → DENIED (en venta secundaria)
   - EXPIRED → DENIED (expirado)
   - PROCESSING → DENIED (procesando)
4. Actualiza historial del ticket
5. Emite evento vía WebSocket a promoter
6. Retorna resultado de validación
```

**Estados del Ticket:**
```typescript
enum TicketStatus {
  PENDING = 'PENDING',         // Pendiente de pago
  PROCESSING = 'PROCESSING',   // Procesando blockchain
  OPEN = 'OPEN',               // Válido para acceso
  SALE = 'SALE',               // En venta secundaria
  SOLD = 'SOLD',               // Vendido (mercado secundario)
  CLOSED = 'CLOSED',           // Ya usado (check-in realizado)
  TRANSFERED = 'TRANSFERED',   // Transferido
  EXPIRED = 'EXPIRED'          // Expirado
}
```

**Respuesta de Validación:**
```typescript
{
  access: 'GRANTED' | 'DENIED',
  reason: string,
  name?: string,         // Nombre del asistente
  email?: string,
  type?: string,         // Tipo de ticket (VIP, General, etc)
  price?: number
}
```

##### 2. Listado de Asistentes
**Endpoint:** `GET /events/attendants/:event`
**Auth:** Requiere rol ACCESS

- Retorna todos los tickets OPEN o CLOSED del evento
- Incluye información del comprador (nombre, email)
- Filtra por promoter y evento

##### 3. Gestión de Promocodes
**Endpoints:**
- `GET /events/promocodes/:eventId` - Listar promocodes de un evento
- `POST /events/promocodes/create` - Crear nuevo promocode
- `DELETE /events/promocodes/:eventId/:code` - Eliminar promocode

**Auth:** Requiere rol PROMOTER

#### Schemas del Módulo

##### Event Schema
```typescript
{
  _id: ObjectId,
  promoter: ObjectId (ref: Promoter),
  coupons: [ObjectId] (ref: Coupon),
  invitations: [ObjectId] (ref: Invitation),
  name: string,
  description: string,
  image: string,
  ticketImage: string,
  maxQuantity: number,
  capacity: number,
  commission: number,
  resale: Resale {
    isResale: boolean,
    isActive: boolean,
    maxPrice: number,
    royalty: number
  },
  artists: [Artist {
    name: string,
    image: string
  }],
  location: Location {
    address, city, country, postalCode
  },
  dateTime: DateTime {
    launchDate: Date,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date
  },
  conditions: [Condition {
    title: string,
    content: string
  }],
  isBlockchain: boolean (default: true),
  views: number (default: 0),
  address: string,              // Smart contract address
  blockNumber: number,          // Block de deploy
  hash: string,                 // Transaction hash
  url: string,
  tickets: [Ticket {
    type: string,
    amount: number,
    price: number
  }],
  orders: [ObjectId] (ref: Orders),
  status: EventStatus (default: CREATED),
  timestamps: true
}
```

##### Promocode Schema
```typescript
{
  _id: ObjectId,
  code: string (unique),
  email: string,
  name: string,
  lastName: string,
  eventId: ObjectId (ref: Event),
  created: Date (default: Date.now),
  timestamps: true
}
```

##### Coupon Schema
```typescript
{
  _id: ObjectId,
  code: string (unique),
  discount: number,              // Porcentaje de descuento
  eventId: ObjectId (ref: Event),
  created: Date (default: Date.now),
  expiryDate: Date,
  maxUses: number (default: 1),
  timestamps: true
}
```

##### Invitation Schema
```typescript
{
  _id: ObjectId,
  email: string,
  quantity: number,              // Cantidad de invitaciones
  created: Date (default: Date.now),
  timestamps: true
}
```

---

### 4.4 Sales Module (`src/Sales/`)

**Responsabilidad:** Gestión de tickets vendidos (sales) y su ciclo de vida.

#### Sales Schema
```typescript
{
  _id: ObjectId,
  client: ObjectId (ref: Account),
  event: ObjectId (ref: Event),
  order: ObjectId (ref: Order),
  promoter: ObjectId (ref: Promoter),
  tokenId: number,               // Token ID del NFT (si es blockchain)
  type: string,                  // Tipo de ticket (VIP, General, etc)
  price: number,
  resale: Resale {               // Info si está en reventa
    resalePrice: number,
    resaleDate: Date
  },
  signature: string,
  isResale: ObjectId (ref: Sales),     // Referencia a sale original si es reventa
  isTransfer: ObjectId (ref: Sales),   // Referencia si es transferencia
  isInvitation: boolean (default: false),
  blockNumber: number,
  hash: string,                  // Transaction hash
  qrCode: string,                // QR code único para validación
  history: [SaleHistory {
    activity: TicketActivity,
    reason: string,
    blockNumber: number,
    hash: string,
    from: TransferAccount,
    to: TransferAccount,
    status: TicketStatus,
    createdAt: Date
  }],
  status: TicketStatus (default: PENDING),
  timestamps: true
}
```

#### Actividades del Ticket
```typescript
enum TicketActivity {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  GRANTED = 'GRANTED',       // Acceso concedido
  DENIED = 'DENIED',         // Acceso denegado
  TRANSFERING = 'TRANSFERING',
  TRANSFERED = 'TRANSFERED'
}
```

#### SalesService - Métodos Principales
1. `checkTicketStatus(promoter, saleId)` - Verificar estado de un ticket
2. `updateSale(saleId, updateData)` - Actualizar información del ticket
3. Métodos de validación y verificación de acceso

---

### 4.5 Socket Module (`src/Socket/`)

**Responsabilidad:** Comunicación en tiempo real vía WebSockets para notificaciones de acceso.

#### Tecnologías
- **Socket.IO 4.8.1** - Librería de WebSockets
- **Azure Web PubSub** - Servicio de Azure para WebSockets escalables

#### Configuración
```typescript
{
  port: 443,
  pingTimeout: 10000,
  hub: 'Centro',
  connectionString: process.env.SOCKET_ACCESS
}
```

#### Eventos WebSocket

##### 1. Conexión
```typescript
// Cliente se conecta con token JWT en query params
socket.connect({
  query: { token: 'JWT_TOKEN' }
});

// Servidor valida token y registra conexión
```

##### 2. Emisión de Accesos
**Evento:** `access`
**Payload:**
```typescript
interface EmitAccess {
  _id: string,              // ID del ticket
  order: string,
  event: string,
  promoter: string,
  client: {
    name: string,
    lastName: string,
    email: string,
    phone: string
  },
  history: SaleHistory[],
  blockNumber: number,
  hash: string,
  tokenId: number,
  type: string,
  price: number,
  status: TicketStatus,
  qrCode: string,
  createdAt: Date
}
```

#### Gestión de Conexiones
- **Map de conexiones** por promoter: `Map<promoterId, socketId[]>`
- Cada promoter puede tener múltiples conexiones (múltiples dispositivos)
- Al hacer check-in, se emite a TODOS los sockets del promoter
- Auto-desconexión al cerrar cliente

---

### 4.6 Orders Module (`src/Orders/`)

**Responsabilidad:** Gestión de órdenes de compra de tickets.

#### Orders Schema
```typescript
{
  _id: ObjectId,
  account: ObjectId (ref: Account),
  event: ObjectId (ref: Event),
  promoter: ObjectId (ref: Promoter),
  items: [Item {
    sale: ObjectId,
    type: string,
    amount: number,
    price: number
  }],
  resaleItems: [Item],           // Items de mercado secundario
  sales: [ObjectId] (ref: Sales),
  paymentId: string,             // ID de pago (Stripe, etc)
  contactDetails: ContactDetails {
    name: string,
    lastName: string,
    email: string,
    phone: string
  },
  status: OrderStatus (default: PENDING),
  timestamps: true
}
```

```typescript
enum OrderStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED'
}
```

---

### 4.7 Notifications Module (`src/Notifications/`)

**Responsabilidad:** Sistema de notificaciones para eventos y acciones del sistema.

#### Notification Schema
```typescript
{
  _id: ObjectId,
  type: NotificationType,
  promoter: ObjectId (ref: Promoter),
  userId: ObjectId (ref: Account),
  orderId: ObjectId (ref: Order),
  eventId: ObjectId (ref: Event),
  readBy: [string],              // IDs de usuarios que leyeron
  read: boolean (default: false),
  createdAt: Date,
  timestamps: true
}
```

---

### 4.8 Promoter Module (`src/Promoter/`)

**Responsabilidad:** Gestión de promotores/organizadores de eventos.

#### Promoter Schema
```typescript
{
  _id: ObjectId,
  name: string,
  address: string,               // Dirección blockchain del promotor
  key: string,                   // Clave privada
  mnemonic: string,              // Mnemonic seed
  image: string,
  icon: string,
  events: [ObjectId] (ref: Event),
  clients: [ObjectId] (ref: PromoterClient),
  api: APISettings {
    // Configuración de API keys, etc
  },
  timestamps: true
}
```

#### PromoterClient Schema
```typescript
{
  _id: ObjectId,
  client: ObjectId (ref: Account),
  promoter: ObjectId (ref: Promoter),
  timestamps: true
}
```

---

## 5. MODELOS DE DATOS (SCHEMAS MONGODB)

### 5.1 Diagrama de Relaciones

```
┌─────────────┐
│   Promoter  │
└──────┬──────┘
       │ 1:N
       ├─────────┐
       │         │
       ▼         ▼
  ┌────────┐  ┌────────┐
  │ Event  │  │Account │
  └───┬────┘  └───┬────┘
      │ 1:N       │
      │           │ 1:N
      ▼           ▼
  ┌────────┐  ┌────────┐
  │ Orders │◄─┤ Orders │
  └───┬────┘  └────────┘
      │ 1:N
      ▼
  ┌────────┐
  │ Sales  │
  └────────┘
```

### 5.2 Resumen de Schemas

| Schema | Colección | Relaciones | Propósito |
|--------|-----------|------------|-----------|
| `Account` | accounts | promoter, accessEvent, orders | Usuarios del sistema |
| `Promoter` | promoters | events, clients | Organizadores |
| `Event` | events | promoter, coupons, invitations, orders | Eventos |
| `Orders` | orders | account, event, promoter, sales | Órdenes de compra |
| `Sales` | sales | client, event, order, promoter | Tickets vendidos |
| `Notification` | notifications | promoter, userId, orderId, eventId | Notificaciones |
| `Promocode` | promocodes | eventId | Códigos promocionales |
| `Coupon` | coupons | eventId | Cupones de descuento |
| `Invitation` | invitations | - | Invitaciones |
| `PromoterClient` | promoterclients | client, promoter | Relación promotor-cliente |

---

## 6. API ENDPOINTS

### 6.1 Accounts Endpoints

#### POST /accounts/login
**Descripción:** Login de personal de acceso
**Auth:** No requiere
**Body:**
```json
{
  "loginAccount": {
    "email": "access@example.com",
    "password": "password123"
  }
}
```
**Response 200:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Juan",
  "lastName": "Pérez",
  "promoter": { "name": "Promotora XYZ" },
  "accessEvent": { "name": "Concierto Rock 2025" },
  "role": "ACCESS",
  "email": "access@example.com",
  "address": "0x1234567890abcdef",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /accounts/validate
**Descripción:** Validar token JWT
**Auth:** No requiere
**Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response 200:**
```json
{
  "account": "507f1f77bcf86cd799439011",
  "name": "Juan",
  "lastName": "Pérez",
  "email": "access@example.com",
  "role": "ACCESS",
  "iat": 1704067200,
  "exp": 1704153600
}
```

---

### 6.2 Events Endpoints

#### GET /events/attendants/:event
**Descripción:** Obtener lista de asistentes de un evento
**Auth:** ACCESS role
**Headers:**
```
Authorization: Bearer {token}
```
**Response 200:**
```json
[
  {
    "_id": "sale_id_1",
    "client": {
      "name": "María",
      "lastName": "González",
      "email": "maria@example.com"
    },
    "type": "VIP",
    "price": 150.00,
    "status": "OPEN"
  },
  {
    "_id": "sale_id_2",
    "client": {
      "name": "Pedro",
      "lastName": "Martínez",
      "email": "pedro@example.com"
    },
    "type": "General",
    "price": 50.00,
    "status": "CLOSED"
  }
]
```

#### PATCH /events/access
**Descripción:** Validar acceso de un ticket (check-in)
**Auth:** ACCESS role
**Headers:**
```
Authorization: Bearer {token}
```
**Body:**
```json
{
  "sale": "sale_id_1"
}
```
**Response 200 (Acceso Concedido):**
```json
{
  "access": "GRANTED",
  "reason": "Access granted",
  "name": "María González",
  "email": "maria@example.com",
  "type": "VIP",
  "price": 150.00
}
```
**Response 200 (Acceso Denegado - Ticket ya usado):**
```json
{
  "access": "DENIED",
  "reason": "Ticket already used.",
  "name": "María González",
  "email": "maria@example.com",
  "type": "VIP",
  "price": 150.00
}
```

---

#### GET /events/promocodes/:eventId
**Descripción:** Obtener promocodes de un evento
**Auth:** PROMOTER role
**Response 200:**
```json
[
  {
    "_id": "promo_1",
    "code": "EARLY2025",
    "email": "vip@example.com",
    "name": "Juan",
    "lastName": "Pérez",
    "eventId": "event_id_1",
    "created": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST /events/promocodes/create
**Descripción:** Crear nuevo promocode
**Auth:** PROMOTER role
**Body:**
```json
{
  "code": "VIP2025",
  "email": "vip@example.com",
  "name": "María",
  "lastName": "López",
  "eventId": "event_id_1"
}
```
**Response 200:**
```json
{
  "_id": "promo_2",
  "code": "VIP2025",
  "email": "vip@example.com",
  "name": "María",
  "lastName": "López",
  "eventId": "event_id_1",
  "created": "2025-01-10T00:00:00.000Z"
}
```

#### DELETE /events/promocodes/:eventId/:code
**Descripción:** Eliminar promocode
**Auth:** PROMOTER role
**Response 200:**
```json
true
```

---

## 7. AUTENTICACIÓN Y AUTORIZACIÓN

### 7.1 Flujo de Autenticación

```
┌────────┐                ┌──────────────┐                ┌──────────┐
│ Cliente│                │ Access API   │                │  MongoDB │
└───┬────┘                └──────┬───────┘                └────┬─────┘
    │                            │                              │
    │ POST /accounts/login       │                              │
    ├───────────────────────────►│                              │
    │ {email, password}          │                              │
    │                            │ Find account by email        │
    │                            ├─────────────────────────────►│
    │                            │                              │
    │                            │ ◄────────────────────────────┤
    │                            │ Account data                 │
    │                            │                              │
    │                            │ bcrypt.compare(password)     │
    │                            ├──────────┐                   │
    │                            │          │                   │
    │                            │◄─────────┘                   │
    │                            │ Password match               │
    │                            │                              │
    │                            │ jwt.sign(payload)            │
    │                            ├──────────┐                   │
    │                            │          │                   │
    │                            │◄─────────┘                   │
    │                            │ JWT Token                    │
    │                            │                              │
    │ ◄──────────────────────────┤                              │
    │ {account data + token}     │                              │
    │                            │                              │
```

### 7.2 Decorador @Auth()

**Uso:**
```typescript
@Get('/attendants/:event')
async getAttendantsEvent(
  @Auth(AccessPipeService) promoter: Account,
  @Param('event') event: string
): Promise<Sale[]> {
  return await this.eventService.getAttendantsEvent(promoter.promoter!, event);
}
```

**Funcionamiento:**
1. Extrae el token del header `Authorization: Bearer {token}`
2. Pasa el token al pipe especificado (AccessPipeService o PromoterPipeService)
3. El pipe:
   - Decodifica el token con `authService.decodeToken()`
   - Busca la cuenta en BD según el rol requerido
   - Retorna la cuenta si es válida
   - Lanza `UnauthorizedException` si no es válida
4. El resultado se inyecta en el parámetro decorado

### 7.3 Pipes de Autorización

#### PromoterPipeService
**Propósito:** Validar que el usuario sea PROMOTER o ADMIN

```typescript
async transform(token: string) {
  const payload = await this.authService.decodeToken(token);
  const account = await this.accountService.getPromoterAccount(payload.account);

  if (!account) throw new UnauthorizedException("Invalid account");
  return account;
}
```

**Query:** `{ _id: accountId, $or: [{ role: 'ADMIN' }, { role: 'PROMOTER' }] }`

#### AccessPipeService
**Propósito:** Validar que el usuario sea ACCESS

```typescript
async transform(token: string) {
  const payload = await this.authService.decodeToken(token);
  const account = await this.accountService.getAccessAccount(payload.account);

  if (!account) throw new UnauthorizedException('Invalid account');
  return account;
}
```

**Query:** `{ _id: accountId, role: 'ACCESS' }`

### 7.4 Seguridad

#### Rate Limiting
```typescript
ThrottlerModule.forRootAsync({
  useFactory: (config: ConfigService) => [{
    ttl: config.get('THROTTLE_TTL'),        // Time to live
    limit: config.get('THROTTLE_LIMIT')     // Max requests
  }]
})
```

#### Password Hashing
- Algoritmo: **bcryptjs**
- Salt rounds: Default (10)
- Función: `comparePassword(plainText, hashed)`

---

## 8. INTEGRACIONES EXTERNAS

### 8.1 Azure Web PubSub

**Propósito:** Servicio de WebSocket escalable en Azure para comunicación en tiempo real.

**Configuración:**
```typescript
useAzureSocketIO(socket, {
  hub: 'Centro',
  connectionString: process.env.SOCKET_ACCESS
});
```

**Características:**
- ✅ Auto-scaling de conexiones
- ✅ Alta disponibilidad
- ✅ Gestión automática de reconexiones
- ✅ Compatible con Socket.IO

**Variable de entorno requerida:**
```
SOCKET_ACCESS=Endpoint=https://...;AccessKey=...;Version=1.0;
```

---

### 8.2 MongoDB Atlas

**Conexión:**
```typescript
MongooseModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    uri: config.get<string>('MONGO_URL')
  })
})
```

**Variable de entorno:**
```
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/futuratickets?retryWrites=true&w=majority
```

---

## 9. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### 9.1 Variables Requeridas

```bash
# Application
PORT=3000
NODE_ENV=production

# Database
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/futuratickets

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-in-production

# WebSocket (Azure Web PubSub)
SOCKET_ACCESS=Endpoint=https://your-pubsub.webpubsub.azure.com;AccessKey=your-key;Version=1.0;

# Rate Limiting
THROTTLE_TTL=60000        # 60 segundos
THROTTLE_LIMIT=100        # 100 requests por minuto
```

### 9.2 Archivo .env.example
```bash
# Application
PORT=3000
NODE_ENV=development

# Database
MONGO_URL=mongodb://localhost:27017/futuratickets

# JWT
JWT_SECRET_KEY=dev-secret-key

# Azure WebSocket
SOCKET_ACCESS=

# Throttle
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

---

## 10. DEPLOYMENT Y CONTAINERIZACIÓN

### 10.1 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

# RUN npm install --force && npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Nota:** El build está comentado, se asume que se hace pre-build antes de copiar.

### 10.2 Scripts npm

```json
{
  "start:prod": "node dist/main",
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch"
}
```

### 10.3 Proceso de Deployment

#### Build
```bash
npm install
npm run build
```

#### Docker Build
```bash
docker build -t futura-access-api:latest .
```

#### Docker Run
```bash
docker run -p 3000:3000 \
  -e MONGO_URL="mongodb+srv://..." \
  -e JWT_SECRET_KEY="secret" \
  -e SOCKET_ACCESS="..." \
  futura-access-api:latest
```

---

## 11. DEPENDENCIAS CON OTROS REPOSITORIOS

### 11.1 Diagrama de Dependencias

```
┌───────────────────────────────────────────────────────┐
│                  ECOSYSTEM OVERVIEW                    │
└───────────────────────────────────────────────────────┘

┌──────────────────────┐
│ futura-access-app    │  ──►  Consume esta API
│ (Frontend Web/Mobile)│       (Escaneo QR, validación)
└──────────────────────┘

┌──────────────────────┐
│ futura-tickets-      │  ──►  Comparte modelos de datos
│ rest-api             │       (Events, Sales, Orders)
└──────────────────────┘

┌──────────────────────┐
│ futura-tickets-      │  ──►  Lee datos de eventos
│ admin-api            │       (Gestión de eventos)
└──────────────────────┘

┌──────────────────────┐
│ futura-market-place  │  ──►  Lee datos de ventas
│ -api                 │       (Tickets vendidos)
└──────────────────────┘

┌──────────────────────┐
│ futura-tickets-      │  ──►  Integración blockchain
│ smartcontracts       │       (Validación de NFTs)
└──────────────────────┘
```

### 11.2 Datos Compartidos

| Dato | Origen | Uso en Access API |
|------|--------|-------------------|
| **Events** | admin-api/rest-api | Validación de tickets, asignación de personal |
| **Sales** | rest-api/marketplace-api | Validación de acceso, check-in |
| **Orders** | rest-api | Relación con tickets |
| **Accounts** | rest-api | Autenticación de personal ACCESS |
| **Promoters** | admin-api | Gestión de organizadores |
| **Smart Contracts** | smartcontracts | Validación de NFTs (tokenId, hash) |

### 11.3 APIs Consumidores

1. **futura-access-app** (Frontend de control de acceso)
   - Consume: `/accounts/login`, `/events/access`, `/events/attendants`
   - WebSocket: Conexión para recibir validaciones en tiempo real

2. **futura-tickets-admin-main** (Panel administrativo)
   - Consume: `/events/promocodes/*` (CRUD de promocodes)

---

## 12. ESTADO ACTUAL DEL PROYECTO

### 12.1 Funcionalidades Implementadas ✅

#### Core Functionality
- ✅ Sistema de autenticación JWT completo
- ✅ Login de personal ACCESS
- ✅ Validación de tokens
- ✅ Pipes de autorización (PROMOTER, ACCESS)

#### Validación de Acceso
- ✅ Endpoint de check-in (`/events/access`)
- ✅ Validación de estados de tickets
- ✅ Actualización de historial de accesos
- ✅ Prevención de doble entrada (tickets CLOSED)

#### WebSockets
- ✅ Integración con Azure Web PubSub
- ✅ Emisión de eventos de acceso en tiempo real
- ✅ Gestión de múltiples conexiones por promoter
- ✅ Auto-desconexión y cleanup

#### Gestión de Promocodes
- ✅ CRUD completo de promocodes
- ✅ Asociación con eventos
- ✅ Validación de permisos por promoter

#### Base de Datos
- ✅ Schemas completos de MongoDB
- ✅ Relaciones entre colecciones
- ✅ Índices y validaciones

### 12.2 Funcionalidades Parciales ⚠️

#### Notifications Module
- ⚠️ Schema definido pero sin endpoints implementados
- ⚠️ Falta servicio de envío de notificaciones
- ⚠️ No hay integración con email/SMS

#### Sales Service
- ⚠️ Métodos básicos implementados
- ⚠️ Falta lógica completa de transferencias
- ⚠️ Falta validación de reventa

### 12.3 Funcionalidades Faltantes ❌

#### Testing
- ❌ Tests unitarios (0% coverage)
- ❌ Tests E2E (solo archivo base)
- ❌ Tests de integración

#### Documentación
- ❌ Swagger/OpenAPI no configurado
- ❌ Falta documentación de API endpoints
- ❌ No hay ejemplos de uso

#### Seguridad
- ❌ CORS no configurado
- ❌ Helmet.js no implementado
- ❌ Rate limiting configurado pero sin testing

#### Blockchain Integration
- ❌ No hay validación on-chain de tickets
- ❌ No hay verificación de ownership de NFTs
- ❌ Campos blockchain (address, hash, tokenId) no se validan

#### Monitoreo
- ❌ Logging estructurado no implementado
- ❌ No hay métricas (Prometheus, Datadog)
- ❌ No hay health checks
- ❌ No hay alerting

#### CI/CD
- ❌ No hay pipeline de CI/CD
- ❌ No hay GitHub Actions
- ❌ No hay deploy automatizado

---

## 13. TAREAS PENDIENTES Y PRÓXIMOS PASOS

### 13.1 Prioridad Alta 🔴

#### Seguridad
- [ ] **Configurar CORS** con whitelist de dominios permitidos
  - `app.enableCors({ origin: [process.env.FRONTEND_URL], credentials: true })`
- [ ] **Implementar Helmet.js** para headers de seguridad
- [ ] **Configurar rate limiting real** y probarlo con tests de carga
- [ ] **Implementar refresh tokens** (actualmente solo access tokens)
- [ ] **Validar inputs** con class-validator en todos los DTOs
- [ ] **Sanitizar datos** para prevenir NoSQL injection

#### Blockchain Validation
- [ ] **Validar ownership de NFTs** antes de permitir acceso
  - Llamar a smart contract para verificar `ownerOf(tokenId)`
- [ ] **Verificar hash de transacción** en blockchain
- [ ] **Sincronizar estado on-chain** con BD periódicamente

#### Testing
- [ ] **Tests unitarios** para cada servicio (target: 80% coverage)
- [ ] **Tests E2E** para flujos críticos:
  - Login → Validación de ticket
  - Creación de promocode
  - WebSocket connection
- [ ] **Tests de integración** con MongoDB en memoria

---

### 13.2 Prioridad Media 🟡

#### API Documentation
- [ ] **Configurar Swagger** con `@nestjs/swagger`
- [ ] **Documentar todos los endpoints** con decoradores
- [ ] **Generar OpenAPI spec** automáticamente
- [ ] **Crear Postman collection** para testing manual

#### Notifications System
- [ ] **Implementar NotificationsController** con endpoints CRUD
- [ ] **Integrar SendGrid** para emails transaccionales
- [ ] **Integrar Twilio** para SMS
- [ ] **Crear templates** de notificaciones

#### Observability
- [ ] **Implementar logging estructurado** con Winston/Pino
- [ ] **Configurar health checks** (`/health`, `/ready`)
- [ ] **Integrar Sentry** para error tracking
- [ ] **Métricas de aplicación** (requests/s, latencia, etc)

#### Performance
- [ ] **Implementar caching** con Redis
  - Cache de eventos activos
  - Cache de validaciones recientes
- [ ] **Optimizar queries** con proyecciones y lean()
- [ ] **Implementar paginación** en listados

---

### 13.3 Prioridad Baja 🟢

#### Developer Experience
- [ ] **Pre-commit hooks** con Husky
- [ ] **Configurar ESLint** más estricto
- [ ] **Configurar Prettier** en pre-commit
- [ ] **Crear seed scripts** para datos de desarrollo

#### Features
- [ ] **Exportar reportes** de asistencia (CSV, PDF)
- [ ] **Dashboard de analytics** en tiempo real
- [ ] **Soporte multi-idioma** (i18n)
- [ ] **Audit logs** detallados

---

### 13.4 Roadmap por Fases

#### Fase 1: Estabilización (2 semanas)
1. Implementar testing completo
2. Configurar seguridad (CORS, Helmet, validación)
3. Validación blockchain básica
4. Documentación Swagger

#### Fase 2: Observability (1 semana)
1. Logging estructurado
2. Health checks
3. Sentry integration
4. Métricas básicas

#### Fase 3: Features (2 semanas)
1. Sistema de notificaciones completo
2. Caching con Redis
3. Reportes y analytics
4. Optimizaciones de performance

#### Fase 4: DevOps (1 semana)
1. CI/CD pipeline
2. Deploy automatizado
3. Monitoreo en producción
4. Alerting

---

## 14. DIAGRAMAS Y VISUALIZACIONES

### 14.1 Flujo de Validación de Acceso

```
┌────────────────────────────────────────────────────────────────┐
│                   TICKET VALIDATION FLOW                        │
└────────────────────────────────────────────────────────────────┘

  Personal ACCESS              Access API              MongoDB
       │                           │                       │
       │  Escanea QR Code          │                       │
       │  (sale._id)               │                       │
       │                           │                       │
       │  PATCH /events/access     │                       │
       ├──────────────────────────►│                       │
       │  { sale: "sale_id" }      │                       │
       │  + JWT token              │                       │
       │                           │                       │
       │                           │  Decodifica JWT       │
       │                           ├───────────┐           │
       │                           │           │           │
       │                           │◄──────────┘           │
       │                           │  payload              │
       │                           │                       │
       │                           │  Valida promoter      │
       │                           ├──────────────────────►│
       │                           │  Find account         │
       │                           │◄──────────────────────┤
       │                           │  Account data         │
       │                           │                       │
       │                           │  Busca ticket         │
       │                           ├──────────────────────►│
       │                           │  Find sale            │
       │                           │◄──────────────────────┤
       │                           │  Sale data            │
       │                           │                       │
       │                           │  Verifica status      │
       │                           ├──────────┐            │
       │                           │          │            │
       │                           │◄─────────┘            │
       │                           │                       │
       │                       ┌───┴────┐                  │
       │                       │ Status?│                  │
       │                       └───┬────┘                  │
       │                           │                       │
       │          ┌────────────────┼────────────────┐      │
       │          │                │                │      │
       │       ┌──▼──┐          ┌──▼──┐         ┌──▼──┐   │
       │       │OPEN │          │CLOSED│        │SALE │   │
       │       └──┬──┘          └──┬──┘         └──┬──┘   │
       │          │                │                │      │
       │    ✅ GRANTED        ❌ DENIED        ❌ DENIED  │
       │     (permitir)      (ya usado)    (en venta)     │
       │          │                │                │      │
       │          │  Actualizar    │  Actualizar    │  Actualizar │
       │          │  status→CLOSED │  history       │  history    │
       │          ├───────────────►│────────────────┼────────────►│
       │          │                │                │             │
       │          │  Emitir evento │                │             │
       │          │  WebSocket     │                │             │
       │          ├────────────────┼────────────────┘             │
       │          │                │                              │
       │          │  Notificar     │                              │
       │          │  todas las     │                              │
       │          │  conexiones    │                              │
       │          │  del promoter  │                              │
       │          │                │                              │
       │◄─────────┴────────────────┴───────────────────────────────
       │  Response:                │
       │  {                        │
       │    access: "GRANTED",     │
       │    reason: "...",         │
       │    name: "...",           │
       │    email: "...",          │
       │    type: "VIP",           │
       │    price: 150             │
       │  }                        │
       │                           │
```

### 14.2 Arquitectura de Sistema Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Access App   │  │ Admin Panel  │  │ Marketplace Web    │    │
│  │ (Mobile/Web) │  │ (Next.js)    │  │ (Next.js)          │    │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘    │
└─────────┼──────────────────┼────────────────────┼───────────────┘
          │                  │                    │
          │ REST API         │ REST API           │ REST API
          │ WebSocket        │                    │
          │                  │                    │
┌─────────▼──────────────────▼────────────────────▼───────────────┐
│                       API GATEWAY                                │
│                     (opcional - futuro)                          │
└─────────┬──────────────────┬────────────────────┬───────────────┘
          │                  │                    │
┌─────────▼────────┐ ┌───────▼────────┐ ┌─────────▼──────────┐
│  Access API      │ │  Admin API     │ │  Marketplace API   │
│  (Este Repo)     │ │                │ │                    │
│                  │ │                │ │                    │
│  - Validación    │ │  - CRUD Events │ │  - Ventas          │
│  - Check-in      │ │  - Analytics   │ │  - Mercado 2º      │
│  - WebSockets    │ │  - Promocodes  │ │  - Pagos           │
└────────┬─────────┘ └────────┬───────┘ └──────────┬─────────┘
         │                    │                     │
         └────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   MongoDB Atlas    │
                    │                    │
                    │  Collections:      │
                    │  - accounts        │
                    │  - events          │
                    │  - sales           │
                    │  - orders          │
                    │  - promoters       │
                    │  - notifications   │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Azure Web PubSub│  │ Blockchain      │  │ Storage (S3)   │
│ (WebSockets)    │  │ (Ethereum/      │  │ (Images)       │
│                 │  │  Polygon)       │  │                │
└─────────────────┘  └─────────────────┘  └────────────────┘
```

### 14.3 Modelo de Datos Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATA MODEL                                │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Promoter      │
├─────────────────┤
│ _id             │◄──────┐
│ name            │       │
│ address (BC)    │       │
│ key             │       │
│ mnemonic        │       │ 1
│ image           │       │
│ events[]        │       │
│ clients[]       │       │
└────────┬────────┘       │
         │                │
         │ 1:N            │
         │                │
┌────────▼────────┐       │
│     Event       │       │
├─────────────────┤       │
│ _id             │       │
│ promoter        │───────┘
│ name            │
│ description     │
│ image           │
│ capacity        │
│ commission      │       ┌─────────────────┐
│ location        │       │ PromoterClient  │
│ dateTime        │       ├─────────────────┤
│ tickets[]       │       │ _id             │
│ address (SC)    │       │ client          │──────┐
│ status          │       │ promoter        │      │
│ orders[]        │───┐   └─────────────────┘      │
└────────┬────────┘   │                            │
         │            │                            │
         │            │                            │
         │ 1:N        │                            │
         │            │                            │
┌────────▼────────┐  │                            │
│    Coupon       │  │                            │
├─────────────────┤  │   ┌─────────────────┐      │
│ _id             │  │   │     Orders      │      │
│ code (unique)   │  │   ├─────────────────┤      │
│ discount        │  │   │ _id             │      │
│ eventId         │  └──►│ event           │      │
│ expiryDate      │      │ account         │──────┤
│ maxUses         │      │ promoter        │      │
└─────────────────┘      │ items[]         │      │
                         │ sales[]         │──┐   │
┌─────────────────┐      │ paymentId       │  │   │
│   Promocode     │      │ contactDetails  │  │   │
├─────────────────┤      │ status          │  │   │
│ _id             │      └─────────────────┘  │   │
│ code (unique)   │                           │   │
│ email           │                           │   │
│ name            │                           │   │
│ lastName        │                           │   │
│ eventId         │                           │   │
└─────────────────┘                           │   │
                                              │   │
┌─────────────────┐                           │   │
│   Invitation    │      ┌─────────────────┐  │   │
├─────────────────┤      │     Sales       │  │   │
│ _id             │      ├─────────────────┤  │   │
│ email           │      │ _id             │◄─┘   │
│ quantity        │      │ client          │──────┤
└─────────────────┘      │ event           │      │
                         │ order           │      │
                         │ promoter        │      │
                         │ tokenId (NFT)   │      │
                         │ type            │      │
                         │ price           │      │
                         │ qrCode          │      │
         ┌───────────────│ status          │      │
         │               │ history[]       │      │
         │               │ hash (BC)       │      │
         │               │ blockNumber     │      │
         │               └─────────────────┘      │
         │                                        │
         │               ┌─────────────────┐      │
         │               │    Account      │      │
         │               ├─────────────────┤      │
         │               │ _id             │◄─────┘
         │               │ name            │
         │               │ lastName        │
         │               │ email (unique)  │
         │               │ password        │
         │               │ role            │
         │               │ promoter        │
         │               │ accessEvent     │
         │               │ address (BC)    │
         │               │ orders[]        │
         │               └─────────────────┘
         │
         │               ┌─────────────────┐
         │               │  Notification   │
         │               ├─────────────────┤
         └──────────────►│ _id             │
                         │ type            │
                         │ promoter        │
                         │ userId          │
                         │ orderId         │
                         │ eventId         │
                         │ readBy[]        │
                         │ read            │
                         └─────────────────┘

Legend:
  ──► : Reference (ObjectId)
  ─┐  : One-to-Many relationship
  BC  : Blockchain
  SC  : Smart Contract
```

---

## 15. CONCLUSIONES Y RECOMENDACIONES

### 15.1 Fortalezas del Proyecto ✅
1. **Arquitectura sólida** - Uso correcto de patrones NestJS
2. **Separación de responsabilidades** - Módulos bien definidos
3. **WebSockets integrados** - Comunicación en tiempo real funcional
4. **Schemas bien diseñados** - Modelo de datos robusto
5. **Sistema de auth completo** - JWT + decoradores personalizados

### 15.2 Áreas de Mejora ⚠️
1. **Testing** - 0% coverage actual, crítico implementar
2. **Documentación** - Falta Swagger y documentación de API
3. **Seguridad** - Falta CORS, Helmet, validación de inputs
4. **Blockchain** - No hay validación on-chain real
5. **Observability** - No hay logging, métricas ni monitoreo

### 15.3 Recomendaciones Inmediatas 🎯

#### Para Desarrollo
1. **Implementar DTOs** con class-validator en todos los endpoints
2. **Configurar Swagger** para auto-documentación
3. **Escribir tests** para casos críticos (validación de acceso)
4. **Configurar variables de entorno** con validación

#### Para Producción
1. **Implementar health checks** antes de deploy
2. **Configurar CORS** con whitelist
3. **Integrar Sentry** para error tracking
4. **Setup CI/CD** con GitHub Actions
5. **Monitoreo** con Datadog o similar

#### Para Escalabilidad
1. **Implementar Redis** para caching
2. **Optimizar queries** con índices MongoDB
3. **Rate limiting** por IP y por usuario
4. **Load balancing** con múltiples instancias

---

## 16. CONTACTO Y SOPORTE

**Proyecto:** FuturaTickets Access API
**Tecnología:** NestJS + MongoDB + Socket.IO
**Documentación actualizada:** 2025-10-08

---

## ANEXOS

### A. Comandos Útiles

```bash
# Desarrollo
npm run start:dev           # Modo desarrollo con hot-reload
npm run build              # Build de producción
npm run start:prod         # Ejecutar build de producción

# Testing
npm run test               # Tests unitarios
npm run test:e2e           # Tests E2E
npm run test:cov           # Coverage report

# Linting
npm run lint               # ESLint
npm run format             # Prettier
```

### B. Troubleshooting

#### Error: Cannot connect to MongoDB
```bash
# Verificar conexión
mongosh "mongodb+srv://..."

# Verificar variable MONGO_URL
echo $MONGO_URL
```

#### Error: WebSocket connection failed
```bash
# Verificar Azure PubSub
# Verificar variable SOCKET_ACCESS
# Verificar que el token JWT es válido
```

#### Error: Unauthorized
```bash
# Verificar que el token no expiró
# Verificar JWT_SECRET_KEY coincide
# Verificar header: Authorization: Bearer {token}
```

---

**FIN DEL DOCUMENTO**
