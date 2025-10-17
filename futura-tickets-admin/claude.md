# FUTURA-TICKETS-ADMIN-MAIN - ANÁLISIS TÉCNICO

## 1. RESUMEN EJECUTIVO

**Propósito**: Panel de administración web para promotores de eventos de Futura Tickets. Gestión de eventos, ventas, clientes, pagos, analytics y campañas.

**Stack Tecnológico**:
- Next.js 15.0.3 + React 19 RC
- Ant Design 5.22.0 (UI framework)
- TypeScript 5
- Socket.IO Client 4.8.1 (real-time notifications)
- Google OAuth (@react-oauth/google)
- React Google Charts 5.2.1 (analytics)
- Sass 1.80.6

**Métricas**: 11,343 líneas de código, puerto 3001

---

## 2. ARQUITECTURA DEL SISTEMA

```
┌──────────────────────────────────────────────────┐
│   FUTURA TICKETS ADMIN PANEL (Next.js 15)      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         App Router Pages                   │ │
│  │  /events │ /clients │ /payments │ /analytics│ │
│  │  /campaigns │ /settings │ /account         │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │        API Routes (BFF Pattern)            │ │
│  │  /api/events │ /api/sales │ /api/access   │ │
│  │  /api/payments │ /api/clients │ /api/resale│ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │      Global State (React Context)          │ │
│  │  account, events, notifications, menu      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │        Socket.IO Clients (3)               │ │
│  │  Socket.tsx │ SocketAccess.tsx             │ │
│  │  SocketMarketPlace.tsx                     │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │         Ant Design Components              │ │
│  │  Tables, Forms, Modals, Charts, Menus      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │  futura-tickets-admin-api │
        │  (Backend NestJS)         │
        └───────────────────────────┘
```

---

## 3. ESTRUCTURA DE DIRECTORIOS

```
futura-tickets-admin-main/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home redirect
│   ├── globals.scss             # Global styles
│   │
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── account/
│   │   └── page.tsx
│   │
│   ├── events/                  # Gestión de eventos
│   │   ├── page.tsx             # Lista de eventos
│   │   ├── create/page.tsx      # Crear evento
│   │   ├── [event]/page.tsx     # Detalle evento
│   │   └── [event]/edit/page.tsx
│   │
│   ├── clients/                 # Gestión de clientes
│   │   ├── page.tsx
│   │   └── [client]/page.tsx    # Detalle cliente
│   │
│   ├── payments/                # Pagos y withdrawals
│   │   └── page.tsx
│   │
│   ├── analytics/               # Analytics y estadísticas
│   │   └── page.tsx
│   │
│   ├── campaigns/               # Campañas de marketing
│   │   └── page.tsx
│   │
│   ├── settings/                # Configuración
│   │   └── page.tsx
│   │
│   └── api/                     # API Routes (BFF)
│       ├── clients/
│       │   ├── route.ts
│       │   └── [client]/route.ts
│       ├── payments/
│       │   ├── methods/route.ts
│       │   ├── methods/[id]/route.ts
│       │   ├── requests/route.ts
│       │   └── requests/[id]/route.ts
│       ├── sales/
│       │   ├── route.ts
│       │   └── [sale]/route.ts
│       ├── resale/[event]/route.ts
│       ├── access/
│       │   ├── [event]/route.ts
│       │   └── accounts/[event]/route.ts
│       ├── launch/[event]/route.ts
│       ├── promocodes/
│       │   └── [eventId]/
│       │       ├── route.ts
│       │       └── [id]/route.ts
│       └── coupons/[eventId]/
│           ├── route.ts
│           └── [id]/route.ts
│
├── components/                  # React Components
│   ├── FuturaAdminProvider.tsx  # Ant Design config provider
│   ├── RootProvider.tsx         # Wraps all providers
│   ├── GlobalStateProvider/     # React Context
│   │   └── GlobalStateProvider.tsx
│   │
│   ├── Socket.tsx               # Socket.IO for admin events
│   ├── SocketAccess.tsx         # Socket.IO for access events
│   ├── SocketMarketPlace.tsx    # Socket.IO for marketplace events
│   │
│   ├── Dashboard/               # Dashboard components
│   ├── Events/                  # Event listing components
│   ├── Event/                   # Event detail components (13 files)
│   ├── CreateEvent/             # Event creation form
│   ├── Analytics/               # Analytics charts
│   ├── Campaigns/               # Campaign management
│   ├── Payments/                # Payment management
│   ├── OrderDetails/            # Order details modal
│   ├── TicketDetails/           # Ticket details modal
│   ├── User/                    # User profile
│   ├── Users/                   # Users listing
│   ├── Login/                   # Login form
│   ├── Register/                # Register form
│   ├── Profile/                 # Profile edit
│   ├── Settings/                # Settings UI
│   └── NotificationsMenu/       # Notifications dropdown
│
├── shared/                      # Shared utilities
│   ├── interfaces.tsx           # TypeScript interfaces (9,690 líneas)
│   ├── services.tsx             # API service layer (28,142 líneas)
│   ├── Menu/                    # Sidebar menu
│   ├── Filters/                 # Filter components
│   ├── GoBack/                  # Back button
│   ├── Loader/                  # Loading spinner
│   ├── Error/                   # Error display
│   ├── ColumnChart/             # Column chart component
│   ├── LineChart/               # Line chart component
│   ├── PieChart/                # Pie chart component
│   ├── ExportEventCsv/          # CSV export
│   ├── ResendOrderModal/        # Resend order emails
│   └── utils/                   # Utility functions
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── Dockerfile                   # Docker build
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## 4. COMPONENTES Y MÓDULOS PRINCIPALES

### 4.1 Global State Provider

**Archivo**: `components/GlobalStateProvider/GlobalStateProvider.tsx`

```typescript
interface GlobalState {
  isConnected: boolean;
  address: string | undefined;
  menuState: boolean;
  notificationsMenuState: boolean;
  account: Account | undefined;
  events: Event[];
  goBackRoute: string | undefined;
  notifications: Notification[];
}

// React useReducer for state management
const [state, dispatch] = React.useReducer((state, newValue) => ({ ...state, ...newValue }), defaultState);

// Custom hook
export const useGlobalState = (): [GlobalState, any] => [
  React.useContext(GlobalStateContext),
  React.useContext(DispatchStateContext),
];
```

### 4.2 Service Layer

**Archivo**: `shared/services.tsx` (28,142 líneas)

**Funciones principales**:
```typescript
// Authentication
export async function createAccount(createAccount: CreateAccount)
export async function createPromoterAccount(createPromoterAccount: CreateAccount)
export async function loginAccount(loginAccount: LoginAccount)
export async function loginWithGoogle(googleCode: string)
export async function checkToken()

// Events
export async function getEvents(): Promise<Event[]>
export async function createEvent(createEvent: CreateEvent): Promise<Event>
export async function editEvent(event: string, editEvent: EditEvent): Promise<Event>
export async function launchEvent(event: string, dateTime: DateTime): Promise<Event>
export async function deleteEvent(event: string)
export async function uploadEventImage(file: File, event: string)

// Sales & Tickets
export async function getSales(event: string): Promise<Sale[]>
export async function getSalesByAccount(account: string): Promise<Sale[]>
export async function updateSaleStatus(sale: string, status: TicketStatus)
export async function transferSale(sale: string, transferTo: TransferTo)

// Orders
export async function getOrders(): Promise<Order[]>
export async function getOrderById(orderId: string): Promise<Order>
export async function resendOrderEmail(orderId: string)

// Clients
export async function getClients(): Promise<PromoterClient[]>
export async function getClientById(clientId: string): Promise<PromoterClient>

// Payments
export async function getPaymentMethods(): Promise<PaymentMethod[]>
export async function createPaymentMethod(paymentMethod: PaymentMethod)
export async function updatePaymentMethod(id: string, paymentMethod: PaymentMethod)
export async function getPaymentRequests(): Promise<RequestedPayment[]>
export async function createPaymentRequest(request: RequestedPayment)

// Promo Codes & Coupons
export async function getPromoCodes(eventId: string): Promise<PromoCode[]>
export async function createPromoCode(eventId: string, promoCode: PromoCode)
export async function deletePromoCode(eventId: string, promoCodeId: string)
export async function getCoupons(eventId: string): Promise<Coupon[]>
export async function createCoupon(eventId: string, coupon: Coupon)

// Invitations
export async function createInvitation(invitation: CreateInvitation)
export async function getInvitations(event: string): Promise<Invitation[]>

// Access Control
export async function getAccessAccounts(event: string): Promise<Account[]>
export async function createAccessAccount(createAccessAccount: CreateAccess)

// Analytics
export async function getEventAnalytics(event: string): Promise<Analytics>
export async function getPromoterAnalytics(): Promise<Analytics>

// Settings
export async function getApiSettings(): Promise<ApiSettings>
export async function updateApiSettings(settings: ApiSettings)
```

**Patrón de autenticación**:
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 4.3 Socket.IO Components

**Socket.tsx** - Admin Events:
```typescript
'use client';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_FUTURA!);

socket.on('connect', () => {
  console.log('Connected to admin socket');
});

socket.on('order-created', (data) => {
  // Add notification to global state
  dispatch({ notifications: [...notifications, data] });
});

socket.on('sale-updated', (data) => {
  // Update events list
  dispatch({ events: updatedEvents });
});
```

**SocketAccess.tsx** - Access Control Events:
```typescript
const accessSocket: Socket = io(process.env.NEXT_PUBLIC_ACCESS!);

accessSocket.on('check-in', (data) => {
  // Update attendance stats
});
```

**SocketMarketPlace.tsx** - Marketplace Events:
```typescript
const marketplaceSocket: Socket = io(process.env.NEXT_PUBLIC_MARKETPLACE!);

marketplaceSocket.on('resale-created', (data) => {
  // Update resale listings
});
```

### 4.4 Ant Design Provider

**FuturaAdminProvider.tsx**:
```typescript
import { ConfigProvider, theme } from 'antd';

export default function FuturaAdminProvider({ children }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00c8b3',
          colorBgContainer: '#1a1a1a',
          colorText: '#ffffff',
          borderRadius: 8,
          fontSize: 14
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

---

## 5. FLUJOS DE DATOS PRINCIPALES

### Flujo de Creación de Evento

```
1. Admin → /events/create
   └─> Formulario con React Hook Form
       ├─> Información básica (nombre, descripción, ubicación)
       ├─> Fechas (launch, start, end)
       ├─> Tickets (tipos, precios, capacidad)
       ├─> Artistas
       ├─> Configuración de reventa
       └─> Upload imagen

2. Submit → createEvent(createEvent: CreateEvent)
   └─> POST ${FUTURA}/api/events
       └─> Backend crea evento (status: CREATED)
       └─> Upload imagen a Azure Blob Storage
       └─> Socket.IO notification: 'event-created'

3. Admin → Lanza evento
   └─> launchEvent(eventId, dateTime)
       └─> PATCH ${FUTURA}/api/launch/${eventId}
           └─> status: LAUNCHED
           └─> Evento visible en marketplace
```

### Flujo de Gestión de Ventas

```
1. Admin → /events/[eventId]
   └─> Tab "Ventas"
       └─> getSales(eventId)
           └─> Lista de tickets vendidos con:
               - Cliente (nombre, email)
               - Tipo de ticket
               - Precio
               - Estado (OPEN, SOLD, TRANSFERED, etc.)
               - QR Code
               - Acciones (transfer, resend email, update status)

2. Socket.IO updates en tiempo real:
   socket.on('sale-updated', (sale) => {
     // Actualiza tabla automáticamente
   });
```

### Flujo de Pagos a Promotor

```
1. Admin → /payments
   └─> Tab "Payment Methods"
       └─> Gestiona métodos de pago (cuenta bancaria, PayPal, etc.)

   └─> Tab "Requested Payments"
       └─> Solicita pago de ganancias
       └─> createPaymentRequest({ amount, method })
       └─> Backend procesa (PENDING → APPROVED → COMPLETED)
```

### Flujo de Analytics

```
1. Admin → /analytics
   └─> Dashboard con:
       ├─> Ventas totales (line chart)
       ├─> Ventas por evento (pie chart)
       ├─> Ingresos por mes (column chart)
       ├─> Top eventos (table)
       └─> Métricas en tiempo real

2. getPromoterAnalytics()
   └─> Calcula KPIs:
       - Total revenue
       - Total tickets sold
       - Average ticket price
       - Conversion rate
```

---

## 6. CONFIGURACIÓN Y DEPLOYMENT

### Variables de Entorno

```bash
# Backend API
NEXT_PUBLIC_FUTURA=https://admin-api.futuratickets.com

# Socket.IO Endpoints
NEXT_PUBLIC_FUTURA=wss://admin-api.futuratickets.com
NEXT_PUBLIC_ACCESS=wss://access-api.futuratickets.com
NEXT_PUBLIC_MARKETPLACE=wss://marketplace-api.futuratickets.com

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Dockerfile

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
EXPOSE 3001
CMD ["npm", "start"]
```

### Scripts

```bash
npm run dev      # Development mode (puerto 3001)
npm run build    # Production build
npm start        # Production server
```

---

## 7. PÁGINAS Y FUNCIONALIDADES

### /events (Dashboard de Eventos)
- Lista de todos los eventos del promotor
- Filtros por estado (CREATED, LAUNCHED, LIVE, CLOSED)
- Búsqueda por nombre
- Acciones: Ver, Editar, Lanzar, Eliminar

### /events/create (Crear Evento)
- Formulario multi-step
- Upload de imágenes
- Configuración de tickets por lotes
- Gestión de artistas
- Configuración de reventa y comisiones

### /events/[eventId] (Detalle de Evento)
- Tabs:
  - **Overview**: Info general, estadísticas
  - **Ventas**: Lista de tickets vendidos
  - **Órdenes**: Órdenes de compra
  - **Reventa**: Tickets en reventa
  - **Promo Codes**: Códigos promocionales
  - **Coupons**: Cupones de descuento
  - **Invitaciones**: Sistema de invitaciones
  - **Access**: Cuentas con acceso al evento
  - **Analytics**: Métricas específicas del evento

### /clients (Clientes)
- Lista de compradores
- Búsqueda por nombre/email
- Vista detallada con historial de compras

### /payments (Pagos)
- Payment Methods: Configurar cuentas de pago
- Requested Payments: Solicitar retiros
- Payment History: Historial de pagos recibidos

### /analytics (Analytics)
- Dashboard con charts (Google Charts)
- KPIs principales
- Exportar datos a CSV

### /campaigns (Campañas)
- Crear campañas de marketing
- Gestionar promo codes y coupons
- Tracking de conversiones

### /settings (Configuración)
- API Keys y webhooks
- Configuración de notificaciones
- Preferencias de cuenta

---

## 8. INTERFACES CLAVE

### Event Interface
```typescript
interface Event {
  _id: string;
  promoter: string;
  name: string;
  description: string;
  image: string;
  ticketImage: string;
  capacity: number;
  maxQuantity: number;
  commission: number;
  resale: Resale;
  artists: Artist[];
  location: Location;
  dateTime: DateTime;
  conditions: Condition[];
  faqs: Faq[];
  tickets: Ticket[];
  ticketLots: TicketLot[];
  status: EventStatus;
  isBlockchain: boolean;
  url: string;
}
```

### Sale Interface
```typescript
interface Sale {
  _id: string;
  order: string;
  event: Event;
  client: Account;
  type: string;
  price: number;
  qrCode: string;
  status: TicketStatus;
  activity: TicketActivity;
  resale: {
    isResale: boolean;
    resalePrice: number;
    resaleDate: Date;
  };
  transfer: {
    from: string;
    to: string;
  };
}
```

### Order Interface
```typescript
interface Order {
  _id: string;
  paymentId: string;
  event: Event;
  client: Account;
  items: Item[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}
```

---

## 9. PROBLEMAS DETECTADOS

### 9.1 Hardcoded URLs
**Múltiples archivos**: Uso de process.env sin validación
```typescript
const API_URL = process.env.NEXT_PUBLIC_FUTURA!;  // ❌ No checked
```

### 9.2 Token en localStorage
```typescript
localStorage.getItem('token')  // ❌ Vulnerable a XSS
```
**Solución**: Usar httpOnly cookies

### 9.3 Error Handling Básico
```typescript
.catch((err) => console.log(err))  // ❌ Solo log, no user feedback
```

### 9.4 0% Test Coverage
No hay archivos de test `.spec.tsx`

### 9.5 README Genérico
README solo contiene info de Next.js, no del proyecto

### 9.6 Services File Enorme
`shared/services.tsx`: 28,142 líneas - debe refactorizarse

### 9.7 Interfaces File Grande
`shared/interfaces.tsx`: 9,690 líneas - debe dividirse por dominio

### 9.8 Sin Validación de Formularios
No se usa librería como Zod o Yup para validación

### 9.9 Socket.IO Sin Error Handling
```typescript
socket.on('error', (error) => {
  // ❌ No implementado
});
```

---

## 10. RECOMENDACIONES

### Crítico (P0)
1. **Mover token a httpOnly cookies**: Mejorar seguridad
2. **Implementar error boundaries**: Capturar errores React
3. **Validar env variables**: Fail fast si faltan vars
4. **Agregar error handling en sockets**: Reconexión automática

### Alto (P1)
1. **Refactorizar services.tsx**: Dividir por dominio (events, sales, payments)
2. **Refactorizar interfaces.tsx**: Separar por módulo
3. **Implementar validación de forms**: React Hook Form + Zod
4. **Agregar tests**: Unit tests para components críticos
5. **Documentar README**: Info específica del proyecto

### Medio (P2)
1. **Code splitting**: Lazy load de componentes grandes
2. **Optimizar imágenes**: Next/Image en lugar de <img>
3. **Implementar SEO**: Meta tags dinámicos
4. **Logging estructurado**: Sentry o LogRocket
5. **Performance monitoring**: Web Vitals

### Bajo (P3)
1. **Internacionalización**: i18n para múltiples idiomas
2. **PWA**: Service worker para uso offline
3. **Accesibilidad**: ARIA labels, keyboard navigation
4. **Theme switcher**: Dark/Light mode toggle
5. **Export funcionalidad**: PDF reports

---

## CONCLUSIÓN

**futura-tickets-admin-main** es un panel de administración Next.js 15 con 11,343 líneas que proporciona gestión completa de eventos, ventas y analytics para promotores.

✅ **Fortalezas**:
- UI moderna con Ant Design
- Real-time updates con Socket.IO
- Arquitectura Next.js App Router
- Google OAuth integrado
- Charts interactivos (Google Charts)
- Gestión completa de eventos y ventas

⚠️ **Áreas de Mejora**:
- Token en localStorage (seguridad)
- Services y interfaces files enormes (+28k y +9k líneas)
- 0% test coverage
- Error handling básico
- Sin validación de formularios
- README genérico
- Hardcoded URLs sin validación

🎯 **Prioridades**:
1. Refactorizar services.tsx (28k líneas → módulos pequeños)
2. Mover auth a httpOnly cookies
3. Implementar validación de forms con Zod
4. Agregar error boundaries y handling
5. Tests para componentes críticos
6. Documentar en README

**Complejidad**: Media-Alta
**Estado**: Funcional en producción pero requiere refactoring
**Tiempo estimado mejoras**: 3-4 semanas (2 developers)
