# PLAN DE SPRINTS - FUTURATICKETS

> **Equipo:** 2 desarrolladores full-stack
> **Capacidad por sprint:** ~130 horas (2 personas × 65h efectivas c/u)
> **Inicio:** 14 Octubre 2025
> **Duración:** 14 sprints (28 semanas)
> **Finalización estimada:** 12 Mayo 2026

---

## 📋 ÍNDICE DE SPRINTS

| Sprint | Fechas | Dominio | Horas |
|--------|--------|---------|-------|
| [Sprint 1](#sprint-1-14-27-oct-2025--fundación-técnica) | 14-27 Oct 2025 | Fundación Técnica | 132h |
| [Sprint 2](#sprint-2-28-oct---10-nov-2025--backend-core) | 28 Oct - 10 Nov 2025 | Backend Core | 128h |
| [Sprint 3](#sprint-3-11-24-nov-2025--marketplace-backend) | 11-24 Nov 2025 | Marketplace Backend | 126h |
| [Sprint 4](#sprint-4-25-nov---8-dic-2025--admin-panel-backend) | 25 Nov - 8 Dic 2025 | Admin Panel Backend | 124h |
| [Sprint 5](#sprint-5-9-22-dic-2025--access-control-backend) | 9-22 Dic 2025 | Access Control Backend | 126h |
| [Sprint 6](#sprint-6-7-20-ene-2026--marketplace-frontend) | 7-20 Ene 2026 | Marketplace Frontend | 130h |
| [Sprint 7](#sprint-7-21-ene---3-feb-2026--marketplace-frontend-cont) | 21 Ene - 3 Feb 2026 | Marketplace Frontend (cont.) | 116h |
| [Sprint 8](#sprint-8-4-17-feb-2026--admin-panel-frontend) | 4-17 Feb 2026 | Admin Panel Frontend | 128h |
| [Sprint 9](#sprint-9-18-feb---3-mar-2026--access-control-apps) | 18 Feb - 3 Mar 2026 | Access Control Apps | 128h |
| [Sprint 10](#sprint-10-4-17-mar-2026--integraciones) | 4-17 Mar 2026 | Integraciones | 120h |
| [Sprint 11](#sprint-11-18-31-mar-2026--smart-contracts-v2) | 18-31 Mar 2026 | Smart Contracts V2 | 120h |
| [Sprint 12](#sprint-12-1-14-abr-2026--qa--refinamiento) | 1-14 Abr 2026 | QA & Refinamiento | 128h |
| [Sprint 13](#sprint-13-15-28-abr-2026--landing--marketing) | 15-28 Abr 2026 | Landing & Marketing | 122h |
| [Sprint 14](#sprint-14-29-abr---12-may-2026--deployment--lanzamiento) | 29 Abr - 12 May 2026 | Deployment & Lanzamiento | 134h |

**Total:** 1,762 horas de desarrollo

---

## SPRINT 1 (14-27 Oct 2025) | FUNDACIÓN TÉCNICA

**Dominio:** Infraestructura & Core

### EPIC-1: Configuración Base del Proyecto

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-001** | Setup repositorios y CI/CD pipelines | 12h | 8 | P0 |
| **FT-002** | Configuración Docker y orquestación | 8h | 5 | P0 |
| **FT-003** | Setup base de datos (MongoDB) | 10h | 5 | P0 |
| **FT-004** | Configuración entornos (dev/staging/prod) | 8h | 5 | P0 |
| **FT-005** | Estructura monorepo y dependencias | 10h | 8 | P0 |

**Definition of Done FT-001:**
- ✅ GitHub Actions configurado con workflows de CI/CD
- ✅ Pipeline ejecuta linting, tests y build automáticamente
- ✅ Deploy automático a staging en merge a develop
- ✅ Documentación de workflows en README.md

**Definition of Done FT-003:**
- ✅ MongoDB Atlas configurado con clusters para dev/staging/prod
- ✅ Schemas iniciales creados (events, users, sales, orders)
- ✅ Seeders para datos de prueba implementados
- ✅ Backup automático configurado

### EPIC-2: Smart Contracts Base

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-006** | Diseño arquitectura contratos NFT tickets | 16h | 13 | P0 |
| **FT-007** | Implementar contrato base de ticket (ERC-721) | 20h | 13 | P0 |
| **FT-008** | Testing contratos inteligentes | 12h | 8 | P0 |
| **FT-009** | Deploy contratos a testnet | 8h | 5 | P0 |
| **FT-010** | Documentación técnica contratos | 6h | 3 | P1 |

**Definition of Done FT-007:**
- ✅ Contrato FuturaEvent implementa ERC-721 estándar
- ✅ Factory pattern para deploy de eventos implementado
- ✅ Funciones: mint, transfer, burn, setTokenURI
- ✅ Tests unitarios con 100% coverage en funciones críticas
- ✅ Gas optimization realizado (< 200k gas por mint)

### EPIC-3: API REST Core

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-011** | Setup NestJS estructura base | 10h | 5 | P0 |
| **FT-012** | Implementar autenticación JWT | 12h | 8 | P0 |

**Definition of Done FT-012:**
- ✅ JWT strategy con Passport implementado
- ✅ Guards para protección de rutas (Public, Authenticated, Admin)
- ✅ Refresh token system implementado
- ✅ Tests de autenticación con 90%+ coverage

**Total Sprint 1:** 132h

**Dependencias:**
- FT-007 → FT-008 (Tests dependen de contrato implementado)
- FT-008 → FT-009 (Deploy requiere tests pasando)
- FT-003 → FT-011 (NestJS necesita DB configurada)

---

## SPRINT 2 (28 Oct - 10 Nov 2025) | BACKEND CORE

**Dominio:** APIs Backend + Event Management

### EPIC-3: API REST Core (continuación)

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-013** | Módulo de usuarios y roles (RBAC) | 18h | 13 | P0 |
| **FT-014** | Middleware de validación y logging | 10h | 5 | P0 |
| **FT-015** | Integración con blockchain (Web3) | 16h | 13 | P0 |

**Definition of Done FT-013:**
- ✅ Roles implementados: USER, PROMOTER, ACCESS, ADMIN
- ✅ Decorador @Auth() con pipes de validación
- ✅ CRUD de usuarios con bcrypt para passwords
- ✅ Tests E2E de autorización

**Definition of Done FT-015:**
- ✅ ethers.js integrado con providers
- ✅ Servicios para interactuar con FuturaEvent contracts
- ✅ Wallet management para cuentas de sistema
- ✅ Event listeners para eventos de blockchain

### EPIC-4: Event Management API

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-016** | Modelo de datos de eventos | 12h | 8 | P0 |
| **FT-017** | CRUD de eventos (crear/editar/listar) | 20h | 13 | P0 |
| **FT-018** | Gestión de categorías y venues | 14h | 8 | P1 |
| **FT-019** | Upload y gestión de imágenes (Azure Blob) | 12h | 8 | P0 |
| **FT-020** | API de búsqueda y filtros de eventos | 16h | 13 | P1 |
| **FT-021** | Testing E2E eventos | 10h | 5 | P0 |

**Definition of Done FT-017:**
- ✅ Endpoints: POST /events, PATCH /events/:id, DELETE /events/:id, GET /events
- ✅ Validación con class-validator (DTO completo)
- ✅ Estados: HOLD, CREATED, LAUNCHED, LIVE, CLOSED
- ✅ Soft delete implementado
- ✅ Swagger documentation completa

**Definition of Done FT-019:**
- ✅ Integración con Azure Blob Storage
- ✅ Upload multipart/form-data
- ✅ Validación de tipo y tamaño de imagen (max 5MB, jpg/png)
- ✅ CDN URLs retornadas
- ✅ Compression automática de imágenes

**Total Sprint 2:** 128h

**Dependencias:**
- FT-016 → FT-017 (CRUD necesita modelo definido)
- FT-017 → FT-019 (Upload de imágenes requiere eventos creados)
- FT-017 → FT-020 (Búsqueda requiere eventos existentes)

---

## SPRINT 3 (11-24 Nov 2025) | MARKETPLACE BACKEND

**Dominio:** Marketplace API + Transactions

### EPIC-5: Marketplace API

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-022** | Modelo de inventario de tickets | 14h | 8 | P0 |
| **FT-023** | Sistema de pricing y disponibilidad | 18h | 13 | P0 |
| **FT-024** | API de compra primaria (venta inicial) | 20h | 13 | P0 |
| **FT-025** | API de mercado secundario (reventa) | 22h | 13 | P0 |
| **FT-026** | Integración payment gateway (Stripe) | 24h | 13 | P0 |
| **FT-027** | Sistema de reservas temporales | 16h | 8 | P1 |
| **FT-028** | Webhooks de pagos | 12h | 8 | P0 |

**Definition of Done FT-023:**
- ✅ Ticketlots system implementado (early bird, regular, late)
- ✅ Precio dinámico según disponibilidad
- ✅ Validación de capacidad máxima
- ✅ Query de disponibilidad en tiempo real (<100ms)

**Definition of Done FT-026:**
- ✅ Stripe SDK integrado (v17+)
- ✅ Payment Intents API implementado
- ✅ Endpoints: POST /stripe/payment-intent, GET /stripe/config
- ✅ Manejo de 3D Secure (SCA compliance)
- ✅ Webhook signature validation implementado
- ✅ Tests con Stripe test mode

**Definition of Done FT-028:**
- ✅ Webhook endpoint: POST /stripe/webhook
- ✅ Eventos manejados: payment_intent.succeeded, payment_intent.failed, charge.refunded
- ✅ Orden actualizada a SUCCEEDED/FAILED según resultado
- ✅ Sales (tickets) creadas automáticamente al pago exitoso
- ✅ QR codes generados con qrcode library
- ✅ Email de confirmación enviado (Bull queue)

**Total Sprint 3:** 126h

**Dependencias:**
- FT-022 → FT-023 (Pricing necesita modelo de inventario)
- FT-023 → FT-024 (Compra necesita pricing definido)
- FT-026 → FT-028 (Webhooks necesitan Stripe configurado)
- FT-024 → FT-028 (Webhooks procesan órdenes creadas en compra)

---

## SPRINT 4 (25 Nov - 8 Dic 2025) | ADMIN PANEL BACKEND

**Dominio:** Admin API + Analytics

### EPIC-6: Admin API

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-029** | API de gestión de organizadores (Promoters) | 16h | 8 | P0 |
| **FT-030** | Dashboard analytics (ventas/stats) | 20h | 13 | P0 |
| **FT-031** | Sistema de reportes (PDF/Excel) | 18h | 13 | P1 |
| **FT-032** | Gestión de promociones y descuentos | 16h | 8 | P1 |
| **FT-033** | Sistema de notificaciones (email/SMS) | 18h | 13 | P0 |
| **FT-034** | Audit logs y trazabilidad | 12h | 8 | P1 |
| **FT-035** | API de gestión de comisiones | 14h | 8 | P1 |
| **FT-036** | Testing admin APIs | 10h | 5 | P0 |

**Definition of Done FT-030:**
- ✅ Endpoints de analytics:
  - GET /analytics/event/:id (ventas por evento)
  - GET /analytics/promoter (KPIs del promotor)
  - GET /analytics/sales-timeline (ventas por día/semana/mes)
- ✅ Métricas: total revenue, tickets sold, conversion rate, avg ticket price
- ✅ Agregaciones MongoDB optimizadas (<500ms)
- ✅ Cache con Redis (TTL 5 min)

**Definition of Done FT-033:**
- ✅ Mail module con @nestjs-modules/mailer
- ✅ Bull queues para envío asíncrono
- ✅ Templates HTML para 9 tipos de emails:
  1. Order confirmation
  2. Resale confirmation
  3. Cancel resale
  4. Ticket sold (secondary market)
  5. Transfer from
  6. Transfer to
  7. Invitation confirmation
  8. Account confirmation
  9. Password recovery
- ✅ SMS integration con Twilio (opcional)
- ✅ Tests de envío de emails con test mode

**Total Sprint 4:** 124h

**Dependencias:**
- FT-030 → Sprints anteriores (necesita datos de ventas)
- FT-033 → FT-028 (Emails se disparan desde webhooks)
- FT-032 → FT-026 (Descuentos aplican en checkout de Stripe)

---

## SPRINT 5 (9-22 Dic 2025) | ACCESS CONTROL BACKEND

**Dominio:** Access Control API

### EPIC-7: Access Control API

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-037** | Sistema de validación de tickets QR | 18h | 13 | P0 |
| **FT-038** | API de check-in/check-out | 16h | 8 | P0 |
| **FT-039** | Gestión de puertas y zonas de acceso | 14h | 8 | P1 |
| **FT-040** | Sistema de validación offline (sync) | 22h | 13 | P1 |
| **FT-041** | API de transferencia de tickets | 18h | 13 | P1 |
| **FT-042** | Prevención de fraude y duplicados | 16h | 13 | P0 |
| **FT-043** | Logs de accesos en tiempo real (WebSocket) | 12h | 8 | P1 |
| **FT-044** | Testing validación de tickets | 10h | 5 | P0 |

**Definition of Done FT-037:**
- ✅ Endpoint: PATCH /events/access
- ✅ Validación de estados:
  - OPEN → GRANTED (permitir acceso)
  - CLOSED → DENIED (ya usado)
  - SALE → DENIED (en venta secundaria)
  - EXPIRED → DENIED (expirado)
- ✅ Actualización de Sale.status a CLOSED
- ✅ History de acceso registrado (activity: GRANTED/DENIED)
- ✅ Response time <200ms (99th percentile)

**Definition of Done FT-043:**
- ✅ Socket.IO server integrado con Azure Web PubSub
- ✅ Hub "Centro" configurado
- ✅ Evento emitido: 'access' con datos del ticket
- ✅ Conexiones por promoter tracked en Map
- ✅ Disconnect automático al cerrar cliente
- ✅ Tests de conexión WebSocket

**Total Sprint 5:** 126h

**Dependencias:**
- FT-037 → FT-028 (Validación necesita tickets creados)
- FT-038 → FT-037 (Check-in usa validación de QR)
- FT-043 → FT-038 (WebSocket notifica check-ins)

---

## SPRINT 6 (7-20 Ene 2026) | MARKETPLACE FRONTEND

**Dominio:** Marketplace Web App

### EPIC-8: Marketplace UI (Next.js)

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-045** | Setup Next.js 15 y estructura base | 10h | 5 | P0 |
| **FT-046** | Diseño sistema de componentes (UI Kit) | 18h | 13 | P0 |
| **FT-047** | Homepage y landing pages | 16h | 8 | P0 |
| **FT-048** | Página de búsqueda y filtros | 18h | 13 | P0 |
| **FT-049** | Página de detalle de evento | 16h | 8 | P0 |
| **FT-050** | Flujo de compra (carrito) | 20h | 13 | P0 |
| **FT-051** | Checkout y pago con Stripe Elements | 18h | 13 | P0 |
| **FT-052** | Perfil de usuario y mis tickets | 14h | 8 | P1 |

**Definition of Done FT-046:**
- ✅ Radix UI + Tailwind CSS configurados
- ✅ Componentes base implementados:
  - Button, Card, Dialog, Input, Select, Checkbox, Radio
  - Dropdown, Modal, Toast, Tabs, Accordion
- ✅ Theme system con CSS variables
- ✅ Dark mode support (opcional)
- ✅ Storybook configurado con todos los componentes

**Definition of Done FT-051:**
- ✅ Stripe Elements integrado (@stripe/react-stripe-js)
- ✅ Payment Element con appearance customizado
- ✅ Flujo completo:
  1. Crear Payment Intent (API call)
  2. Renderizar Stripe Elements con clientSecret
  3. Confirmar pago con stripe.confirmPayment()
  4. Redirect a /resume con paymentIntentId
- ✅ Manejo de errores de pago (tarjeta rechazada, 3DS, etc.)
- ✅ Loading states durante procesamiento
- ✅ Tests E2E con Stripe test cards

**Total Sprint 6:** 130h

**Dependencias:**
- FT-045 → Todos los demás (base del proyecto)
- FT-046 → FT-047, FT-048, FT-049 (componentes usados en páginas)
- FT-050 → FT-051 (checkout necesita carrito)
- FT-051 → FT-026 (Stripe frontend necesita backend)

---

## SPRINT 7 (21 Ene - 3 Feb 2026) | MARKETPLACE FRONTEND (cont.)

**Dominio:** Marketplace Features Avanzadas

### EPIC-8: Marketplace UI (continuación)

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-053** | Mercado secundario (reventa) UI | 20h | 13 | P1 |
| **FT-054** | Wallet de tickets (visualización NFTs) | 18h | 13 | P1 |
| **FT-055** | Sistema de notificaciones in-app | 14h | 8 | P1 |
| **FT-056** | Responsive design y mobile optimization | 16h | 8 | P0 |
| **FT-057** | Integración Web3 (MetaMask/WalletConnect) | 20h | 13 | P1 |
| **FT-058** | SEO y optimización performance | 12h | 8 | P1 |
| **FT-059** | Testing E2E marketplace (Playwright) | 16h | 8 | P0 |

**Definition of Done FT-054:**
- ✅ Página /account?tab=tickets
- ✅ Lista de tickets del usuario con:
  - QR code (generado con react-qrcode-logo)
  - Tipo de ticket, precio, status
  - Evento info (nombre, fecha, venue)
- ✅ Modal de detalle de ticket
- ✅ Botones de acción: Resell, Transfer, Download PDF
- ✅ Integración con API para obtener tickets

**Definition of Done FT-057:**
- ✅ wagmi o ethers.js integrado
- ✅ Connect wallet button (MetaMask, WalletConnect, Coinbase Wallet)
- ✅ Visualización de address conectada
- ✅ Funcionalidad: ver NFTs en wallet
- ✅ (Opcional) Transfer de NFT desde UI

**Definition of Done FT-059:**
- ✅ Playwright configurado
- ✅ Tests E2E implementados:
  - Flujo completo de compra (search → detail → cart → checkout → payment)
  - Login y registro
  - Visualización de tickets comprados
  - Filtrado y búsqueda de eventos
- ✅ Tests corriendo en CI/CD
- ✅ Coverage >80% en flujos críticos

**Total Sprint 7:** 116h

**Dependencias:**
- FT-053 → FT-025 (Frontend reventa necesita backend)
- FT-054 → FT-028 (Tickets necesitan estar creados)
- FT-057 → FT-007 (Web3 necesita contratos deployed)
- FT-059 → Todos los anteriores (tests E2E cubren todo)

---

## SPRINT 8 (4-17 Feb 2026) | ADMIN PANEL FRONTEND

**Dominio:** Admin Dashboard

### EPIC-9: Admin Dashboard (Next.js)

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-060** | Setup admin app Next.js y estructura | 10h | 5 | P0 |
| **FT-061** | Dashboard principal con KPIs | 18h | 13 | P0 |
| **FT-062** | Gestión de eventos (CRUD UI) | 20h | 13 | P0 |
| **FT-063** | Gestión de tickets e inventario | 18h | 13 | P0 |
| **FT-064** | Sistema de reportes y analytics | 20h | 13 | P1 |
| **FT-065** | Gestión de usuarios y organizadores | 16h | 8 | P1 |
| **FT-066** | Configuración de promociones y coupons | 14h | 8 | P1 |
| **FT-067** | Sistema de notificaciones push (WebSocket) | 12h | 8 | P1 |

**Definition of Done FT-061:**
- ✅ Dashboard con widgets de KPIs:
  - Total revenue (hoy, semana, mes)
  - Tickets vendidos (con gráfico de línea)
  - Eventos activos
  - Tasa de conversión
  - Top 5 eventos por ventas
- ✅ Gráficos con React Google Charts o Recharts
- ✅ Filtros por rango de fechas
- ✅ Auto-refresh cada 30 segundos

**Definition of Done FT-062:**
- ✅ Ant Design 5 configurado con theme customizado
- ✅ Páginas implementadas:
  - /events (lista con tabla)
  - /events/create (formulario multi-step)
  - /events/[id] (detalle con tabs)
  - /events/[id]/edit (formulario edición)
- ✅ Upload de imágenes con drag & drop
- ✅ Validación de formularios con react-hook-form + zod
- ✅ Estados de evento: CREATED → LAUNCHED (botón launch)

**Definition of Done FT-067:**
- ✅ Socket.IO client conectado a 3 servicios:
  - Admin events socket
  - Access control socket
  - Marketplace socket
- ✅ Notificaciones mostradas con Ant Design notification API
- ✅ Badge con contador de notificaciones no leídas
- ✅ Notificaciones persistidas en BD

**Total Sprint 8:** 128h

**Dependencias:**
- FT-061 → FT-030 (KPIs necesitan API de analytics)
- FT-062 → FT-017 (CRUD necesita backend events)
- FT-067 → FT-043 (WebSocket frontend necesita backend)

---

## SPRINT 9 (18 Feb - 3 Mar 2026) | ACCESS CONTROL APPS

**Dominio:** Access Control (Web + Mobile Apps)

### EPIC-10: Access Control Apps

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-068** | App web de validación (Next.js/React) | 20h | 13 | P0 |
| **FT-069** | Escaneo QR y validación | 18h | 13 | P0 |
| **FT-070** | Interfaz de control de puertas | 16h | 8 | P1 |
| **FT-071** | Dashboard de accesos en tiempo real | 18h | 13 | P1 |
| **FT-072** | App móvil base (Expo 52 + React Native) | 24h | 13 | P0 |
| **FT-073** | Modo offline y sincronización | 20h | 13 | P1 |
| **FT-074** | Testing apps de acceso | 12h | 8 | P0 |

**Definition of Done FT-069:**
- ✅ react-qr-scanner o html5-qrcode integrado
- ✅ Cámara access con permisos
- ✅ Decodificación de QR → extrae sale._id
- ✅ API call a PATCH /events/access con sale ID
- ✅ UI muestra resultado:
  - ✅ GRANTED: pantalla verde con nombre del asistente
  - ❌ DENIED: pantalla roja con razón (ticket usado, expirado, etc.)
- ✅ Sonido de éxito/error
- ✅ Vibración en móvil

**Definition of Done FT-072:**
- ✅ Expo 52 + React Native 0.76 configurado
- ✅ Estructura de navegación (React Navigation)
- ✅ Pantallas implementadas:
  - Login
  - Home (escaneo QR)
  - Lista de asistentes
  - Configuración
- ✅ QR Scanner con expo-camera
- ✅ Build para iOS y Android (EAS Build)

**Definition of Done FT-073:**
- ✅ Redux Persist o AsyncStorage para cache local
- ✅ Lista de asistentes cached para acceso offline
- ✅ Queue de validaciones offline (pendientes de sync)
- ✅ Sincronización automática al recuperar conexión
- ✅ Indicador de modo online/offline

**Total Sprint 9:** 128h

**Dependencias:**
- FT-069 → FT-037 (Validación frontend necesita backend)
- FT-071 → FT-043 (Dashboard usa WebSocket)
- FT-072 → FT-069 (App móvil usa mismo sistema de escaneo)
- FT-073 → FT-069 (Offline necesita validación implementada)

---

## SPRINT 10 (4-17 Mar 2026) | INTEGRACIONES

**Dominio:** Integraciones & Scripts

### EPIC-11: Integraciones Externas

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-075** | Scripts de migración de datos | 16h | 8 | P1 |
| **FT-076** | Integración CRM (Salesforce/HubSpot) | 18h | 13 | P2 |
| **FT-077** | Integración email marketing (SendGrid) | 14h | 8 | P1 |
| **FT-078** | Integración analytics (Google/Mixpanel) | 12h | 5 | P2 |
| **FT-079** | Webhooks para terceros | 14h | 8 | P2 |
| **FT-080** | API pública para partners | 20h | 13 | P2 |
| **FT-081** | Documentación API (Swagger/OpenAPI) | 10h | 5 | P1 |
| **FT-082** | SDK JavaScript para partners | 16h | 13 | P3 |

**Definition of Done FT-077:**
- ✅ SendGrid SDK integrado
- ✅ Templates de email en SendGrid:
  - Order confirmation
  - Event reminder (1 día antes)
  - New events newsletter
- ✅ Segmentación de usuarios (compradores, promotores)
- ✅ Opt-out y unsubscribe links
- ✅ Analytics de emails (open rate, click rate)

**Definition of Done FT-081:**
- ✅ @nestjs/swagger configurado en todas las APIs
- ✅ Decoradores @ApiTags, @ApiOperation, @ApiResponse en todos los endpoints
- ✅ DTOs documentados con @ApiProperty
- ✅ Swagger UI accesible en /api/docs
- ✅ OpenAPI 3.0 spec exportable
- ✅ Ejemplos de request/response en cada endpoint

**Total Sprint 10:** 120h

**Dependencias:**
- FT-077 → FT-033 (Email marketing usa sistema de emails)
- FT-081 → Todas las APIs (documenta endpoints existentes)
- FT-080 → FT-081 (API pública necesita documentación)

---

## SPRINT 11 (18-31 Mar 2026) | SMART CONTRACTS V2

**Dominio:** Blockchain Features Avanzadas

### EPIC-12: Smart Contracts Avanzados

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-083** | Contrato de royalties (reventa) | 20h | 13 | P1 |
| **FT-084** | Contrato de marketplace descentralizado | 24h | 13 | P2 |
| **FT-085** | Sistema de staking para holders | 18h | 13 | P2 |
| **FT-086** | Contrato de membresías/subscripciones | 20h | 13 | P2 |
| **FT-087** | Integración con IPFS para metadata | 16h | 8 | P1 |
| **FT-088** | Auditoría de seguridad contratos | 14h | 8 | P0 |
| **FT-089** | Deploy a mainnet | 8h | 5 | P0 |

**Definition of Done FT-083:**
- ✅ EIP-2981 (Royalty Standard) implementado
- ✅ Royalty fee configurable por evento (ej: 5%)
- ✅ Royalty recipient = promoter address
- ✅ Tests de royalty en marketplace secundario
- ✅ Gas optimized

**Definition of Done FT-087:**
- ✅ IPFS node configurado (Pinata o Infura)
- ✅ Metadata JSON subido a IPFS al mintear NFT
- ✅ TokenURI apunta a ipfs://...
- ✅ Metadata incluye:
  - name, description, image
  - event details, seat/zone, attributes
- ✅ Gateway público para visualización

**Definition of Done FT-088:**
- ✅ Code review por desarrollador senior
- ✅ Static analysis con Slither
- ✅ Tests con 100% coverage en funciones críticas
- ✅ Formal verification (opcional, con Certora)
- ✅ Report de auditoría documentado

**Total Sprint 11:** 120h

**Dependencias:**
- FT-083 → FT-007 (Royalties extienden contrato base)
- FT-087 → FT-007 (IPFS metadata para NFTs)
- FT-088 → FT-083, FT-087 (Auditoría de contratos finales)
- FT-089 → FT-088 (Deploy a mainnet solo si auditoría OK)

---

## SPRINT 12 (1-14 Abr 2026) | QA & REFINAMIENTO

**Dominio:** Testing & Performance

### EPIC-13: QA y Optimización

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-090** | Testing de integración end-to-end | 20h | 13 | P0 |
| **FT-091** | Testing de carga y performance (k6/JMeter) | 18h | 13 | P0 |
| **FT-092** | Security audit y pentesting | 20h | 13 | P0 |
| **FT-093** | Optimización de queries y caching | 16h | 8 | P1 |
| **FT-094** | Monitoreo y alertas (Datadog/Sentry) | 14h | 8 | P0 |
| **FT-095** | Backup y disaster recovery | 12h | 8 | P0 |
| **FT-096** | Documentación de usuario | 16h | 5 | P1 |
| **FT-097** | Training videos y tutoriales | 12h | 5 | P2 |

**Definition of Done FT-091:**
- ✅ k6 scripts implementados para:
  - Compra de tickets (simulate 100 concurrent users)
  - Check-in de tickets (simulate 500 scans/min)
  - API de búsqueda de eventos (simulate 1000 req/min)
- ✅ Métricas obtenidas:
  - Response time (p95, p99)
  - Throughput (req/s)
  - Error rate
- ✅ Objetivos de performance:
  - p95 < 500ms para APIs críticas
  - p99 < 1s para APIs críticas
  - Error rate < 0.1%

**Definition of Done FT-092:**
- ✅ OWASP Top 10 checklist verificado
- ✅ Vulnerabilidades críticas:
  - SQL/NoSQL injection (ninguna encontrada)
  - XSS (ninguna encontrada)
  - CSRF (tokens implementados)
  - CORS correctamente configurado
  - Secrets no expuestos en código
- ✅ Rate limiting testeado
- ✅ JWT security validado
- ✅ Report de penetration testing documentado

**Definition of Done FT-094:**
- ✅ Sentry configurado en todos los servicios
- ✅ Datadog APM instalado (o alternativa)
- ✅ Health checks en /health, /ready endpoints
- ✅ Alertas configuradas:
  - Error rate > 1%
  - Response time > 2s
  - CPU/Memory > 80%
  - Database connection failures
- ✅ Dashboard de monitoreo creado
- ✅ On-call rotation definida

**Total Sprint 12:** 128h

**Dependencias:**
- FT-090 → Todos los sprints anteriores (tests E2E de todo)
- FT-091 → FT-090 (Load testing después de E2E)
- FT-092 → FT-091 (Security audit con sistema bajo carga)
- FT-094 → FT-092 (Monitoreo después de security fixes)

---

## SPRINT 13 (15-28 Abr 2026) | LANDING & MARKETING

**Dominio:** Landing Page & Marketing Tools

### EPIC-14: Landing Page

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-098** | Diseño y desarrollo landing page (Next.js) | 20h | 13 | P0 |
| **FT-099** | Páginas institucionales (About/FAQ/Terms) | 16h | 8 | P1 |
| **FT-100** | Blog y sistema de contenidos (CMS) | 18h | 13 | P2 |
| **FT-101** | Forms de contacto y leads | 12h | 5 | P1 |
| **FT-102** | Integración marketing tools (GTM, pixels) | 14h | 8 | P1 |

**Definition of Done FT-098:**
- ✅ Landing page con secciones:
  - Hero con CTA principal
  - Features/Benefits
  - How it works
  - Testimonials
  - Pricing (si aplica)
  - Footer con links
- ✅ Responsive design (mobile-first)
- ✅ Animaciones con Framer Motion
- ✅ Optimización SEO (meta tags, sitemap)
- ✅ Performance: Lighthouse score >90

### EPIC-15: Go-to-Market

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-103** | Email templates transaccionales (finales) | 16h | 8 | P0 |
| **FT-104** | Campañas de email marketing (setup) | 14h | 8 | P1 |
| **FT-105** | Material de marketing (guías/PDFs) | 12h | 5 | P2 |

**Definition of Done FT-103:**
- ✅ Templates HTML refinados con branding final
- ✅ A/B testing setup en SendGrid
- ✅ Personalización con variables (nombre, evento, etc.)
- ✅ Preview de emails en múltiples clientes (Gmail, Outlook, etc.)
- ✅ Mobile-responsive emails

**Total Sprint 13:** 122h

**Dependencias:**
- FT-098 → Diseño/branding aprobado
- FT-102 → FT-098 (Marketing tools en landing)
- FT-103 → FT-077 (Templates finales de email marketing)

---

## SPRINT 14 (29 Abr - 12 May 2026) | DEPLOYMENT & LANZAMIENTO

**Dominio:** DevOps & Production Release

### EPIC-16: Production Deployment

| Ticket | Descripción | Horas | Story Points | Prioridad |
|--------|-------------|-------|--------------|-----------|
| **FT-106** | Setup infraestructura producción (AWS/GCP/Azure) | 20h | 13 | P0 |
| **FT-107** | Configuración CDN y load balancers | 14h | 8 | P0 |
| **FT-108** | SSL/TLS y certificados | 8h | 3 | P0 |
| **FT-109** | Deploy de todos los servicios | 18h | 13 | P0 |
| **FT-110** | Configuración DNS y dominios | 8h | 3 | P0 |
| **FT-111** | Smoke testing en producción | 16h | 8 | P0 |
| **FT-112** | Plan de rollback y contingencia | 12h | 8 | P0 |
| **FT-113** | Documentación operativa (runbooks) | 14h | 8 | P1 |
| **FT-114** | Formación equipo de soporte | 16h | 8 | P1 |
| **FT-115** | Lanzamiento beta privado | 8h | 5 | P0 |

**Definition of Done FT-106:**
- ✅ Infraestructura provisionada:
  - Kubernetes cluster (GKE/EKS/AKS)
  - MongoDB cluster (production tier)
  - Redis cluster
  - Object storage (S3/Azure Blob)
- ✅ Networking configurado (VPC, subnets, security groups)
- ✅ Autoscaling policies definidas
- ✅ Infrastructure as Code (Terraform/Pulumi)

**Definition of Done FT-109:**
- ✅ Servicios desplegados en producción:
  - futura-tickets-admin-api
  - futura-market-place-api
  - futura-access-api
  - futura-market-place-v2 (frontend)
  - futura-tickets-admin (frontend)
  - futura-access-app (mobile - stores)
- ✅ Environment variables configuradas
- ✅ Secrets en Secrets Manager
- ✅ Health checks pasando

**Definition of Done FT-111:**
- ✅ Smoke tests ejecutados:
  - Login de usuarios
  - Compra de ticket de prueba
  - Check-in de ticket
  - Visualización de analytics
  - Envío de email
- ✅ Tests pasando en producción
- ✅ No hay errores críticos en logs
- ✅ Métricas de monitoreo OK

**Definition of Done FT-115:**
- ✅ Lista de usuarios beta creada (20-50 usuarios)
- ✅ Invitaciones enviadas
- ✅ Onboarding flow testeado
- ✅ Feedback form para beta users
- ✅ Support channel configurado (Discord/Slack)

**Total Sprint 14:** 134h

**Dependencias:**
- FT-106 → FT-107, FT-108, FT-109 (Infra base para deploy)
- FT-109 → FT-111 (Deploy antes de testing)
- FT-111 → FT-115 (Beta después de smoke tests)

---

## 📊 RESUMEN EJECUTIVO

### Por Dominio

| Dominio | Sprints | Horas | % Total |
|---------|---------|-------|---------|
| **Infraestructura & Core** | Sprint 1 | 132h | 7.5% |
| **Backend APIs** | Sprints 2-5 | 504h | 28.6% |
| **Frontend Apps** | Sprints 6-9 | 502h | 28.5% |
| **Integraciones** | Sprint 10 | 120h | 6.8% |
| **Blockchain** | Sprints 1, 11 | 250h | 14.2% |
| **QA & Launch** | Sprints 12-14 | 384h | 21.8% |

**Total:** 1,762 horas | 14 sprints | 28 semanas

### Timeline

```
Oct 2025       Nov 2025       Dic 2025       Ene 2026       Feb 2026       Mar 2026       Abr 2026       May 2026
   │               │              │              │              │              │              │              │
   ▼               ▼              ▼              ▼              ▼              ▼              ▼              ▼
Sprint 1       Sprint 2       Sprint 3       Sprint 4       Sprint 5       Sprint 6       Sprint 7       Sprint 8
(Infra +       (Backend       (Marketplace   (Admin         (Access        (Marketplace   (Marketplace   (Admin
Blockchain)    Core)          Backend)       Backend)       Control)       Frontend)      Frontend)      Panel)

                                                             Sprint 9       Sprint 10      Sprint 11      Sprint 12
                                                             (Access        (Integrations) (Blockchain    (QA +
                                                             Apps)                         V2)            Performance)

                                                                                          Sprint 13      Sprint 14
                                                                                          (Landing +     (Deploy +
                                                                                          Marketing)     Launch)
                                                                                                           │
                                                                                                           ▼
                                                                                                       BETA LAUNCH
                                                                                                       12 Mayo 2026
```

### Hitos Clave

| Hito | Fecha | Entregable |
|------|-------|------------|
| **Milestone 1: Backend Core** | 10 Nov 2025 | APIs funcionales con auth, eventos, marketplace |
| **Milestone 2: Blockchain Integration** | 22 Dic 2025 | NFT tickets operativos |
| **Milestone 3: Frontend MVPs** | 3 Feb 2026 | Marketplace + Admin panel funcionales |
| **Milestone 4: Access Control** | 3 Mar 2026 | Sistema de check-in operativo |
| **Milestone 5: Production Ready** | 14 Abr 2026 | Sistema completo con QA |
| **Milestone 6: BETA LAUNCH** | 12 May 2026 | Lanzamiento beta privado |

---

## 📝 NOTAS PARA JIRA/LINEAR

### Configuración de Tickets

Cada ticket debe incluir:

1. **Campos obligatorios:**
   - Title (descriptivo)
   - Description (detallada)
   - Story Points (Fibonacci: 1, 2, 3, 5, 8, 13)
   - Horas estimadas
   - Prioridad (P0-Critical, P1-High, P2-Medium, P3-Low)
   - Sprint assignment
   - Epic assignment
   - Assignee

2. **Definition of Done:**
   - Checklist específico por ticket
   - Tests implementados y pasando
   - Code review aprobado
   - Documentación actualizada
   - Deploy a staging exitoso

3. **Criterios de Aceptación:**
   - Escenarios de uso (Given/When/Then)
   - Casos edge documentados
   - Performance requirements
   - Security requirements (si aplica)

4. **Etiquetas sugeridas:**
   - `frontend` / `backend` / `blockchain` / `devops` / `qa`
   - `api` / `ui` / `db` / `infra`
   - `bug` / `feature` / `tech-debt` / `documentation`
   - `critical` / `security` / `performance`

5. **Dependencias:**
   - Links a tickets bloqueantes ("blocked by")
   - Links a tickets relacionados ("relates to")
   - Sub-tasks si el ticket es muy grande

### Workflow de Tickets

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Backlog  │────►│   Todo   │────►│In Progress────►│In Review │────►│  Done    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                         │
                                         │ (if issues found)
                                         ▼
                                   ┌──────────┐
                                   │  Rework  │
                                   └──────────┘
```

### Code Review Checklist

- [ ] Code sigue style guide del proyecto
- [ ] Tests unitarios implementados (coverage >80%)
- [ ] No hay console.logs o debuggers
- [ ] Error handling implementado
- [ ] Documentación (JSDoc/comments) agregada
- [ ] Performance considerado (no N+1 queries, etc.)
- [ ] Security checklist revisado
- [ ] No hay secrets hardcoded

### Sprint Ceremonies

**Sprint Planning:** Primer día del sprint
- Duración: 2-3 horas
- Review del sprint anterior
- Planning poker para nuevos tickets
- Capacity planning

**Daily Standup:** Todos los días laborales
- Duración: 15 minutos
- Formato: ¿Qué hice ayer? ¿Qué haré hoy? ¿Tengo blockers?

**Sprint Review:** Último día del sprint
- Duración: 1 hora
- Demo de features completadas
- Feedback de stakeholders

**Sprint Retrospective:** Último día del sprint
- Duración: 1 hora
- ¿Qué funcionó bien? ¿Qué mejorar? Action items

---

## 🎯 RECOMENDACIONES FINALES

### Para el Éxito del Proyecto

1. **Pair Programming:** Especialmente en blockchain y security-critical features
2. **Feature Flags:** Implementar desde el inicio para deploys graduales
3. **Automated Testing:** CI/CD debe correr tests en cada PR
4. **Documentation:** Mantener actualizado en paralelo al código
5. **Tech Debt:** Reservar 10-15% de cada sprint para refactoring
6. **Buffer Time:** Los 130h son estimados; considerar buffer de 15-20%

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retrasos en blockchain audit | Alta | Alto | Empezar auditoría en Sprint 8, no Sprint 11 |
| Integración Stripe compleja | Media | Alto | POC en Sprint 2, no esperar a Sprint 3 |
| Performance issues en producción | Media | Alto | Load testing en Sprint 12, no después |
| Scope creep | Alta | Medio | Product Owner debe aprobar cambios |

### Mejores Prácticas

- **Git Flow:** Feature branches → develop → main
- **Commits:** Conventional commits (feat:, fix:, docs:, etc.)
- **PRs:** Máximo 400 líneas, review en <24h
- **Deploy:** Blue-green deployments para zero-downtime
- **Monitoring:** Alertas configuradas desde día 1 en producción

---

**FIN DEL PLAN DE SPRINTS**

> **Nota:** Este plan es una estimación inicial. Debe refinarse en cada sprint planning con el equipo de desarrollo.

**Fecha de creación:** 2025-10-13
**Próxima revisión:** Cada 4 sprints (8 semanas)
