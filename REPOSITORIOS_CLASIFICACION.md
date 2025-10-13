# 📊 Clasificación de Repositorios - FuturaTickets

> **Fecha:** 2025-10-13
> **Total de repositorios:** 16
> **Organización:** Futura-Tickets

---

## 📑 Índice

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Repositorios Críticos (P0)](#-repositorios-críticos-p0)
3. [Repositorios Importantes (P1)](#-repositorios-importantes-p1)
4. [Repositorios Secundarios (P2)](#-repositorios-secundarios-p2)
5. [Repositorios Deprecados](#-repositorios-deprecados)
6. [Clasificación por Tecnología](#-clasificación-por-tecnología)
7. [Diagrama de Arquitectura](#-diagrama-de-arquitectura)
8. [Orden de Prioridad para Deploy](#-orden-de-prioridad-para-deploy)

---

## 📈 Resumen Ejecutivo

### Distribución por Prioridad

| Prioridad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 **P0 - Críticos** | 6 repos | No pueden faltar - Core del negocio |
| 🟡 **P1 - Importantes** | 4 repos | Funcionalidades clave - Segundo deploy |
| 🟢 **P2 - Secundarios** | 3 repos | Pueden esperar - Deploy posterior |
| ⚪ **Deprecados** | 2 repos | Archivar - No usar |

### Distribución por Tipo

| Tipo | Cantidad | Repositorios |
|------|----------|--------------|
| **Backend APIs** | 4 | admin-api, marketplace-api, access-api, rest-api |
| **Frontend Web** | 4 | marketplace-v2, admin, event, paginator |
| **Mobile Apps** | 2 | tickets-access-app, access-app |
| **Blockchain** | 2 | contracts-v2, smartcontracts |
| **Utilidades** | 1 | integrations-scripts |
| **Deprecados** | 2 | landingpage, futura-tickets |

---

## 🔴 Repositorios Críticos (P0)

> **Sin estos repositorios el sistema NO funciona**

---

### 1. futura-tickets-admin-api

**Tipo:** Backend API (NestJS)
**Prioridad:** 🔴 P0 - CRÍTICO
**Estado:** ✅ Activo - Producción

#### Descripción
API principal de administración. Gestiona eventos, usuarios, promotores, analytics y toda la lógica de negocio del panel de administración.

#### Tecnologías
- **Framework:** NestJS 10.x
- **Base de datos:** MongoDB + Mongoose 8.4.3
- **Auth:** JWT + Passport
- **Real-time:** Socket.IO 4.7.5
- **Cache:** Redis + ioredis
- **Jobs:** Bull queues

#### Métricas
- **Líneas de código:** 9,485
- **Módulos principales:** 8
- **Endpoints:** ~50
- **Cron jobs:** 1 (cada 15 min)

#### Funcionalidades Clave
- ✅ Gestión completa de eventos (CRUD)
- ✅ Gestión de usuarios y promotores
- ✅ Dashboard con analytics
- ✅ Sistema de invitaciones
- ✅ Gestión de cupones y promocodes
- ✅ WebSockets para actualizaciones en tiempo real
- ✅ Background jobs para tareas asíncronas

#### Dependencias
- **Consume:** MongoDB, Redis, Socket.IO
- **Usado por:**
  - futura-tickets-admin (frontend)
  - futura-market-place-v2 (consulta eventos)
  - futura-access-api (lee datos de eventos)

#### Issues Conocidos
- ⚠️ CORS completamente abierto (security issue)
- ⚠️ CronJob de expiración comentado
- ⚠️ 3 conexiones Socket.IO activas (posible leak)

#### Ubicación
`/futura-tickets-admin-api/`

---

### 2. futura-market-place-api

**Tipo:** Backend API (NestJS)
**Prioridad:** 🔴 P0 - CRÍTICO
**Estado:** ✅ Activo - Producción

#### Descripción
API de procesamiento de pagos y gestión de órdenes. Maneja toda la lógica de compra de tickets, integración con Stripe, envío de emails transaccionales y generación de QR codes.

#### Tecnologías
- **Framework:** NestJS 10.x
- **Pagos:** Stripe 17.4.0
- **Emails:** @nestjs-modules/mailer + Bull queues
- **Blockchain:** ethers 6.13.1, viem 2.20.0
- **Base de datos:** MongoDB + Mongoose 8.4.3
- **Colas:** Bull 4.14.0, BullMQ 5.8.3
- **Storage:** Azure Blob Storage
- **Real-time:** Socket.IO + Azure Web PubSub

#### Métricas
- **Líneas de código:** ~15,000
- **Archivo más grande:** mail.service.ts (1,761 líneas)
- **Módulos principales:** 7
- **Tipos de emails:** 9

#### Funcionalidades Clave
- ✅ Procesamiento de pagos con Stripe Payment Intents
- ✅ Gestión completa de órdenes
- ✅ Sistema de emails transaccionales (HTML templates)
- ✅ Gestión de tickets/sales (compra, reventa, transferencia)
- ✅ Generación de QR codes únicos
- ✅ Integración blockchain (ethers/viem)
- ✅ Sistema de colas para procesamiento asíncrono
- ✅ WebSockets para notificaciones en tiempo real

#### Sistema de Emails
1. Confirmación de orden
2. Confirmación de reventa
3. Cancelación de reventa
4. Ticket vendido
5. Transferencia - origen
6. Transferencia - destino
7. Confirmación de invitación
8. Confirmación de cuenta
9. Recuperar cuenta

#### Dependencias
- **Servicios externos:**
  - Stripe (pagos)
  - SendGrid/SMTP (emails)
  - Azure Blob Storage (imágenes)
  - Azure Web PubSub (WebSockets)
  - Redis (Bull queues)
- **Usado por:**
  - futura-market-place-v2 (checkout flow)
  - futura-tickets-admin (gestión órdenes)

#### Issues Conocidos
- ⚠️ Password en plaintext en email de confirmación
- ⚠️ URL hardcoded a localhost en verifyAccount
- ⚠️ ResaleProcessor vacío (no implementado)
- ⚠️ TransferProcessor vacío (no implementado)
- ⚠️ No hay endpoint para webhooks de Stripe
- ⚠️ Librerías blockchain instaladas pero no usadas

#### Ubicación
`/futura-market-place-api/`

---

### 3. futura-access-api

**Tipo:** Backend API (NestJS)
**Prioridad:** 🔴 P0 - CRÍTICO
**Estado:** ✅ Activo - Producción

#### Descripción
API de control de acceso y validación de tickets. Maneja el check-in de tickets mediante QR codes, validación en tiempo real y comunicación con apps móviles.

#### Tecnologías
- **Framework:** NestJS 11.x
- **Real-time:** Azure Web PubSub
- **Base de datos:** MongoDB + Mongoose
- **Auth:** JWT + Passport

#### Métricas
- **Líneas de código:** ~8,000
- **Endpoints críticos:** PATCH /events/access
- **Módulos principales:** 5

#### Funcionalidades Clave
- ✅ Validación de tickets mediante QR
- ✅ Check-in de asistentes
- ✅ Gestión de estados de tickets
- ✅ WebSocket para notificaciones en tiempo real
- ✅ Historial de validaciones
- ✅ Control de acceso por zonas/tipos

#### Flujo de Validación
```
1. App móvil escanea QR
2. API valida ticket en DB
3. Verifica estado (OPEN, CLOSED, EXPIRED, etc)
4. Actualiza estado a GRANTED/DENIED
5. Envía notificación WebSocket
6. Registra en historial
```

#### Dependencias
- **Consume:** MongoDB, Azure Web PubSub
- **Lee datos de:**
  - futura-tickets-admin-api (eventos)
  - futura-market-place-api (sales/tickets)
- **Usado por:**
  - futura-tickets-access-app (app móvil)
  - futura-access-app (app móvil legacy)

#### Ubicación
`/futura-access-api/`

---

### 4. futura-market-place-v2

**Tipo:** Frontend Web (Next.js)
**Prioridad:** 🔴 P0 - CRÍTICO
**Estado:** ✅ Activo - Producción

#### Descripción
Marketplace público para compra de tickets. Interfaz de usuario donde los clientes finales descubren eventos, compran tickets, gestionan sus compras y acceden a sus QR codes.

#### Tecnologías
- **Framework:** Next.js 15.2.2 (App Router)
- **UI:** React 19 + Tailwind CSS
- **Pagos:** Stripe Elements + Payment Intents
- **Estado:** Zustand
- **Forms:** React Hook Form
- **HTTP:** Axios

#### Métricas
- **Líneas de código:** 20,857
- **Componentes:** ~150
- **Páginas principales:** 12
- **Context providers:** 1 (GlobalContext)

#### Páginas Principales
1. **Home** - Listado de eventos
2. **Event Detail** - Detalle de evento + compra
3. **Checkout** - Flujo de pago con Stripe
4. **Account** - Panel de usuario
5. **My Tickets** - Tickets comprados (con QR)
6. **Resale** - Mercado secundario
7. **Transfer** - Transferir tickets

#### Funcionalidades Clave
- ✅ Catálogo de eventos con filtros
- ✅ Sistema de checkout con Stripe
- ✅ Gestión de tickets (visualización, QR)
- ✅ Mercado secundario (reventa)
- ✅ Transferencia de tickets
- ✅ Perfil de usuario
- ✅ Historial de compras
- ✅ Sistema de cupones y promocodes

#### Integración con Stripe
```
1. Usuario selecciona tickets
2. Frontend solicita Payment Intent a API
3. API crea Payment Intent en Stripe
4. Stripe retorna client_secret
5. Frontend usa Stripe Elements
6. Usuario completa pago
7. Stripe webhook confirma a API
8. API crea tickets y envía email
9. Usuario recibe tickets con QR
```

#### Dependencias
- **APIs:**
  - futura-market-place-api (pagos, órdenes)
  - futura-tickets-admin-api (eventos, datos)
- **Servicios externos:**
  - Stripe (pagos frontend)
  - Azure Blob Storage (imágenes)

#### Issues Conocidos
- ⚠️ GlobalContext spread operator bug (services spread incorrectly)
- ⚠️ Bug crítico en QR scanning (documentado en CLAUDE.md)
- ⚠️ Múltiples estados locales (podría usar más Zustand)

#### Ubicación
`/futura-market-place-v2/`

---

### 5. futura-tickets-admin

**Tipo:** Frontend Web (Next.js)
**Prioridad:** 🔴 P0 - CRÍTICO
**Estado:** ✅ Activo - Producción

#### Descripción
Panel de administración para promotores y administradores. Gestión completa de eventos, visualización de analytics, control de ventas, gestión de usuarios y configuración del sistema.

#### Tecnologías
- **Framework:** Next.js 15.x (App Router)
- **UI:** Ant Design 5.x + Tailwind CSS
- **Estado:** Redux Toolkit
- **Charts:** Recharts, Chart.js
- **Real-time:** Socket.IO client (3 conexiones)
- **HTTP:** Axios

#### Métricas
- **Líneas de código:** 11,343
- **Archivo más grande:** services.js (28,142 líneas) ⚠️
- **Componentes:** ~200
- **Páginas:** ~30

#### Módulos Principales
1. **Dashboard** - Analytics y métricas
2. **Events Management** - CRUD de eventos
3. **Sales Management** - Visualización de ventas
4. **Users Management** - Gestión de usuarios
5. **Tickets Management** - Control de tickets
6. **Promoters** - Gestión de promotores
7. **Financial** - Reports financieros
8. **Settings** - Configuración

#### Funcionalidades Clave
- ✅ Dashboard con gráficos en tiempo real
- ✅ Creación y edición de eventos
- ✅ Gestión de tickets por tipo
- ✅ Sistema de invitaciones
- ✅ Cupones y códigos promocionales
- ✅ Visualización de ventas en tiempo real
- ✅ Reports y analytics
- ✅ Gestión de usuarios y roles
- ✅ Control de acceso granular

#### Pantallas Críticas
- **Dashboard:** Métricas, gráficos, KPIs
- **Create Event:** Wizard de creación (multi-step)
- **Event Detail:** Vista completa + edición
- **Sales:** Tabla con todas las ventas
- **Users:** Gestión completa de usuarios

#### Dependencias
- **API principal:** futura-tickets-admin-api
- **WebSockets:** 3 conexiones activas
  - Notificaciones
  - Actualizaciones de ventas
  - Estado de eventos

#### Issues Conocidos
- ⚠️ services.js con 28,142 líneas (MEGA ARCHIVO - necesita refactoring)
- ⚠️ 3 conexiones Socket.IO simultáneas (posible memory leak)
- ⚠️ Redux store grande (podría optimizarse)

#### Ubicación
`/futura-tickets-admin/`

---

### 6. futura-tickets-contracts-v2

**Tipo:** Smart Contracts (Solidity)
**Prioridad:** 🔴 P0 - CRÍTICO
**Estado:** ✅ Activo - Desarrollo

#### Descripción
Smart contracts de Ethereum para gestión de tickets como NFTs. Implementa el minteo, transferencia, y control de ownership de tickets en blockchain.

#### Tecnologías
- **Lenguaje:** Solidity 0.8.25
- **Framework:** Hardhat
- **Testing:** Hardhat tests
- **Network:** Ethereum (mainnet/testnet)
- **Standards:** ERC-721 (NFT)

#### Contratos Principales
1. **TicketFactory** - Creación de eventos
2. **Ticket** - NFT individual
3. **Marketplace** - Mercado secundario
4. **AccessControl** - Permisos y roles

#### Funcionalidades Clave
- ✅ Minteo de tickets como NFTs
- ✅ Transferencia de tickets
- ✅ Reventa (mercado secundario)
- ✅ Verificación de ownership
- ✅ Metadata on-chain
- ✅ Royalties para promotores
- ✅ Pausable (emergency stop)

#### Patrón de Diseño
```
Factory Pattern:
- TicketFactory crea contratos Ticket por evento
- Cada evento = 1 contrato Ticket
- Cada ticket = 1 NFT (ERC-721)
```

#### Integración con Backend
```
1. API crea evento en DB
2. API llama a TicketFactory.createEvent()
3. Factory despliega nuevo contrato Ticket
4. API guarda contract address en DB
5. Al completar pago, API llama a Ticket.mint()
6. NFT se transfiere a cliente
7. API guarda tokenId en DB
```

#### Dependencias
- **Usado por:**
  - futura-market-place-api (minteo de tickets)
  - futura-tickets-admin-api (creación de eventos)

#### Ubicación
`/futura-tickets-contracts-v2/`

---

## 🟡 Repositorios Importantes (P1)

> **Funcionalidades clave - Segundo deploy**

---

### 7. futura-tickets-access-app

**Tipo:** Mobile App (React Native + Expo)
**Prioridad:** 🟡 P1 - IMPORTANTE
**Estado:** ✅ Activo - Más actualizado

#### Descripción
Aplicación móvil para staff de eventos. Permite escanear códigos QR de tickets, validar acceso, gestionar check-ins y visualizar estadísticas en tiempo real.

#### Tecnologías
- **Framework:** Expo 52 SDK
- **React Native:** 0.76.x
- **UI:** React Native Paper
- **Navigation:** Expo Router
- **Camera:** expo-camera
- **Storage:** AsyncStorage
- **HTTP:** Axios

#### Métricas
- **Líneas de código:** ~15,000
- **Pantallas:** ~20
- **Componentes:** ~80

#### Funcionalidades Clave
- ✅ Escaneo de QR codes
- ✅ Validación de tickets en tiempo real
- ✅ Check-in de asistentes
- ✅ Modo offline (validación local)
- ✅ Estadísticas en tiempo real
- ✅ Historial de validaciones
- ✅ Gestión de múltiples eventos
- ✅ Notificaciones push

#### Flujo de Validación
```
1. Staff abre app y selecciona evento
2. Escanea QR del ticket
3. App envía request a futura-access-api
4. API valida ticket
5. App muestra resultado (✅/❌)
6. Guarda validación en historial
7. Actualiza contador en tiempo real
```

#### Dependencias
- **API:** futura-access-api
- **WebSocket:** Azure Web PubSub (updates en tiempo real)

#### Ventaja sobre futura-access-app
- ✅ Expo SDK más reciente (52 vs 51)
- ✅ React Native más reciente (0.76 vs 0.74)
- ✅ Mejor rendimiento
- ✅ Más funcionalidades

#### Ubicación
`/futura-tickets-access-app/`

---

### 8. futura-access-app

**Tipo:** Mobile App (React Native + Expo)
**Prioridad:** 🟡 P1 - IMPORTANTE
**Estado:** ⚠️ Posiblemente deprecado

#### Descripción
Versión anterior de la app de validación de acceso. Similar funcionalidad a futura-tickets-access-app pero con tecnologías más antiguas.

#### Tecnologías
- **Framework:** Expo 51 SDK
- **React Native:** 0.74.x
- **UI:** React Native Paper
- **Navigation:** React Navigation

#### Estado
- ⚠️ **Verificar uso:** Posiblemente reemplazado por futura-tickets-access-app
- ⚠️ Puede ser deprecado si no se usa en producción

#### Recomendación
Evaluar si está en uso. Si no, archivar y usar solo futura-tickets-access-app.

#### Ubicación
`/futura-access-app/`

---

### 9. futura-tickets-event

**Tipo:** Frontend Web (Next.js)
**Prioridad:** 🟡 P1 - IMPORTANTE
**Estado:** ✅ Activo

#### Descripción
Página de evento específico. Landing page personalizada para cada evento con información detallada y opción de compra directa.

#### Tecnologías
- **Framework:** Next.js
- **UI:** Tailwind CSS
- **HTTP:** Axios

#### Métricas
- **Líneas de código:** ~8,000
- **Componentes:** ~40

#### Funcionalidades Clave
- ✅ Landing page personalizada por evento
- ✅ Información detallada del evento
- ✅ Galería de imágenes
- ✅ Información de artistas
- ✅ Mapa de ubicación
- ✅ Selección de tickets
- ✅ Botón directo a compra
- ✅ Countdown al evento
- ✅ Compartir en redes sociales

#### Uso
- Marketing específico por evento
- Campañas publicitarias
- Links en redes sociales
- Páginas de destino (landing pages)

#### Dependencias
- **APIs:**
  - futura-tickets-admin-api (datos del evento)
  - futura-market-place-api (compra)

#### Ubicación
`/futura-tickets-event/`

---

### 10. futura-paginator

**Tipo:** Frontend Web (Next.js)
**Prioridad:** 🟡 P1 - IMPORTANTE
**Estado:** ✅ Activo

#### Descripción
Landing page principal de FuturaTickets. Home page corporativa con información del servicio, próximos eventos destacados y call-to-actions.

#### Tecnologías
- **Framework:** Next.js
- **UI:** Tailwind CSS
- **Animations:** Framer Motion

#### Métricas
- **Líneas de código:** ~5,000
- **Secciones:** ~8

#### Secciones Principales
1. **Hero** - Banner principal con CTA
2. **Upcoming Events** - Eventos destacados
3. **Features** - Características del servicio
4. **How it Works** - Proceso de compra
5. **Testimonials** - Testimonios
6. **FAQ** - Preguntas frecuentes
7. **Newsletter** - Suscripción
8. **Footer** - Links y contacto

#### Funcionalidades Clave
- ✅ Showcase de eventos próximos
- ✅ Información corporativa
- ✅ SEO optimizado
- ✅ Responsive design
- ✅ Animaciones suaves
- ✅ Call-to-action buttons
- ✅ Integración con redes sociales

#### Uso
- Punto de entrada principal
- Marketing general
- SEO
- Brand awareness

#### Dependencias
- **API:** futura-tickets-admin-api (eventos destacados)

#### Ubicación
`/futura-paginator/`

---

## 🟢 Repositorios Secundarios (P2)

> **Pueden esperar - Deploy posterior**

---

### 11. futura-tickets-rest-api

**Tipo:** Backend API (NestJS)
**Prioridad:** 🟢 P2 - SECUNDARIO
**Estado:** ⚠️ Casi vacío

#### Descripción
API REST adicional. Posible API futura o en desarrollo. Actualmente solo tiene estructura básica de NestJS sin funcionalidad implementada.

#### Tecnologías
- **Framework:** NestJS
- **Base de datos:** MongoDB (presumible)

#### Métricas
- **Líneas de código:** ~100
- **Estado:** Solo estructura base

#### Estado Actual
- ⚠️ Sin módulos implementados
- ⚠️ Solo archivos de configuración
- ⚠️ No está en uso en producción

#### Recomendación
- Evaluar si es necesario
- Si no está en roadmap, considerar eliminar
- Si está planificado, documentar propósito

#### Ubicación
`/futura-tickets-rest-api/`

---

### 12. futura-tickets-smartcontracts

**Tipo:** Smart Contracts (Solidity)
**Prioridad:** 🟢 P2 - SECUNDARIO
**Estado:** ⚠️ Verificar vs contracts-v2

#### Descripción
Smart contracts versión anterior. Posiblemente reemplazado por futura-tickets-contracts-v2.

#### Estado Actual
- ⚠️ Verificar si está en uso
- ⚠️ Posible versión antigua
- ⚠️ Puede estar deprecado

#### Recomendación
- Comparar con contracts-v2
- Si es versión antigua, archivar
- Mantener solo una versión activa

#### Ubicación
`/futura-tickets-smartcontracts/`

---

### 13. integrations-scripts

**Tipo:** Scripts y Utilidades
**Prioridad:** 🟢 P2 - SECUNDARIO
**Estado:** ✅ Activo

#### Descripción
Scripts de integración, automatización y utilidades para DevOps. Incluye scripts para migraciones, seed de datos, deployment, etc.

#### Contenido
- Scripts de migración
- Seed de datos de prueba
- Scripts de deployment
- Utilidades de desarrollo
- Automatizaciones

#### Métricas
- **Líneas de código:** ~1,000
- **Scripts:** ~10-15

#### Uso
- DevOps
- CI/CD
- Desarrollo local
- Testing
- Migraciones

#### Ubicación
`/integrations-scripts/`

---

## ⚪ Repositorios Deprecados

> **Archivar - No usar en desarrollo**

---

### 14. landingpage

**Tipo:** Frontend Web
**Prioridad:** ⚪ DEPRECADO
**Estado:** ❌ No usar

#### Descripción
Landing page versión 1. Reemplazado por **futura-paginator**.

#### Razón de deprecación
- Versión antigua del landing
- Reemplazado por futura-paginator
- No debe usarse en nuevos desarrollos

#### Acción requerida
```
1. Archivar en GitHub:
   Settings > General > Archive this repository
2. Agregar descripción:
   "⚠️ DEPRECADO - Ver futura-paginator"
3. No asignar a ningún team
```

#### Ubicación
`/landingpage/`

---

### 15. futura-tickets

**Tipo:** Frontend Web
**Prioridad:** ⚪ DEPRECADO
**Estado:** ❌ No usar

#### Descripción
Marketplace versión 1. Reemplazado por **futura-market-place-v2**.

#### Razón de deprecación
- Versión antigua del marketplace
- Reemplazado por futura-market-place-v2
- Tecnología desactualizada
- No debe usarse en nuevos desarrollos

#### Acción requerida
```
1. Archivar en GitHub:
   Settings > General > Archive this repository
2. Agregar descripción:
   "⚠️ DEPRECADO - Ver futura-market-place-v2"
3. No asignar a ningún team
```

#### Ubicación
`/futura-tickets/`

---

## 🏗️ Clasificación por Tecnología

### Backend APIs (NestJS)

| Repositorio | Prioridad | Estado | Líneas | Uso |
|-------------|-----------|--------|--------|-----|
| futura-tickets-admin-api | 🔴 P0 | ✅ Activo | 9,485 | Gestión eventos/usuarios |
| futura-market-place-api | 🔴 P0 | ✅ Activo | ~15,000 | Pagos con Stripe |
| futura-access-api | 🔴 P0 | ✅ Activo | ~8,000 | Validación tickets |
| futura-tickets-rest-api | 🟢 P2 | ⚠️ Vacío | ~100 | API futura? |

**Total Backend:** 4 repositorios (3 críticos, 1 secundario)

---

### Frontend Web (Next.js)

| Repositorio | Prioridad | Estado | Líneas | Uso |
|-------------|-----------|--------|--------|-----|
| futura-market-place-v2 | 🔴 P0 | ✅ Activo | 20,857 | Marketplace público |
| futura-tickets-admin | 🔴 P0 | ✅ Activo | 11,343 | Panel admin |
| futura-tickets-event | 🟡 P1 | ✅ Activo | ~8,000 | Página evento |
| futura-paginator | 🟡 P1 | ✅ Activo | ~5,000 | Landing page |
| ~~landingpage~~ | ⚪ | ❌ Deprecado | ~3,000 | Landing v1 |
| ~~futura-tickets~~ | ⚪ | ❌ Deprecado | ~8,000 | Marketplace v1 |

**Total Frontend:** 6 repositorios (2 críticos, 2 importantes, 2 deprecados)

---

### Mobile Apps (React Native + Expo)

| Repositorio | Prioridad | Estado | Expo | RN | Uso |
|-------------|-----------|--------|------|-----|-----|
| futura-tickets-access-app | 🟡 P1 | ✅ Activo | 52 | 0.76 | App validación (actual) |
| futura-access-app | 🟡 P1 | ⚠️ Antigua? | 51 | 0.74 | App validación (legacy) |

**Total Mobile:** 2 repositorios (ambos importantes)

**Recomendación:** Evaluar si futura-access-app está en uso. Si no, deprecar.

---

### Blockchain (Solidity + Hardhat)

| Repositorio | Prioridad | Estado | Uso |
|-------------|-----------|--------|-----|
| futura-tickets-contracts-v2 | 🔴 P0 | ✅ Activo | Smart contracts (actual) |
| futura-tickets-smartcontracts | 🟢 P2 | ⚠️ Antigua? | Versión anterior? |

**Total Blockchain:** 2 repositorios (1 crítico, 1 secundario)

**Recomendación:** Verificar cual está en uso. Mantener solo uno.

---

### Utilidades

| Repositorio | Prioridad | Estado | Uso |
|-------------|-----------|--------|-----|
| integrations-scripts | 🟢 P2 | ✅ Activo | Scripts DevOps |

**Total Utilidades:** 1 repositorio

---

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Landing    │   │  Marketplace │   │    Admin     │
│  (paginator) │   │     (v2)     │   │    Panel     │
│              │   │              │   │              │
│  Next.js     │   │  Next.js 15  │   │  Next.js 15  │
│  🟡 P1       │   │  🔴 P0       │   │  🔴 P0       │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       │                  │                   │
       │          ┌───────┴───────┐           │
       │          │               │           │
       │          ▼               ▼           │
       │   ┌──────────────┐ ┌──────────────┐ │
       │   │  Event Page  │ │ Mobile Apps  │ │
       │   │              │ │              │ │
       │   │  Next.js     │ │ Expo 52      │ │
       │   │  🟡 P1       │ │ 🟡 P1        │ │
       │   └──────┬───────┘ └──────┬───────┘ │
       │          │                │         │
       └──────────┴────────────────┴─────────┘
                  │
                  │
       ┌──────────┴──────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────┐                    ┌──────────────┐
│ Marketplace  │                    │    Admin     │
│     API      │                    │     API      │
│              │                    │              │
│  NestJS 10   │◄───────────────────┤  NestJS 10   │
│  Stripe      │                    │  Analytics   │
│  Emails      │                    │  WebSockets  │
│  🔴 P0       │                    │  🔴 P0       │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │            ┌──────────────┐       │
       │            │   Access     │       │
       └────────────┤     API      │───────┘
                    │              │
                    │  NestJS 11   │
                    │  WebPubSub   │
                    │  QR Validate │
                    │  🔴 P0       │
                    └──────┬───────┘
                           │
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB    │   │  Blockchain  │   │    Redis     │
│              │   │              │   │              │
│  Database    │   │  Contracts   │   │    Cache     │
│              │   │  🔴 P0       │   │    Queues    │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🚀 Orden de Prioridad para Deploy

### Fase 1: Core Backend (Día 1)
```
1. futura-tickets-admin-api       🔴 P0
2. futura-market-place-api        🔴 P0
3. futura-access-api              🔴 P0
```

**Razón:** Sin estos, nada funciona. Son la base del sistema.

---

### Fase 2: Frontend Crítico (Día 2)
```
4. futura-market-place-v2         🔴 P0
5. futura-tickets-admin           🔴 P0
```

**Razón:** Interfaz de usuario para clientes y administradores.

---

### Fase 3: Blockchain (Día 3)
```
6. futura-tickets-contracts-v2    🔴 P0
```

**Razón:** Minteo de NFTs. Puede deployarse después si backend ya funciona sin blockchain.

---

### Fase 4: Mobile & Marketing (Semana 2)
```
7. futura-tickets-access-app      🟡 P1
8. futura-tickets-event           🟡 P1
9. futura-paginator               🟡 P1
```

**Razón:** Funcionalidades importantes pero no críticas para MVP.

---

### Fase 5: Secundarios (Según necesidad)
```
10. integrations-scripts          🟢 P2
11. futura-access-app             🟡 P1 (evaluar)
```

**Razón:** Utilidades y versiones alternativas.

---

### Fase 6: Archivar Deprecados
```
❌ landingpage                    ⚪ DEPRECADO
❌ futura-tickets                 ⚪ DEPRECADO
```

**Acción:** Archivar en GitHub, no deployar.

---

## 📋 Checklist de Setup por Prioridad

### 🔴 P0 - Críticos (Setup Inmediato)

```
Backend:
□ futura-tickets-admin-api
  □ Configurar MongoDB
  □ Configurar Redis
  □ Configurar Socket.IO
  □ Deploy a producción

□ futura-market-place-api
  □ Configurar Stripe (keys)
  □ Configurar SMTP (emails)
  □ Configurar Azure Blob Storage
  □ Configurar Redis/Bull
  □ Deploy a producción

□ futura-access-api
  □ Configurar Azure Web PubSub
  □ Configurar MongoDB
  □ Deploy a producción

Frontend:
□ futura-market-place-v2
  □ Configurar variables de entorno
  □ Conectar a marketplace-api
  □ Configurar Stripe public key
  □ Deploy a Vercel/producción

□ futura-tickets-admin
  □ Configurar variables de entorno
  □ Conectar a admin-api
  □ Deploy a Vercel/producción

Blockchain:
□ futura-tickets-contracts-v2
  □ Deploy a testnet
  □ Verificar contratos
  □ Deploy a mainnet
  □ Actualizar addresses en APIs
```

---

### 🟡 P1 - Importantes (Setup Semana 2)

```
Mobile:
□ futura-tickets-access-app
  □ Configurar Expo
  □ Conectar a access-api
  □ Build para iOS/Android
  □ Publicar en stores

Frontend:
□ futura-tickets-event
  □ Configurar variables de entorno
  □ Deploy a Vercel

□ futura-paginator
  □ Configurar variables de entorno
  □ Deploy a Vercel
```

---

### 🟢 P2 - Secundarios (Setup Según Necesidad)

```
□ integrations-scripts
  □ Configurar en CI/CD
  □ Documentar uso

□ Evaluar y decidir:
  □ futura-access-app (deprecar?)
  □ futura-tickets-smartcontracts (deprecar?)
  □ futura-tickets-rest-api (implementar o eliminar?)
```

---

### ⚪ Deprecados (Archivar)

```
□ landingpage
  □ Archivar en GitHub
  □ Agregar aviso de deprecación

□ futura-tickets
  □ Archivar en GitHub
  □ Agregar aviso de deprecación
```

---

## 📊 Resumen de Decisiones

### ✅ Repositorios que SÍ deben subirse:

**Inmediato (P0):**
1. futura-tickets-admin-api
2. futura-market-place-api
3. futura-access-api
4. futura-market-place-v2
5. futura-tickets-admin
6. futura-tickets-contracts-v2

**Segunda fase (P1):**
7. futura-tickets-access-app
8. futura-tickets-event
9. futura-paginator

**Tercera fase (P2):**
10. integrations-scripts

---

### ⚠️ Repositorios que EVALUAR:

1. **futura-access-app**
   - Verificar si está en uso en producción
   - Si no, deprecar y usar solo futura-tickets-access-app

2. **futura-tickets-smartcontracts**
   - Verificar si está en uso vs contracts-v2
   - Mantener solo una versión

3. **futura-tickets-rest-api**
   - Verificar si está en roadmap
   - Si no, eliminar repositorio

---

### ❌ Repositorios que ARCHIVAR:

1. **landingpage** - Reemplazado por futura-paginator
2. **futura-tickets** - Reemplazado por futura-market-place-v2

---

## 📞 Información de Contacto

**Organización:** Futura-Tickets
**Email:** support@futuratickets.com
**GitHub:** https://github.com/Futura-Tickets

---

## 📅 Control de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-10-13 | Documento inicial |

---

**FIN DEL DOCUMENTO**
