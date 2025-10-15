# ARQUITECTURA OVERVIEW - FuturaTickets Ecosystem

> **Organización:** FuturaTickets
> **Total de Repositorios:** 16
> **Fecha de Documentación:** 2025-10-13
> **Versión:** 1.0

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Mapa de Arquitectura Global](#2-mapa-de-arquitectura-global)
3. [Inventario Detallado de Repositorios](#3-inventario-detallado-de-repositorios)
4. [Relaciones e Integraciones entre Repositorios](#4-relaciones-e-integraciones-entre-repositorios)
5. [Flujos Principales del Sistema](#5-flujos-principales-del-sistema)
6. [Infraestructura y DevOps](#6-infraestructura-y-devops)
7. [Stack Tecnológico Consolidado](#7-stack-tecnológico-consolidado)
8. [Recomendaciones Técnicas](#8-recomendaciones-técnicas)
9. [Checklist de Calidad](#9-checklist-de-calidad)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Visión General del Ecosistema

**FuturaTickets** es una plataforma completa de gestión y venta de tickets para eventos que integra tecnología blockchain (NFTs), procesamiento de pagos (Stripe), sistema de reventa, control de acceso y analytics en tiempo real.

El ecosistema está compuesto por **16 repositorios** organizados en 4 capas principales:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                        │
│  Frontends Web (Next.js) + Apps Móviles (Expo/React Native)    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      CAPA DE APLICACIÓN                         │
│  APIs Backend (NestJS) + Microservicios + WebSockets           │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE BLOCKCHAIN                           │
│  Smart Contracts (Solidity) + Factory Pattern + ERC-721 NFTs   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS                               │
│  MongoDB + Redis + Azure Blob + Stripe + Web PubSub            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Métricas Generales del Proyecto

| Métrica | Valor |
|---------|-------|
| **Total de Repositorios** | 16 |
| **Frontends (Web + Mobile)** | 7 |
| **Backends (APIs)** | 4 |
| **Smart Contracts** | 1 |
| **Utilidades e Integraciones** | 1 |
| **Landing Pages** | 2 (1 deprecado) |
| **Repositorios Deprecados** | 2 (landingpage, futura-tickets) |
| **Líneas de Código (aprox.)** | +150,000 |
| **Stack Principal** | Next.js 15, NestJS 10/11, Solidity 0.8.25 |

### 1.3 Usuarios del Sistema

| Rol | Descripción | Interfaz |
|-----|-------------|----------|
| **Comprador (USER)** | Usuario final que compra tickets | Marketplace Web/Mobile |
| **Promotor (PROMOTER)** | Organizador de eventos | Admin Panel |
| **Personal de Acceso (ACCESS)** | Control de acceso en eventos | Access App Mobile |
| **Administrador (ADMIN)** | Administración del sistema | Admin Panel |

### 1.4 Funcionalidades Principales

✅ **Marketplace de Tickets**
- Búsqueda y filtrado de eventos
- Compra de tickets con Stripe
- Sistema de reventa (mercado secundario)
- Transferencia de tickets

✅ **Panel de Administración**
- Gestión completa de eventos (CRUD)
- Analytics y estadísticas en tiempo real
- Gestión de clientes y ventas
- Campañas de marketing (promo codes, coupons)

✅ **Control de Acceso**
- Validación de tickets mediante QR
- Check-in en tiempo real
- Notificaciones WebSocket
- Historial de accesos

✅ **Blockchain (NFT Tickets)**
- Tickets como NFTs ERC-721
- Smart contracts por evento (Factory Pattern)
- Validación de ownership on-chain
- Transferencias blockchain

---

## 2. MAPA DE ARQUITECTURA GLOBAL

### 2.1 Diagrama de Arquitectura Completa

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE USUARIOS                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Compradores │  │  Promotores  │  │   Personal   │  │    Admins    │      │
│  │   (Web/App)  │  │ (Admin Panel)│  │   de Acceso  │  │  (Dashboard) │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                 │              │
└─────────┼─────────────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │                 │
          │                 │                 │                 │
┌─────────▼─────────────────▼─────────────────▼─────────────────▼──────────────┐
│                         CAPA DE PRESENTACIÓN                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐         │
│  │ futura-market-    │  │ futura-tickets-   │  │ futura-access-app │         │
│  │ place-v2          │  │ admin             │  │ (Mobile)          │         │
│  │ Next.js 15 + React│  │ Next.js 15 + Ant  │  │ Expo 52 + RN      │         │
│  │ Tailwind + Radix  │  │ Design + Socket.IO│  │ QR Scanner        │         │
│  └────────┬──────────┘  └────────┬──────────┘  └────────┬──────────┘         │
│           │                      │                      │                    │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐         │
│  │ futura-tickets-   │  │ futura-tickets-   │  │ futura-paginator  │         │
│  │ event             │  │ access-app        │  │ (Landing Page)    │         │
│  │ Next.js 15        │  │ Expo 52 + RN      │  │ Next.js 15        │         │
│  │ Event-specific    │  │ QR Scanner        │  │ Minimal           │         │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘         │
│                                                                                │
└────────────────────────────────────────┬───────────────────────────────────────┘
                                         │
                                         │ HTTP REST + WebSockets
                                         │
┌────────────────────────────────────────▼───────────────────────────────────────┐
│                         CAPA DE APLICACIÓN (APIs)                              │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │                     futura-tickets-admin-api                        │      │
│  │  NestJS 10 | MongoDB | Stripe | WebSockets | CronJobs             │      │
│  │  - CRUD eventos completo                                            │      │
│  │  - Gestión de tickets (sales)                                       │      │
│  │  - Analytics y estadísticas                                         │      │
│  │  - Notificaciones en tiempo real                                    │      │
│  │  - CronJob: estado de eventos cada 15 min                           │      │
│  │  9,485 líneas | Puerto 3000                                         │      │
│  └────────────────────────────┬────────────────────────────────────────┘      │
│                               │                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │                   futura-market-place-api                           │      │
│  │  NestJS 10 | MongoDB | Stripe Payment Intents | Bull Queues        │      │
│  │  - Procesamiento de pagos (Stripe)                                  │      │
│  │  - Creación de órdenes                                              │      │
│  │  - Sistema de emails transaccionales (9 tipos)                      │      │
│  │  - Bull queues para emails                                          │      │
│  │  - Blockchain integration (ethers.js, viem)                         │      │
│  │  Puerto 3000                                                         │      │
│  └────────────────────────────┬────────────────────────────────────────┘      │
│                               │                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │                      futura-access-api                              │      │
│  │  NestJS 11 | MongoDB | WebSocket (Azure PubSub) | JWT Auth         │      │
│  │  - Validación de tickets (check-in)                                 │      │
│  │  - Control de acceso a eventos                                      │      │
│  │  - WebSocket para notificaciones en vivo                            │      │
│  │  - Gestión de promocodes                                            │      │
│  │  - Historial de accesos                                             │      │
│  │  Puerto 3000                                                         │      │
│  └────────────────────────────┬────────────────────────────────────────┘      │
│                               │                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐      │
│  │                   futura-tickets-rest-api                           │      │
│  │  NestJS | MongoDB | API REST genérica                               │      │
│  │  - API complementaria                                                │      │
│  │  🚧 TODO: Determinar si es redundante con admin-api                │      │
│  └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                │
└────────────────────────────────────────┬───────────────────────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
┌────────────────────────▼────────┐  ┌──────────────────▼──────────────────┐
│     CAPA DE BLOCKCHAIN          │  │     CAPA DE DATOS Y SERVICIOS      │
├─────────────────────────────────┤  ├─────────────────────────────────────┤
│                                 │  │                                     │
│  futura-tickets-contracts-v2    │  │  ┌────────────────────────────┐    │
│  Solidity 0.8.25               │  │  │ MongoDB Atlas              │    │
│                                 │  │  │ - accounts                 │    │
│  ┌─────────────────────┐        │  │  │ - events                   │    │
│  │ FuturaEventFactory  │        │  │  │ - orders                   │    │
│  │ (Factory Pattern)   │        │  │  │ - sales (tickets)          │    │
│  └──────────┬──────────┘        │  │  │ - promoters                │    │
│             │                   │  │  │ - notifications            │    │
│             │ deploys           │  │  └────────────────────────────┘    │
│             ▼                   │  │                                     │
│  ┌─────────────────────┐        │  │  ┌────────────────────────────┐    │
│  │   FuturaEvent       │        │  │  │ Redis (Bull Queues)        │    │
│  │   (ERC-721)         │        │  │  │ - Mail queues              │    │
│  │   1 contract/evento │        │  │  │ - Job processing           │    │
│  └─────────────────────┘        │  │  └────────────────────────────┘    │
│                                 │  │                                     │
│  Features:                      │  │  ┌────────────────────────────┐    │
│  - Mintear tickets NFT          │  │  │ Stripe                     │    │
│  - Transferencias              │  │  │ - Payment Intents          │    │
│  - Validación ownership         │  │  │ - Webhooks                 │    │
│  - Quema al check-in (opt)      │  │  └────────────────────────────┘    │
│                                 │  │                                     │
│  🚧 TODO: Integración activa    │  │  ┌────────────────────────────┐    │
│                                 │  │  │ Azure Blob Storage         │    │
│                                 │  │  │ - Event images             │    │
│                                 │  │  │ - Ticket images            │    │
│                                 │  │  └────────────────────────────┘    │
│                                 │  │                                     │
│                                 │  │  ┌────────────────────────────┐    │
│                                 │  │  │ Azure Web PubSub           │    │
│                                 │  │  │ - WebSocket scaling        │    │
│                                 │  │  │ - Real-time notifications  │    │
│                                 │  │  └────────────────────────────┘    │
│                                 │  │                                     │
└─────────────────────────────────┘  └─────────────────────────────────────┘
```

### 2.2 Flujo de Datos General

```
COMPRA DE TICKET (Flujo Completo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usuario → Marketplace Web → marketplace-api → Stripe Payment Intent
                                    ↓
                              MongoDB Order (PENDING)
                                    ↓
                          Stripe Payment Success
                                    ↓
                              Webhook → admin-api
                                    ↓
                         Order.status = SUCCEEDED
                                    ↓
                          Create Sales (Tickets)
                                    ↓
                            Generate QR Codes
                                    ↓
                    🚧 TODO: Mint NFT (contracts-v2)
                                    ↓
                          Send Email (Bull Queue)
                                    ↓
                      WebSocket Notification → Admin Panel


VALIDACIÓN DE ACCESO (Check-in)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Personal ACCESS → Escanea QR → Access App → access-api
                                                ↓
                                    Decode Sale ID from QR
                                                ↓
                                    Query Sale from MongoDB
                                                ↓
                                    Check status:
                                    - OPEN → GRANTED ✅
                                    - CLOSED → DENIED ❌ (ya usado)
                                    - SALE → DENIED ❌ (en reventa)
                                                ↓
                            Update Sale.status = CLOSED
                                                ↓
                            Update Sale.history (GRANTED)
                                                ↓
                    WebSocket Notification → Admin Panel
                                                ↓
                            Response to Access App
```

---

## 3. INVENTARIO DETALLADO DE REPOSITORIOS

### 3.1 CATEGORÍA: FRONTENDS WEB (Next.js)

#### 3.1.1 futura-market-place-v2 (Marketplace Principal)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Frontend Web |
| **Framework** | Next.js 15.2.2 + React 19 |
| **UI Library** | Radix UI + Tailwind CSS 3.4.17 |
| **Propósito** | Marketplace de tickets para usuarios finales |
| **Puerto** | 3000 |
| **Líneas de código** | ~3,818 líneas (componentes) |
| **Deployment** | Docker + Google Cloud Run |
| **Estado** | ✅ Activo (Producción) |

**Stack Técnico:**
- Next.js App Router con RSC (React Server Components)
- TypeScript 5
- Stripe (@stripe/react-stripe-js 1.10.0)
- NextAuth 4.24.11 + Google OAuth
- React Leaflet 5.0.0 (mapas)
- React Hook Form + Zod (validación)
- Socket.IO Client (notificaciones)

**Funcionalidades:**
- Búsqueda y filtrado de eventos
- Carrito de compras (CartContext + localStorage)
- Checkout con Stripe Payment Element
- Sistema de reventa de tickets
- Transferencia de tickets
- Gestión de cuenta de usuario
- Visualización de tickets comprados con QR

**APIs Consumidas:**
- `NEXT_PUBLIC_FUTURA` - Events, Orders, Sales
- `NEXT_PUBLIC_FUTURA_API` - Auth, Stripe config
- `NEXT_PUBLIC_REFACTOR_RESALE_API` - Resale, Transfer
- `NEXT_PUBLIC_BLOB_URL` - Azure Blob Storage (imágenes)

**Issues Conocidos:**
- ❌ Bug en GlobalContext: spread de arrays como objetos (contexts/global-context.tsx:36-39)
- ⚠️ Build ignora errores TypeScript/ESLint (`next.config.mjs`)
- ⚠️ Token JWT en localStorage (vulnerabilidad XSS)
- ⚠️ Google Client ID hardcoded (app/layout.tsx:30)
- ⚠️ 0% test coverage

**Archivos Clave:**
- `app/shared/services.tsx` - 488 líneas de API calls
- `app/shared/interface.ts` - 470 líneas de interfaces TypeScript
- `components/checkout/payment.tsx` - 197 líneas (Stripe integration)
- `contexts/cart-context.tsx` - 167 líneas (carrito de compras)

---

#### 3.1.2 futura-tickets-admin (Panel de Administración)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Frontend Web (Admin Panel) |
| **Framework** | Next.js 15.0.3 + React 19 RC |
| **UI Library** | Ant Design 5.22.0 |
| **Propósito** | Panel de gestión para promotores |
| **Puerto** | 3001 |
| **Líneas de código** | 11,343 líneas |
| **Deployment** | Docker |
| **Estado** | ✅ Activo (Producción) |

**Stack Técnico:**
- Next.js App Router
- TypeScript 5
- Ant Design 5.22.0 (UI components)
- Socket.IO Client 4.8.1 (3 conexiones simultáneas)
- Google OAuth (@react-oauth/google)
- React Google Charts 5.2.1 (analytics)
- Sass 1.80.6

**Funcionalidades:**
- CRUD completo de eventos
- Gestión de ventas y tickets
- Analytics con charts en tiempo real
- Gestión de clientes (compradores)
- Solicitudes de pago y withdrawals
- Campañas de marketing (promo codes, coupons)
- Gestión de invitaciones
- Sistema de notificaciones
- Control de acceso (asignar personal ACCESS)

**APIs Consumidas:**
- `NEXT_PUBLIC_FUTURA` - Admin API principal
- WebSockets a 3 servicios diferentes:
  - Admin events socket
  - Access control socket
  - Marketplace socket

**Issues Conocidos:**
- ⚠️ Services file enorme: `shared/services.tsx` con 28,142 líneas
- ⚠️ Interfaces file: `shared/interfaces.tsx` con 9,690 líneas
- ⚠️ Token en localStorage (seguridad)
- ⚠️ 0% test coverage
- ⚠️ Sin validación de formularios con librerías
- ⚠️ Componentes muy grandes (Event: 13 archivos)

**Archivos Clave:**
- `shared/services.tsx` - 28,142 líneas (❗ REFACTORIZAR)
- `shared/interfaces.tsx` - 9,690 líneas (❗ REFACTORIZAR)
- `components/GlobalStateProvider/GlobalStateProvider.tsx` - Estado global
- `components/Socket.tsx` - Socket.IO para admin
- `components/SocketAccess.tsx` - Socket.IO para access
- `components/SocketMarketPlace.tsx` - Socket.IO para marketplace

---

#### 3.1.3 futura-tickets-event (Venta Específica por Evento)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Frontend Web (Event-specific) |
| **Framework** | Next.js 15 + React 19 |
| **UI Library** | Tailwind CSS |
| **Propósito** | Página de venta de tickets para un evento específico |
| **Estado** | ✅ Activo |

**Stack Técnico:**
- Next.js 15
- TypeScript
- Stripe integration
- Google Maps integration

**Funcionalidades:**
- Venta de tickets de un solo evento
- Checkout con Stripe
- Información detallada del evento
- Mapa de ubicación

**Uso:**
- Se despliega una instancia por evento importante
- URL personalizada por evento

---

#### 3.1.4 futura-paginator (Landing Page Actual)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Landing Page |
| **Framework** | Next.js 15.2.2 |
| **UI Library** | Tailwind CSS |
| **Propósito** | Landing page institucional |
| **Dependencias** | Solo 3 (React, Next, Tailwind) |
| **Estado** | ✅ Activo |

**Características:**
- Diseño minimalista
- Performance optimizada
- SEO optimizado

**Reemplaza a:** `landingpage` (deprecado)

---

#### 3.1.5 landingpage (DEPRECADO)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Landing Page |
| **Framework** | React 18 + CRA |
| **UI Library** | Ant Design |
| **Estado** | ❌ DEPRECADO |
| **Reemplazado por** | futura-paginator |

**Razón de deprecación:** Reemplazado por futura-paginator (Next.js)

---

#### 3.1.6 futura-tickets (Marketplace Legacy - DEPRECADO)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Frontend Web (Marketplace v1) |
| **Framework** | React 18 + CRA |
| **UI Library** | Ant Design |
| **Estado** | ❌ DEPRECADO |
| **Reemplazado por** | futura-market-place-v2 |

**Razón de deprecación:** Reemplazado por futura-market-place-v2 (Next.js)

---

### 3.2 CATEGORÍA: APPS MÓVILES (React Native + Expo)

#### 3.2.1 futura-access-app (Control de Acceso Mobile)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Mobile App (iOS/Android) |
| **Framework** | Expo 52 + React Native 0.76 |
| **Propósito** | App para personal de acceso (scanear QR) |
| **Estado** | ✅ Activo |

**Stack Técnico:**
- Expo 52
- React Native 0.76
- TypeScript
- QR Scanner
- WebSocket client

**Funcionalidades:**
- Login de personal ACCESS
- Escaneo de QR de tickets
- Validación en tiempo real
- Lista de asistentes
- Notificaciones push

**API Consumida:**
- futura-access-api (validación de tickets)

**Bug Crítico Conocido:**
- ❌ QR Scanner usa URL hardcoded en lugar de leer datos del QR escaneado

---

#### 3.2.2 futura-tickets-access-app (Variante de Access App)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Mobile App (iOS/Android) |
| **Framework** | Expo 52 + React Native 0.76 |
| **Propósito** | Otra variante de app de acceso |
| **Estado** | ✅ Activo |

**Nota:** 🚧 TODO: Clarificar diferencia con futura-access-app

---

### 3.3 CATEGORÍA: BACKENDS (APIs NestJS)

#### 3.3.1 futura-tickets-admin-api (API Principal de Administración)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Backend API |
| **Framework** | NestJS 10.0.0 |
| **Base de Datos** | MongoDB + Mongoose 8.4.3 |
| **Propósito** | API principal para gestión de eventos, órdenes, pagos |
| **Puerto** | 3000 |
| **Líneas de código** | 9,485 líneas totales |
| **Estado** | ✅ Activo (Producción) |

**Stack Técnico:**
- NestJS 10 + TypeScript 5.1.3
- MongoDB + Mongoose
- Stripe 17.4.0
- Bull 4.14.0 + BullMQ 5.8.3 (job queues)
- Socket.IO 4.7.5 + Azure Web PubSub
- JWT Auth (passport-jwt)
- ethers 6.13.1 + viem 2.20.0 (blockchain)

**Módulos Principales:**
- **Event Module** (65,917 líneas) - CRUD eventos, tickets, estadísticas
  - `admin-event.service.ts` - 35,424 líneas (❗ REFACTORIZAR)
  - `user-event.service.ts` - 20,497 líneas
- **CronJobs Module** - Ejecuta cada 15 min para actualizar estados
- **Auth Module** - JWT + Passport
- **Stripe Module** - Payment Intents
- **Mail Module** - Emails transaccionales
- **Sales Module** - Gestión de tickets vendidos
- **Orders Module** - Órdenes de compra
- **Payments Module** - Pagos a promotores
- **Socket Module** - WebSocket notifications

**Funcionalidades:**
- CRUD completo de eventos
- Gestión de tickets (sales) con estados
- Sistema de CronJobs (cada 15 min)
  - Actualiza eventos a LIVE
  - ⚠️ Expiración de eventos está COMENTADA
- Stripe integration
- WebSockets para notificaciones
- Analytics y estadísticas

**Issues Conocidos:**
- ❌ CORS completamente abierto (main.ts:14) - SEGURIDAD
- ❌ CronJob de expiración deshabilitado (cron-jobs.service.ts:31)
- ⚠️ admin-event.service.ts con 35,424 líneas (REFACTORIZAR)
- ⚠️ 0% test coverage
- ⚠️ README genérico
- ⚠️ @ts-ignore en app.module.ts:49

**Variables de Entorno:**
```
MONGO_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY,
AZURE_STORAGE_CONNECTION_STRING, REDIS_HOST, REDIS_PORT,
THROTTLE_TTL, THROTTLE_LIMIT, MAIL_HOST, MAIL_PORT
```

---

#### 3.3.2 futura-market-place-api (API de Marketplace y Pagos)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Backend API |
| **Framework** | NestJS 10.x |
| **Base de Datos** | MongoDB + Mongoose 8.4.3 |
| **Propósito** | Procesamiento de pagos, órdenes, emails |
| **Puerto** | 3000 |
| **Estado** | ✅ Activo (Producción) |

**Stack Técnico:**
- NestJS 10 + TypeScript 5.1.3
- MongoDB + Mongoose
- Stripe 17.4.0 (Payment Intents)
- Bull 4.14.0 + BullMQ 5.8.3
- Socket.IO 4.7.5 + Azure Web PubSub
- ethers 6.13.1 + viem 2.20.0
- qrcode 1.5.4
- @nestjs/mailer 2.0.2 + EJS 3.1.10

**Módulos Principales:**
- **Orders Module** - Gestión de órdenes
- **Stripe Module** - Payment Intents, webhooks
- **Sales Module** - Tickets vendidos
- **Mail Module** - Sistema de emails (1,761 líneas)
  - 9 tipos diferentes de emails
  - Bull queues para envío asíncrono
  - Templates HTML inline
- **Socket Module** - Notificaciones tiempo real
- **Event Module** - Gestión de eventos
- **Account Module** - Cuentas de usuario

**Funcionalidades:**
- Crear Payment Intents (Stripe)
- Procesar webhooks de Stripe
- Crear órdenes de compra
- Crear tickets (sales) con QR codes
- Envío de emails transaccionales:
  1. Confirmación de orden
  2. Confirmación de reventa
  3. Cancelación de reventa
  4. Ticket vendido
  5. Transferencia (origen)
  6. Transferencia (destino)
  7. Confirmación de invitación
  8. Confirmación de cuenta
  9. Recuperar cuenta
  10. Verificar cuenta
- WebSocket notifications

**Issues Conocidos:**
- ⚠️ Mail service con 1,761 líneas (REFACTORIZAR)
- ⚠️ Password en plaintext en email de confirmación (SEGURIDAD)
- ⚠️ URL hardcoded a localhost en verifyAccount email
- ⚠️ ResaleProcessor y TransferProcessor vacíos (solo comentarios)
- ⚠️ Blockchain integration no activa (ethers/viem instalados pero no usados)

**Bull Queues:**
- `new-account-mail`
- `ticket-resale-mail`
- `ticket-transfer-from-mail`
- `ticket-transfer-to-mail`
- `recover-account-mail`
- `resale-ticket` (vacío)
- `transfer-ticket` (vacío)

---

#### 3.3.3 futura-access-api (API de Control de Acceso)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Backend API (Microservicio) |
| **Framework** | NestJS 11.0.1 |
| **Base de Datos** | MongoDB + Mongoose 11.x |
| **Propósito** | Validación de tickets y control de acceso |
| **Puerto** | 3000 |
| **Estado** | ✅ Activo (Producción) |

**Stack Técnico:**
- NestJS 11 + TypeScript 5.7.3
- MongoDB + Mongoose
- Socket.IO 4.8.1 + Azure Web PubSub
- Passport JWT
- bcryptjs
- @nestjs/throttler (rate limiting)

**Módulos Principales:**
- **Account Module** - Login de personal ACCESS
- **Auth Module** - JWT tokens, guards, decoradores
- **Event Module** - Validación de acceso
- **Sales Module** - Gestión de tickets
- **Socket Module** - WebSocket con Azure PubSub
- **Notifications Module** - Sistema de notificaciones
- **Promoter Module** - Gestión de promotores

**Funcionalidades:**
- Login de personal ACCESS con JWT
- Validación de tokens
- Validación de acceso (check-in)
  - Endpoint: `PATCH /events/access`
  - Valida estado del ticket (OPEN, CLOSED, SALE, EXPIRED)
  - Actualiza historial de accesos
  - Emite evento WebSocket
- Listado de asistentes
- Gestión de promocodes (CRUD)
- Notificaciones en tiempo real vía WebSocket

**Flujo de Validación:**
```
1. Personal ACCESS escanea QR (sale._id)
2. API verifica status del ticket:
   - OPEN → GRANTED ✅ → Marca como CLOSED
   - CLOSED → DENIED ❌ (ya usado)
   - SALE → DENIED ❌ (en venta secundaria)
   - EXPIRED → DENIED ❌ (expirado)
3. Actualiza historial (history)
4. Emite WebSocket al promoter
5. Retorna resultado al personal ACCESS
```

**Issues Conocidos:**
- ❌ CORS no configurado (seguridad)
- ❌ Helmet.js no implementado (seguridad)
- ⚠️ 0% test coverage
- ⚠️ Swagger no configurado
- ⚠️ Blockchain validation no implementada (campos existen pero no se validan)
- ⚠️ Notifications Module schema definido pero sin endpoints

---

#### 3.3.4 futura-tickets-rest-api (API REST Genérica)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Backend API |
| **Framework** | NestJS |
| **Base de Datos** | MongoDB |
| **Propósito** | API REST complementaria |
| **Estado** | ✅ Activo (🚧 Verificar uso) |

**Nota:** 🚧 TODO: Determinar si es redundante con futura-tickets-admin-api

---

### 3.4 CATEGORÍA: SMART CONTRACTS (Blockchain)

#### 3.4.1 futura-tickets-contracts-v2 (Smart Contracts Solidity)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Smart Contracts |
| **Lenguaje** | Solidity 0.8.25 |
| **Framework** | Hardhat |
| **Propósito** | NFT tickets ERC-721 con Factory Pattern |
| **Estado** | ✅ Desarrollado (🚧 Integración pendiente) |

**Stack Técnico:**
- Solidity 0.8.25
- Hardhat (dev environment)
- OpenZeppelin Contracts 5.1.0
  - ERC721 (NFTs)
  - Ownable (control de acceso)
  - ReentrancyGuard (seguridad)
- ethers.js

**Contratos Principales:**

1. **FuturaEventFactory.sol**
   - Factory Pattern para deploy de contratos por evento
   - Función: `createEvent()` → deploys FuturaEvent
   - Registro de todos los eventos creados
   - Ownership del factory

2. **FuturaEvent.sol**
   - ERC-721 NFT standard
   - 1 contrato por evento
   - Minteo de tickets como NFTs
   - Transfer de tickets
   - Burn de tickets (opcional al check-in)
   - Metadata on-chain/IPFS

**Funcionalidades:**
- Mintear tickets como NFTs (tokenId único)
- Transferir tickets entre wallets
- Validar ownership on-chain
- Quemar NFT al hacer check-in (opcional)
- Royalties en mercado secundario

**Estado de Integración:**
- ⚠️ Contratos desarrollados y testeados
- ⚠️ Integración con APIs NO activa
- ⚠️ ethers.js y viem instalados en APIs pero no usados
- ⚠️ Campos blockchain en schemas (address, hash, tokenId, blockNumber) existen pero no se populan

**🚧 TODO:**
- Integrar deploy automático de contratos al crear evento
- Mintear NFTs al completar pago
- Validar ownership on-chain antes de check-in
- Sincronizar estado blockchain ↔ MongoDB

---

### 3.5 CATEGORÍA: UTILIDADES E INTEGRACIONES

#### 3.5.1 integrations-scripts (Scripts de Integración)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Utilidades |
| **Lenguaje** | TypeScript |
| **Propósito** | Scripts de integración y migración |
| **Estado** | ✅ Activo |

**Funcionalidades:**
- CSV parsing (import masivo de datos)
- Scripts de migración de datos
- Utilidades de integración entre sistemas
- Scripts de testing

---

## 4. RELACIONES E INTEGRACIONES ENTRE REPOSITORIOS

### 4.1 Diagrama de Dependencias

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DIAGRAMA DE DEPENDENCIAS                      │
└────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────┐
                           │   COMPRADORES   │
                           └────────┬────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
            ┌────────▼────────┐    │    ┌─────────▼────────┐
            │ marketplace-v2  │    │    │ tickets-event    │
            │ (Next.js 15)    │    │    │ (Next.js 15)     │
            └────────┬────────┘    │    └─────────┬────────┘
                     │              │              │
                     │    ┌─────────▼────────┐    │
                     │    │   paginator      │    │
                     │    │  (Landing Page)  │    │
                     │    └──────────────────┘    │
                     │                            │
                     └──────────┬─────────────────┘
                                │
                                │ HTTP REST
                                │
                     ┌──────────▼─────────────┐
                     │ marketplace-api        │
                     │ (Stripe, Orders, Mail) │
                     └──────────┬─────────────┘
                                │
                                │ Shared DB
                                │
                     ┌──────────▼─────────────┐
                     │ admin-api              │
                     │ (Events, Sales, Crons) │
                     └──────────┬─────────────┘
                                │
                     ┌──────────┴─────────────┐
                     │                        │
          ┌──────────▼──────────┐  ┌─────────▼──────────┐
          │ tickets-admin       │  │ access-api         │
          │ (Admin Panel)       │  │ (Check-in)         │
          └──────────┬──────────┘  └─────────┬──────────┘
                     │                       │
                     │           ┌───────────┘
                     │           │
          ┌──────────▼───────────▼──────────┐
          │        PERSONAL ACCESS           │
          └──────────┬───────────┬──────────┘
                     │           │
        ┌────────────▼──┐   ┌────▼──────────────┐
        │ access-app    │   │ tickets-access-app│
        │ (Mobile)      │   │ (Mobile)          │
        └───────────────┘   └───────────────────┘


BLOCKCHAIN LAYER (NO CONECTADO ACTUALMENTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

               ┌─────────────────────┐
               │ contracts-v2        │
               │ (Solidity)          │
               └──────────┬──────────┘
                          │
                          │ 🚧 TODO: Integrar
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────┐                 ┌────────▼───────┐
│ admin-api      │                 │ marketplace-api│
│ (ethers.js)    │                 │ (viem)         │
└────────────────┘                 └────────────────┘


SERVICIOS COMPARTIDOS
━━━━━━━━━━━━━━━━━━━━━

┌─────────────────┐
│   MongoDB       │ ◄─── admin-api
│   (Shared DB)   │ ◄─── marketplace-api
│                 │ ◄─── access-api
│                 │ ◄─── rest-api
└─────────────────┘

┌─────────────────┐
│   Redis         │ ◄─── marketplace-api (Bull queues)
│   (Bull)        │ ◄─── admin-api (Bull queues)
└─────────────────┘

┌─────────────────┐
│   Stripe        │ ◄─── marketplace-api (Payment Intents)
│                 │ ◄─── admin-api (webhooks)
└─────────────────┘

┌─────────────────┐
│ Azure Web       │ ◄─── access-api (WebSocket scaling)
│ PubSub          │ ◄─── admin-api (notifications)
│                 │ ◄─── marketplace-api (updates)
└─────────────────┘

┌─────────────────┐
│ Azure Blob      │ ◄─── admin-api (event images)
│ Storage         │ ◄─── marketplace-api (ticket images)
└─────────────────┘
```

### 4.2 Matriz de Dependencias

| Repositorio | Consume APIs | Comparte DB | Integración Blockchain | WebSocket |
|-------------|--------------|-------------|------------------------|-----------|
| **marketplace-v2** | marketplace-api, admin-api, resale-api | ❌ | ❌ | ❌ |
| **tickets-event** | admin-api, marketplace-api | ❌ | ❌ | ❌ |
| **tickets-admin** | admin-api | ❌ | ❌ | ✅ (3 conexiones) |
| **access-app** | access-api | ❌ | ❌ | ✅ |
| **tickets-access-app** | access-api | ❌ | ❌ | ✅ |
| **admin-api** | - | ✅ MongoDB | ⚠️ (ethers instalado) | ✅ |
| **marketplace-api** | - | ✅ MongoDB | ⚠️ (viem instalado) | ✅ |
| **access-api** | - | ✅ MongoDB | ❌ | ✅ (Azure PubSub) |
| **rest-api** | - | ✅ MongoDB | ❌ | ❌ |
| **contracts-v2** | - | ❌ | ✅ (Hardhat) | ❌ |

### 4.3 APIs y Endpoints por Repositorio

#### marketplace-api
```
POST   /events/create-order         → Crear orden Stripe
GET    /events                      → Listar eventos
GET    /events/:id                  → Detalle evento
GET    /orders/:paymentId           → Obtener orden
GET    /user/profile                → Perfil usuario
PATCH  /user/events/resale          → Crear reventa
PATCH  /user/events/transfer        → Transferir ticket
GET    /stripe/config               → Stripe publishable key
```

#### admin-api
```
GET    /admin/events                → Listar eventos (admin)
POST   /admin/events                → Crear evento
PATCH  /admin/events/:id            → Editar evento
DELETE /admin/events/:id            → Eliminar evento
PATCH  /admin/launch/:id            → Lanzar evento (CREATED → LAUNCHED)
GET    /sales/:eventId              → Ventas de un evento
GET    /orders                      → Órdenes de compra
GET    /analytics/event/:id         → Analytics de evento
GET    /analytics/promoter          → Analytics de promotor
```

#### access-api
```
POST   /accounts/login              → Login personal ACCESS
POST   /accounts/validate           → Validar token JWT
GET    /events/attendants/:event    → Lista de asistentes
PATCH  /events/access               → Validar ticket (check-in) ⭐
GET    /events/promocodes/:eventId  → Listar promocodes
POST   /events/promocodes/create    → Crear promocode
DELETE /events/promocodes/:eventId/:code → Eliminar promocode
```

### 4.4 Flujos de Datos Entre Repositorios

#### Flujo 1: Compra de Ticket

```
marketplace-v2 (Frontend)
    │
    │ POST /create-payment-intent
    ▼
marketplace-api
    │
    │ 1. Crear PaymentIntent en Stripe
    │ 2. Crear Order en MongoDB (status: PENDING)
    │ 3. Retornar clientSecret
    ▼
marketplace-v2
    │
    │ Usuario completa pago en Stripe Elements
    ▼
Stripe
    │
    │ Webhook: payment_intent.succeeded
    ▼
admin-api (webhook handler)
    │
    │ 1. Buscar Order por paymentId
    │ 2. Actualizar Order.status = SUCCEEDED
    │ 3. Crear N Sales (tickets)
    │ 4. Generar QR codes únicos
    │ 5. 🚧 TODO: Mintear NFTs (contracts-v2)
    │ 6. Agregar job a Bull queue (mail)
    ▼
marketplace-api (Bull processor)
    │
    │ Enviar email de confirmación con tickets
    ▼
Cliente (recibe email con QR codes)
```

#### Flujo 2: Check-in en Evento

```
access-app (Mobile)
    │
    │ Personal ACCESS escanea QR
    │
    │ PATCH /events/access
    │ Body: { sale: "sale_id_from_qr" }
    ▼
access-api
    │
    │ 1. Decode JWT token (verificar promoter)
    │ 2. Query Sale from MongoDB
    │ 3. Verificar status:
    │    - OPEN → Permitir acceso ✅
    │    - CLOSED → Denegar (ya usado) ❌
    │    - SALE → Denegar (en reventa) ❌
    │    - EXPIRED → Denegar (expirado) ❌
    │ 4. Actualizar Sale.status = CLOSED
    │ 5. Actualizar Sale.history (activity: GRANTED)
    │ 6. Emitir evento WebSocket (Azure PubSub)
    ▼
tickets-admin (Panel)
    │
    │ WebSocket notification: new check-in
    │ Actualiza dashboard en tiempo real
    │
    ▼
access-app (Mobile)
    │
    │ Muestra resultado: GRANTED o DENIED
    │ Con nombre del asistente y tipo de ticket
```

#### Flujo 3: Creación de Evento con Blockchain

```
tickets-admin (Frontend)
    │
    │ Formulario de crear evento
    │
    │ POST /admin/events
    │ Body: { name, description, tickets, location, ... }
    ▼
admin-api
    │
    │ 1. Upload imagen a Azure Blob Storage
    │ 2. Crear Event en MongoDB (status: CREATED)
    │ 3. 🚧 TODO: Deploy smart contract
    │    ├─> FuturaEventFactory.createEvent()
    │    ├─> Obtener address del contrato
    │    ├─> Actualizar Event.address = contract_address
    │    └─> Actualizar Event.blockNumber, Event.hash
    │ 4. Retornar evento creado
    ▼
tickets-admin (Frontend)
    │
    │ Evento creado (status: CREATED)
    │
    │ Promotor puede lanzarlo cuando esté listo
    │
    │ PATCH /admin/launch/:id
    ▼
admin-api
    │
    │ Actualizar Event.status = LAUNCHED
    │ Evento visible en marketplace
    ▼
marketplace-v2 (Frontend)
    │
    │ GET /events
    │ Muestra eventos con status: LAUNCHED o LIVE
```

---

## 5. FLUJOS PRINCIPALES DEL SISTEMA

### 5.1 Flujo de Peticiones (Request Flow)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       REQUEST FLOW DIAGRAM                          │
└─────────────────────────────────────────────────────────────────────┘

MARKETPLACE (Compra)
━━━━━━━━━━━━━━━━━━━━

Usuario → Marketplace Web → Next.js Server → API Routes (BFF)
                                                   │
                                                   │ Proxy
                                                   ▼
                                          marketplace-api
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                            ┌───────▼────┐  ┌──────▼─────┐  ┌────▼─────┐
                            │ MongoDB    │  │  Stripe    │  │  Redis   │
                            │ (Orders)   │  │ (Payment)  │  │  (Bull)  │
                            └────────────┘  └────────────┘  └──────────┘


ADMIN PANEL (Gestión)
━━━━━━━━━━━━━━━━━━━━

Promotor → Admin Panel → Next.js Server → API Routes (BFF)
                                                   │
                                                   │ Proxy
                                                   ▼
                                            admin-api
                                                   │
                                    ┌──────────────┼──────────────┐
                                    │              │              │
                            ┌───────▼────┐  ┌──────▼─────┐  ┌────▼─────┐
                            │ MongoDB    │  │  Azure     │  │ Socket.IO│
                            │ (Events)   │  │  Blob      │  │ (PubSub) │
                            └────────────┘  └────────────┘  └──────────┘


ACCESS CONTROL (Check-in)
━━━━━━━━━━━━━━━━━━━━━━━━

Personal → Access App → React Native → Axios HTTP
                                           │
                                           ▼
                                      access-api
                                           │
                            ┌──────────────┼──────────────┐
                            │              │              │
                    ┌───────▼────┐  ┌──────▼─────┐  ┌────▼─────┐
                    │ MongoDB    │  │  Azure     │  │ Socket.IO│
                    │ (Sales)    │  │  Web       │  │ (Emit)   │
                    │            │  │  PubSub    │  │          │
                    └────────────┘  └────────────┘  └────┬─────┘
                                                          │
                                                          │ WebSocket
                                                          ▼
                                                   Admin Panel
                                                   (Real-time update)
```

### 5.2 Flujo de Eventos (Event Flow)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EVENT FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────────┘

ESTADOS DE EVENTO
━━━━━━━━━━━━━━━━━

                        ┌──────────┐
                        │   HOLD   │
                        └─────┬────┘
                              │
                              │ Promotor crea evento
                              ▼
                        ┌──────────┐
                        │ CREATED  │
                        └─────┬────┘
                              │
                              │ Promotor lanza evento (PATCH /launch)
                              ▼
                        ┌──────────┐
                        │ LAUNCHED │ ◄─── Visible en marketplace
                        └─────┬────┘
                              │
                              │ CronJob (cada 15 min)
                              │ dateTime.startDate alcanzado
                              ▼
                        ┌──────────┐
                        │   LIVE   │ ◄─── Evento en curso
                        └─────┬────┘
                              │
                              │ CronJob (⚠️ DESHABILITADO)
                              │ dateTime.endDate alcanzado
                              ▼
                        ┌──────────┐
                        │  CLOSED  │ ◄─── Evento finalizado
                        └──────────┘
                              │
                              │ Todos los tickets → EXPIRED
                              ▼


ESTADOS DE TICKET (Sale)
━━━━━━━━━━━━━━━━━━━━━━━

                        ┌──────────┐
                        │ PENDING  │ ◄─── Orden creada
                        └─────┬────┘
                              │
                              │ Pago procesando
                              ▼
                       ┌───────────┐
                       │PROCESSING │ ◄─── Stripe procesando
                       └─────┬─────┘
                             │
                             │ Pago exitoso
                             ▼
                       ┌──────────┐
                       │   OPEN   │ ◄─── Válido para acceso
                       └─────┬────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
        ┌───────▼────┐  ┌────▼────┐  ┌───▼─────┐
        │   SALE     │  │ CLOSED  │  │TRANSFERED│
        │ (Reventa)  │  │(Check-in)│ │          │
        └────────────┘  └─────────┘  └──────────┘
                │
                │ Vendido en mercado 2º
                ▼
           ┌──────────┐
           │   SOLD   │
           └──────────┘


CRON JOB (cada 15 minutos)
━━━━━━━━━━━━━━━━━━━━━━━━━━

                ┌─────────────────────┐
                │ CronJobsService     │
                │ @Cron('*/15 * * * *')│
                └──────────┬──────────┘
                           │
                           │ Query: eventos activos
                           │
                ┌──────────▼────────────┐
                │ getActiveEvents()     │
                │ status: LAUNCHED/LIVE │
                └──────────┬────────────┘
                           │
                           │ Iterar eventos
                           │
                ┌──────────▼───────────────────────────────┐
                │ checkEventStartDate(eventId, startDate)  │
                │ if (now >= startDate):                   │
                │    status = LIVE                         │
                └──────────────────────────────────────────┘
                           │
                           │ ⚠️ COMENTADO
                           │
                ┌──────────▼───────────────────────────────┐
                │ checkEventExpireDate(eventId, endDate)   │
                │ if (now >= endDate):                     │
                │    status = CLOSED                       │
                │    all tickets → EXPIRED                 │
                └──────────────────────────────────────────┘
```

### 5.3 Flujo de Datos (Data Flow)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────────┘

COMPRA → PAGO → TICKET → ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Event   │────►│  Order   │────►│  Sale    │────►│ Access   │
│          │     │          │     │ (Ticket) │     │ History  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │                │                 │                │
  promoter        paymentId          qrCode         activity
  tickets[]       status             status          status
  capacity        items[]            type            from/to
  location        total              price           reason


REVENTA (Mercado Secundario)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original Owner:
┌──────────┐     ┌──────────┐
│  Sale    │────►│  Sale    │
│ (OPEN)   │     │ (SALE)   │
└──────────┘     └────┬─────┘
                      │
                      │ Nueva compra
                      │
New Owner:            │
              ┌───────▼─────┐
              │  New Sale   │
              │  (OPEN)     │
              └─────────────┘

Original Sale:
  - status = SOLD
  - isResale = null

New Sale:
  - status = OPEN
  - isResale = original_sale_id


TRANSFERENCIA
━━━━━━━━━━━━━━

Original Owner:
┌──────────┐     ┌──────────┐
│  Sale    │────►│  Sale    │
│ (OPEN)   │     │(TRANSFERED)│
└──────────┘     └────┬─────┘
                      │
                      │ Transfer
                      │
New Owner:            │
              ┌───────▼─────┐
              │  New Sale   │
              │  (OPEN)     │
              └─────────────┘

Original Sale:
  - status = TRANSFERED
  - transfer.to = new_owner_email

New Sale:
  - status = OPEN
  - isTransfer = original_sale_id
  - transfer.from = original_owner_email
```

### 5.4 Flujo DevOps (CI/CD Pipeline)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       DEVOPS FLOW (PROPUESTO)                       │
└─────────────────────────────────────────────────────────────────────┘

🚧 TODO: No hay CI/CD configurado actualmente

                        ┌──────────┐
                        │   Git    │
                        │  (Push)  │
                        └─────┬────┘
                              │
                              │ Webhook
                              ▼
                    ┌──────────────────┐
                    │ GitHub Actions   │
                    │ (CI Pipeline)    │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
         ┌──────▼─────┐ ┌───▼────┐ ┌─────▼──────┐
         │  Lint      │ │ Test   │ │   Build    │
         │  ESLint    │ │ Jest   │ │ TypeScript │
         └────────────┘ └────────┘ └──────┬─────┘
                                           │
                                           │ Success
                                           ▼
                                  ┌─────────────────┐
                                  │ Docker Build    │
                                  │ & Push to       │
                                  │ Registry        │
                                  └────────┬────────┘
                                           │
                                           │ Image pushed
                                           ▼
                                  ┌─────────────────┐
                                  │ Deploy to       │
                                  │ Production      │
                                  │ (Azure/GCP/AWS) │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Health Check    │
                                  │ /health endpoint│
                                  └─────────────────┘
```

---

## 6. INFRAESTRUCTURA Y DEVOPS

### 6.1 Arquitectura de Despliegue

```
┌────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT ARCHITECTURE                           │
└────────────────────────────────────────────────────────────────────────┘

FRONTEND LAYER
━━━━━━━━━━━━━━

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ marketplace-v2      │  │ tickets-admin       │  │ paginator           │
│                     │  │                     │  │                     │
│ Google Cloud Run    │  │ Docker Container    │  │ Vercel / Netlify    │
│ Port: 3000          │  │ Port: 3001          │  │                     │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘


BACKEND LAYER
━━━━━━━━━━━━━

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ admin-api           │  │ marketplace-api     │  │ access-api          │
│                     │  │                     │  │                     │
│ Docker Container    │  │ Docker Container    │  │ Docker Container    │
│ Port: 3000          │  │ Port: 3000          │  │ Port: 3000          │
│ NestJS 10           │  │ NestJS 10           │  │ NestJS 11           │
└──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘
           │                        │                         │
           └────────────────────────┼─────────────────────────┘
                                    │
                        ┌───────────▼──────────┐
                        │    Load Balancer     │
                        │    (Nginx / Azure)   │
                        └──────────────────────┘


MOBILE APPS
━━━━━━━━━━━

┌─────────────────────┐  ┌─────────────────────┐
│ access-app          │  │ tickets-access-app  │
│                     │  │                     │
│ Expo / EAS Build    │  │ Expo / EAS Build    │
│ iOS App Store       │  │ iOS App Store       │
│ Google Play Store   │  │ Google Play Store   │
└─────────────────────┘  └─────────────────────┘
```

### 6.2 Servicios de Cloud (Azure/GCP)

| Servicio | Proveedor | Uso | Repositorios |
|----------|-----------|-----|--------------|
| **MongoDB Atlas** | MongoDB | Base de datos principal | Todas las APIs |
| **Redis Cloud** | Redis Labs | Bull queues (jobs) | marketplace-api, admin-api |
| **Azure Blob Storage** | Microsoft | Imágenes (events, tickets) | admin-api, marketplace-api |
| **Azure Web PubSub** | Microsoft | WebSocket escalable | access-api, admin-api |
| **Google Cloud Run** | Google | Hosting marketplace-v2 | marketplace-v2 |
| **Stripe** | Stripe | Procesamiento de pagos | marketplace-api, admin-api |
| **SendGrid / SMTP** | Varios | Envío de emails | marketplace-api |
| **Vercel / Netlify** | Vercel | Hosting landing page | paginator |

### 6.3 Variables de Entorno Consolidadas

#### Marketplace API
```bash
# Database
MONGO_URL=mongodb+srv://...

# JWT
JWT_SECRET_KEY=...

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_PRIVATE_KEY=sk_live_...
STRIPE_ENDPOINT_SECRET=whsec_...

# Redis
REDIS_HOST=...
REDIS_PORT=6379

# Azure
AZURE_STORAGE_CONNECTION_STRING=...
BLOB_URL=https://...blob.core.windows.net
SOCKET_MARKETPLACE=Endpoint=https://...

# Email
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG....
MAIL_FROM=noreply@futuratickets.com

# URLs
FUTURA_MARKET_PLACE=https://marketplace.futuratickets.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

#### Admin API
```bash
# Database
MONGO_URL=mongodb+srv://...

# JWT
JWT_SECRET=...
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Azure
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=images

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASSWORD=...

# Blockchain (🚧 TODO)
RPC_URL=https://...
PRIVATE_KEY=0x...
```

#### Access API
```bash
# Database
MONGO_URL=mongodb+srv://...

# JWT
JWT_SECRET_KEY=...

# WebSocket
SOCKET_ACCESS=Endpoint=https://...;AccessKey=...;Version=1.0;

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### 6.4 Docker Compose (Propuesto para Desarrollo Local)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  admin-api:
    build: ./futura-tickets-admin-api
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://admin:password@mongodb:27017/futuratickets?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongodb
      - redis

  marketplace-api:
    build: ./futura-market-place-api
    ports:
      - "3001:3000"
    environment:
      - MONGO_URL=mongodb://admin:password@mongodb:27017/futuratickets?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongodb
      - redis

  access-api:
    build: ./futura-access-api
    ports:
      - "3002:3000"
    environment:
      - MONGO_URL=mongodb://admin:password@mongodb:27017/futuratickets?authSource=admin
    depends_on:
      - mongodb

  marketplace-web:
    build: ./futura-market-place-v2
    ports:
      - "3010:3000"
    environment:
      - NEXT_PUBLIC_FUTURA_API=http://localhost:3001
      - NEXT_PUBLIC_FUTURA=http://localhost:3000

  admin-panel:
    build: ./futura-tickets-admin
    ports:
      - "3011:3001"
    environment:
      - NEXT_PUBLIC_FUTURA=http://localhost:3000

volumes:
  mongo-data:
  redis-data:
```

---

## 7. STACK TECNOLÓGICO CONSOLIDADO

### 7.1 Frontend

| Tecnología | Versión | Uso | Repositorios |
|------------|---------|-----|--------------|
| **Next.js** | 15.0.3 - 15.2.2 | Framework SSR/SSG | marketplace-v2, tickets-admin, tickets-event, paginator |
| **React** | 19 (RC) | UI Library | Todos los frontends |
| **TypeScript** | 5 | Lenguaje tipado | Todos los proyectos |
| **Ant Design** | 5.22.0 | UI Components | tickets-admin |
| **Radix UI** | Latest | UI Components (headless) | marketplace-v2 |
| **Tailwind CSS** | 3.4.17 | CSS Framework | marketplace-v2, tickets-event, paginator |
| **React Native** | 0.76 | Mobile Framework | access-app, tickets-access-app |
| **Expo** | 52 | React Native tooling | access-app, tickets-access-app |
| **Socket.IO Client** | 4.7.5 - 4.8.1 | WebSocket client | tickets-admin, marketplace-v2 |
| **React Hook Form** | 7.54.1 | Form validation | marketplace-v2 |
| **Zod** | 3.24.1 | Schema validation | marketplace-v2 |
| **Stripe React** | 1.10.0 | Payment UI | marketplace-v2, tickets-event |

### 7.2 Backend

| Tecnología | Versión | Uso | Repositorios |
|------------|---------|-----|--------------|
| **NestJS** | 10.0.0 - 11.0.1 | Backend Framework | Todas las APIs |
| **TypeScript** | 5.1.3 - 5.7.3 | Lenguaje tipado | Todas las APIs |
| **MongoDB** | Latest | Base de datos | Todas las APIs |
| **Mongoose** | 8.4.3 - 11.x | MongoDB ODM | Todas las APIs |
| **Stripe** | 17.4.0 | Payment Processing | marketplace-api, admin-api |
| **Bull** | 4.14.0 | Job Queues | marketplace-api, admin-api |
| **BullMQ** | 5.8.3 | Modern Bull version | marketplace-api, admin-api |
| **Socket.IO** | 4.7.5 - 4.8.1 | WebSocket server | Todas las APIs |
| **ioredis** | 5.4.1 | Redis client | marketplace-api, admin-api |
| **Passport JWT** | Latest | JWT Strategy | Todas las APIs |
| **bcryptjs** | Latest | Password hashing | Todas las APIs |
| **@nestjs/schedule** | 5.0.1 | Cron jobs | admin-api |
| **@nestjs/throttler** | Latest | Rate limiting | access-api, admin-api |
| **qrcode** | 1.5.4 | QR generation | marketplace-api |

### 7.3 Blockchain

| Tecnología | Versión | Uso | Repositorios |
|------------|---------|-----|--------------|
| **Solidity** | 0.8.25 | Smart Contracts | contracts-v2 |
| **Hardhat** | Latest | Dev environment | contracts-v2 |
| **OpenZeppelin** | 5.1.0 | Contract libraries | contracts-v2 |
| **ethers.js** | 6.13.1 | Ethereum library | marketplace-api, admin-api |
| **viem** | 2.20.0 | TypeScript Ethereum | marketplace-api, admin-api |
| **permissionless** | 0.2.0 | Account abstraction | marketplace-api |

### 7.4 DevOps y Herramientas

| Tecnología | Versión | Uso | Todos los Repos |
|------------|---------|-----|-----------------|
| **Docker** | Latest | Containerización | Todos con Dockerfile |
| **Node.js** | 18-20 Alpine | Runtime | Todos |
| **npm** | Latest | Package manager | Todos |
| **ESLint** | Latest | Linting | Todos |
| **Prettier** | Latest | Code formatting | Algunos |
| **Jest** | Latest | Testing (no usado) | Todos |
| **SWC** | Latest | Fast compiler | access-api |

### 7.5 Servicios Externos

| Servicio | Propósito | APIs Consumidoras |
|----------|-----------|-------------------|
| **Stripe** | Procesamiento de pagos | marketplace-api, admin-api |
| **MongoDB Atlas** | Base de datos en cloud | Todas las APIs |
| **Redis Cloud** | Cache y queues | marketplace-api, admin-api |
| **Azure Blob Storage** | Almacenamiento de imágenes | admin-api, marketplace-api |
| **Azure Web PubSub** | WebSocket escalable | access-api, admin-api |
| **SendGrid** | Envío de emails | marketplace-api |
| **Google OAuth** | Autenticación social | marketplace-v2, tickets-admin |
| **Google Cloud Run** | Hosting serverless | marketplace-v2 |

---

## 8. RECOMENDACIONES TÉCNICAS

### 8.1 🔴 CRÍTICAS (Prioridad 0 - Seguridad)

#### 8.1.1 Seguridad en APIs

**Problema:** CORS completamente abierto en admin-api
```typescript
// ❌ ACTUAL (futura-tickets-admin-api/src/main.ts:14)
app.enableCors();

// ✅ RECOMENDADO
app.enableCors({
  origin: [
    'https://marketplace.futuratickets.com',
    'https://admin.futuratickets.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

**Repositorios afectados:** admin-api, access-api

---

#### 8.1.2 Tokens en localStorage

**Problema:** JWT tokens almacenados en localStorage (vulnerable a XSS)
```typescript
// ❌ ACTUAL
localStorage.setItem('auth_token', token);

// ✅ RECOMENDADO: httpOnly cookies
// Backend (NestJS):
@Post('/login')
async login(@Res() res: Response) {
  const token = await this.authService.generateToken(user);
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return res.json({ user });
}
```

**Repositorios afectados:** marketplace-v2, tickets-admin

---

#### 8.1.3 Secrets Hardcoded

**Problema:** Google Client ID hardcoded en código
```typescript
// ❌ ACTUAL (marketplace-v2/app/layout.tsx:30)
<GoogleOAuthProvider clientId="15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com">

// ✅ RECOMENDADO
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>

// .env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com
```

**Repositorios afectados:** marketplace-v2, tickets-admin

---

#### 8.1.4 Password en Email Plaintext

**Problema:** Password enviado en plaintext en email de confirmación
```typescript
// ❌ ACTUAL (marketplace-api/src/Mail/mail.service.ts)
sendAccountConfirmation(account, password) {
  // Email contiene: "Password: ${password}"
}

// ✅ RECOMENDADO: Reset password flow
sendAccountConfirmation(account) {
  const resetToken = generateResetToken();
  // Email con link: /reset-password?token=${resetToken}
}
```

**Repositorios afectados:** marketplace-api

---

### 8.2 🟡 ALTAS (Prioridad 1 - Funcionalidad)

#### 8.2.1 Activar Expiración de Eventos

**Problema:** CronJob de expiración comentado
```typescript
// ❌ ACTUAL (admin-api/src/CronJobs/cron-jobs.service.ts:31)
// await this.checkEventExpireDate(event._id, event.dateTime.endDate);

// ✅ DESCOMENTAR
await this.checkEventExpireDate(event._id, event.dateTime.endDate);
```

**Impacto:** Eventos y tickets no expiran automáticamente

**Repositorio afectado:** admin-api

---

#### 8.2.2 Integrar Blockchain Activamente

**Problema:** Smart contracts desarrollados pero no integrados
```typescript
// 🚧 TODO: Implementar en admin-api

import { ethers } from 'ethers';
import FuturaEventFactoryABI from './abis/FuturaEventFactory.json';

async function deployEventContract(event: Event) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const factory = new ethers.Contract(
    process.env.FACTORY_ADDRESS,
    FuturaEventFactoryABI,
    wallet
  );

  const tx = await factory.createEvent(
    event.name,
    event.capacity,
    event.maxQuantity
  );

  const receipt = await tx.wait();
  const eventAddress = receipt.events[0].args.eventContract;

  // Actualizar evento en BD
  await this.eventService.updateEvent(event._id, {
    address: eventAddress,
    blockNumber: receipt.blockNumber,
    hash: receipt.transactionHash
  });
}
```

**Repositorios afectados:** admin-api, marketplace-api, contracts-v2

---

#### 8.2.3 Refactorizar Archivos Enormes

**Problema:** Archivos con +20k líneas de código

1. **admin-api/src/Event/admin-event.service.ts** (35,424 líneas)
```typescript
// ✅ REFACTORIZAR en módulos:
// - event-crud.service.ts (CRUD básico)
// - event-tickets.service.ts (Gestión de tickets)
// - event-blockchain.service.ts (Blockchain operations)
// - event-analytics.service.ts (Estadísticas)
// - event-validation.service.ts (Validaciones)
```

2. **tickets-admin/shared/services.tsx** (28,142 líneas)
```typescript
// ✅ DIVIDIR en archivos por dominio:
// - services/auth.service.ts
// - services/events.service.ts
// - services/sales.service.ts
// - services/payments.service.ts
// - services/analytics.service.ts
```

3. **tickets-admin/shared/interfaces.tsx** (9,690 líneas)
```typescript
// ✅ DIVIDIR en archivos por entidad:
// - interfaces/event.interface.ts
// - interfaces/sale.interface.ts
// - interfaces/order.interface.ts
// - interfaces/account.interface.ts
// - interfaces/promoter.interface.ts
```

**Repositorios afectados:** admin-api, tickets-admin

---

#### 8.2.4 Implementar Testing

**Problema:** 0% test coverage en todos los repositorios

```typescript
// ✅ IMPLEMENTAR tests críticos

// marketplace-api/src/Stripe/stripe.service.spec.ts
describe('StripeService', () => {
  it('should create payment intent', async () => {
    const paymentIntent = await stripeService.createPaymentIntent(5000);
    expect(paymentIntent.amount).toBe(5000);
    expect(paymentIntent.currency).toBe('eur');
  });
});

// access-api/src/Event/event.service.spec.ts
describe('EventService - Access Validation', () => {
  it('should grant access for OPEN ticket', async () => {
    const result = await eventService.validateAccess(promoter, saleId);
    expect(result.access).toBe('GRANTED');
  });

  it('should deny access for CLOSED ticket', async () => {
    const result = await eventService.validateAccess(promoter, closedSaleId);
    expect(result.access).toBe('DENIED');
    expect(result.reason).toBe('Ticket already used.');
  });
});

// marketplace-v2/contexts/cart-context.test.tsx
describe('CartContext', () => {
  it('should add item to cart', () => {
    const { addToCart, cart } = useCart();
    addToCart(mockEvent, 'VIP', 2);
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(2);
  });
});
```

**Target:** Mínimo 70% coverage en servicios críticos

**Repositorios afectados:** TODOS

---

### 8.3 🟢 MEDIAS (Prioridad 2 - Mejoras)

#### 8.3.1 Documentar APIs con Swagger

**Implementación:**
```typescript
// admin-api/src/main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('FuturaTickets Admin API')
  .setDescription('API principal de administración de eventos y tickets')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('events', 'Gestión de eventos')
  .addTag('sales', 'Gestión de tickets')
  .addTag('orders', 'Gestión de órdenes')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

// Decorar endpoints:
@ApiTags('events')
@Controller('admin/events')
export class AdminEventController {
  @ApiOperation({ summary: 'Crear nuevo evento' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiBearerAuth()
  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    // ...
  }
}
```

**Repositorios afectados:** admin-api, marketplace-api, access-api

---

#### 8.3.2 Implementar Health Checks

```typescript
// admin-api/src/health/health.controller.ts
import { HealthCheck, HealthCheckService, MongooseHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('/ready')
  ready() {
    // Verificar que todos los servicios críticos estén listos
    return { status: 'ready' };
  }
}
```

**Repositorios afectados:** Todas las APIs

---

#### 8.3.3 Logging Estructurado

```typescript
// admin-api/src/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
```

**Repositorios afectados:** Todas las APIs

---

#### 8.3.4 Caching con Redis

```typescript
// admin-api/src/cache/cache.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 300, // 5 minutes
    }),
  ],
})
export class CacheConfigModule {}

// Uso en servicio:
@Injectable()
export class EventService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getActiveEvents(): Promise<Event[]> {
    const cacheKey = 'active-events';
    const cached = await this.cacheManager.get<Event[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const events = await this.eventModel.find({ status: { $in: ['LAUNCHED', 'LIVE'] } });
    await this.cacheManager.set(cacheKey, events, 300);

    return events;
  }
}
```

**Repositorios afectados:** admin-api, marketplace-api

---

### 8.4 🔵 BAJAS (Prioridad 3 - Optimizaciones)

#### 8.4.1 CI/CD Pipeline

**GitHub Actions:**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t futura-admin-api:${{ github.sha }} .
      - name: Push to registry
        run: docker push futura-admin-api:${{ github.sha }}
      - name: Deploy to production
        run: kubectl apply -f k8s/deployment.yaml
```

**Repositorios afectados:** TODOS

---

#### 8.4.2 Monitoreo con Sentry

```typescript
// admin-api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

**Repositorios afectados:** Todas las APIs

---

#### 8.4.3 Migraciones de Base de Datos

```typescript
// admin-api/migrations/001-add-blockchain-fields.ts
import { MongoClient } from 'mongodb';

export async function up(client: MongoClient) {
  const db = client.db('futuratickets');

  await db.collection('events').updateMany(
    { address: { $exists: false } },
    { $set: { address: null, blockNumber: null, hash: null } }
  );
}

export async function down(client: MongoClient) {
  const db = client.db('futuratickets');

  await db.collection('events').updateMany(
    {},
    { $unset: { address: '', blockNumber: '', hash: '' } }
  );
}
```

---

## 9. CHECKLIST DE CALIDAD

### 9.1 Seguridad

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| CORS configurado con whitelist | ❌ | admin-api, access-api | 🔴 P0 |
| Tokens en httpOnly cookies | ❌ | marketplace-v2, tickets-admin | 🔴 P0 |
| Secrets en variables de entorno | ⚠️ Parcial | marketplace-v2 | 🔴 P0 |
| Password NO en emails plaintext | ❌ | marketplace-api | 🔴 P0 |
| Helmet.js configurado | ❌ | Todas las APIs | 🟡 P1 |
| Rate limiting activo | ⚠️ Config | access-api, admin-api | 🟡 P1 |
| Validación de inputs (DTOs) | ⚠️ Parcial | Todas las APIs | 🟡 P1 |
| Sanitización contra NoSQL injection | ❌ | Todas las APIs | 🟡 P1 |

### 9.2 Testing

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| Unit tests (>70% coverage) | ❌ 0% | TODOS | 🟡 P1 |
| Integration tests | ❌ | Todas las APIs | 🟡 P1 |
| E2E tests | ❌ | marketplace-v2, tickets-admin | 🟡 P1 |
| Tests de carga (load testing) | ❌ | Todas las APIs | 🟢 P2 |

### 9.3 Documentación

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| Swagger/OpenAPI | ❌ | Todas las APIs | 🟡 P1 |
| README actualizado | ⚠️ Genéricos | Varios | 🟡 P1 |
| CLAUDE.md creado | ✅ | Varios (no todos) | 🟢 P2 |
| ARCHITECTURE_OVERVIEW.md | ✅ | Root (este doc) | ✅ |
| Diagramas de arquitectura | ✅ | Este documento | ✅ |
| Postman collection | ❌ | APIs | 🟢 P2 |

### 9.4 Code Quality

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| ESLint configurado | ✅ | TODOS | ✅ |
| Prettier configurado | ⚠️ Parcial | Varios | 🟢 P3 |
| TypeScript strict mode | ⚠️ Parcial | TODOS | 🟢 P2 |
| Build sin errores | ⚠️ Ignorados | marketplace-v2 | 🟡 P1 |
| Sin archivos >5000 líneas | ❌ | admin-api, tickets-admin | 🟡 P1 |
| Sin código duplicado significativo | ⚠️ | Varios | 🟢 P2 |
| Comentarios en código complejo | ⚠️ Parcial | TODOS | 🟢 P3 |

### 9.5 DevOps

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| CI/CD pipeline | ❌ | TODOS | 🟢 P2 |
| Docker configurado | ✅ | TODOS | ✅ |
| docker-compose para dev | ❌ | Root | 🟢 P2 |
| Health checks | ❌ | Todas las APIs | 🟡 P1 |
| Logging estructurado | ❌ | Todas las APIs | 🟢 P2 |
| Monitoreo (Sentry, etc) | ❌ | Todas las APIs | 🟢 P2 |
| Alerting configurado | ❌ | Producción | 🟢 P2 |

### 9.6 Funcionalidades

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| Integración blockchain activa | ❌ | APIs + contracts-v2 | 🟡 P1 |
| CronJob expiración eventos activo | ❌ | admin-api | 🟡 P1 |
| Bull processors implementados | ⚠️ Parcial | marketplace-api | 🟡 P1 |
| WebSockets funcionando | ✅ | access-api, admin-api | ✅ |
| Stripe webhooks activos | ⚠️ Parcial | marketplace-api | 🟡 P1 |
| Sistema de emails completo | ✅ | marketplace-api | ✅ |
| QR Scanner funcionando | ⚠️ Bug | access-app | 🟡 P1 |

### 9.7 Performance

| Item | Estado | Repositorios Afectados | Prioridad |
|------|--------|------------------------|-----------|
| Caching con Redis | ❌ | APIs | 🟢 P2 |
| Optimización de queries MongoDB | ⚠️ | APIs | 🟢 P2 |
| Índices DB correctos | ⚠️ Parcial | APIs | 🟢 P2 |
| Code splitting | ⚠️ | Frontends | 🟢 P2 |
| Image optimization | ❌ | marketplace-v2 | 🟢 P3 |
| Lazy loading | ⚠️ | Frontends | 🟢 P3 |

### 9.8 Repositorios Legacy

| Item | Estado | Acción Recomendada |
|------|--------|-------------------|
| landingpage | DEPRECADO | ✅ Archivar repositorio |
| futura-tickets | DEPRECADO | ✅ Archivar repositorio |
| futura-tickets-rest-api | ⚠️ Verificar uso | 🚧 TODO: Determinar si eliminar |

---

## 10. PRÓXIMOS PASOS (ROADMAP)

### 10.1 Fase 1: Seguridad y Estabilización (2-3 semanas)

**Objetivo:** Eliminar vulnerabilidades críticas y estabilizar el sistema

**Tareas:**
1. ✅ Configurar CORS en todas las APIs
2. ✅ Migrar tokens a httpOnly cookies
3. ✅ Mover secrets a variables de entorno
4. ✅ Eliminar password en emails
5. ✅ Implementar Helmet.js
6. ✅ Activar CronJob de expiración
7. ✅ Implementar tests críticos (70% coverage mínimo)

**Entregables:**
- APIs seguras y configuradas correctamente
- Sistema de autenticación robusto
- Test suite funcional

---

### 10.2 Fase 2: Integración Blockchain (3-4 semanas)

**Objetivo:** Activar sistema de NFT tickets

**Tareas:**
1. ✅ Deploy automático de contratos al crear evento
2. ✅ Mintear NFTs al completar pago
3. ✅ Validar ownership on-chain antes de check-in
4. ✅ Sincronización blockchain ↔ MongoDB
5. ✅ UI para visualizar NFTs en wallets
6. ✅ Tests de integración blockchain

**Entregables:**
- Tickets como NFTs ERC-721 funcionales
- Factory pattern operativo
- Integración completa con APIs

---

### 10.3 Fase 3: Refactoring y Optimización (3-4 semanas)

**Objetivo:** Mejorar mantenibilidad y performance

**Tareas:**
1. ✅ Refactorizar admin-event.service.ts (35k → módulos <2k líneas)
2. ✅ Refactorizar services.tsx en tickets-admin (28k → módulos)
3. ✅ Implementar caching con Redis
4. ✅ Optimizar queries MongoDB
5. ✅ Code splitting en frontends
6. ✅ Implementar lazy loading

**Entregables:**
- Código modular y mantenible
- Performance mejorado (tiempo de respuesta <200ms)
- Arquitectura escalable

---

### 10.4 Fase 4: Observabilidad y DevOps (2 semanas)

**Objetivo:** Monitoreo y deployment automatizado

**Tareas:**
1. ✅ Configurar Swagger en todas las APIs
2. ✅ Implementar logging estructurado
3. ✅ Integrar Sentry para error tracking
4. ✅ Configurar health checks
5. ✅ Setup CI/CD pipeline (GitHub Actions)
6. ✅ Configurar alerting

**Entregables:**
- APIs documentadas con Swagger
- Pipeline CI/CD funcional
- Monitoreo en producción activo

---

### 10.5 Fase 5: Features y Mejoras (Continuo)

**Objetivo:** Nuevas funcionalidades y mejoras UX

**Ideas:**
- Sistema de notificaciones push (móvil)
- Analytics avanzado con dashboards
- Sistema de recomendaciones de eventos
- Integración con Apple Wallet / Google Pay
- Multi-idioma (i18n)
- PWA para frontends web
- Exportar reportes en PDF

---

## 11. CONCLUSIONES

### 11.1 Estado Actual del Ecosistema

**FuturaTickets** es un ecosistema **complejo y funcional** que abarca:
- ✅ **7 aplicaciones frontend** (web + mobile)
- ✅ **4 APIs backend** con arquitectura de microservicios
- ✅ **1 sistema de smart contracts** (desarrollado pero no integrado)
- ✅ **16 repositorios** en total

**Funcionalidades Operativas:**
- ✅ Marketplace de tickets con checkout Stripe
- ✅ Panel de administración para promotores
- ✅ Sistema de control de acceso con QR
- ✅ Sistema de reventa (mercado secundario)
- ✅ Emails transaccionales
- ✅ WebSockets en tiempo real
- ✅ Analytics y estadísticas

### 11.2 Fortalezas Principales

1. **Arquitectura Moderna**
   - Next.js 15 con App Router
   - NestJS con módulos bien organizados
   - TypeScript en todos los proyectos
   - Smart contracts con Factory Pattern

2. **Stack Tecnológico Sólido**
   - Frameworks enterprise-grade (NestJS, Next.js)
   - Servicios cloud escalables (Azure, MongoDB Atlas)
   - Procesamiento de pagos robusto (Stripe)

3. **Features Completas**
   - Sistema de reventa funcional
   - Control de acceso en tiempo real
   - Analytics y reportes
   - Sistema de emails completo

### 11.3 Áreas de Mejora Críticas

1. **Seguridad** 🔴
   - CORS abierto en APIs
   - Tokens en localStorage
   - Secrets hardcoded

2. **Testing** 🔴
   - 0% coverage en todos los repositorios
   - Sin tests E2E

3. **Blockchain** 🟡
   - Contratos desarrollados pero NO integrados
   - ethers/viem instalados pero no usados

4. **Code Quality** 🟡
   - Archivos con +35k líneas de código
   - Código duplicado
   - Build ignora errores TypeScript

5. **DevOps** 🟢
   - Sin CI/CD pipeline
   - Sin monitoreo en producción
   - Sin health checks

### 11.4 Evaluación General

| Aspecto | Calificación | Comentario |
|---------|--------------|------------|
| **Arquitectura** | 8/10 | Bien diseñada, modular, escalable |
| **Seguridad** | 4/10 | Vulnerabilidades críticas a resolver |
| **Testing** | 1/10 | Prácticamente inexistente |
| **Documentación** | 6/10 | CLAUDE.md buenos, faltan Swagger/README |
| **Code Quality** | 5/10 | Funcional pero necesita refactoring |
| **DevOps** | 3/10 | Docker ok, pero falta CI/CD y monitoreo |
| **Funcionalidad** | 9/10 | Completo y operativo |

**Calificación Global:** **6.5/10** (Funcional en producción pero requiere hardening)

### 11.5 Tiempo Estimado de Mejoras

| Fase | Duración | Equipo |
|------|----------|--------|
| Seguridad y Estabilización | 2-3 semanas | 2 developers |
| Integración Blockchain | 3-4 semanas | 1 blockchain dev + 1 backend dev |
| Refactoring y Optimización | 3-4 semanas | 2 developers |
| Observabilidad y DevOps | 2 semanas | 1 DevOps + 1 developer |
| **TOTAL** | **10-13 semanas** | **2-3 developers** |

### 11.6 Recomendación Final

**El ecosistema FuturaTickets es viable y está operativo**, pero requiere:

1. **Priorizar seguridad** (2-3 semanas de trabajo intensivo)
2. **Implementar testing** (critical path para mantenibilidad)
3. **Activar integración blockchain** (diferenciador clave del producto)
4. **Refactorizar código grande** (mejorar mantenibilidad)
5. **Setup DevOps completo** (deployment confiable)

Con estas mejoras implementadas, el sistema estará **production-ready** con alta confiabilidad.

---

## 12. APÉNDICE

### 12.1 Glosario de Términos

| Término | Definición |
|---------|------------|
| **BFF** | Backend for Frontend - Patrón donde API routes actúan como proxy |
| **CronJob** | Tarea programada que se ejecuta automáticamente |
| **ERC-721** | Estándar de tokens NFT en Ethereum |
| **Factory Pattern** | Patrón de diseño para crear múltiples instancias de contratos |
| **httpOnly cookie** | Cookie que no es accesible desde JavaScript (más segura) |
| **Payment Intent** | Objeto de Stripe que representa una intención de pago |
| **RSC** | React Server Components - Componentes que se ejecutan en servidor |
| **WebSocket** | Protocolo para comunicación bidireccional en tiempo real |

### 12.2 Enlaces Útiles

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Stripe Documentation:** https://stripe.com/docs
- **NestJS Documentation:** https://docs.nestjs.com
- **Next.js Documentation:** https://nextjs.org/docs
- **Solidity Documentation:** https://docs.soliditylang.org
- **Azure Web PubSub:** https://azure.microsoft.com/en-us/services/web-pubsub

### 12.3 Contactos y Responsables

🚧 TODO: Agregar contactos del equipo

### 12.4 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-10-13 | Claude | Documentación inicial completa del ecosistema |

---

**FIN DEL DOCUMENTO**

> **Nota:** Este documento debe actualizarse cuando se realicen cambios significativos en la arquitectura o se agreguen nuevos repositorios.

**Última actualización:** 2025-10-13
**Próxima revisión recomendada:** 2025-11-13
