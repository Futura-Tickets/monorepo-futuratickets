# FUTURA-MARKET-PLACE-V2-MAIN - ANÁLISIS TÉCNICO EXHAUSTIVO

## 1. RESUMEN EJECUTIVO

### Propósito del Repositorio
Frontend web del marketplace de tickets de Futura Tickets construido con Next.js 15, React 19 y TypeScript. Aplicación web responsive para compra/venta de tickets con integración de Stripe, Google OAuth, y sistema de reventa.

### Stack Tecnológico Principal
- **Framework**: Next.js 15.2.2 (App Router con RSC)
- **UI Framework**: React 19
- **Lenguaje**: TypeScript 5
- **UI Library**: Radix UI + Tailwind CSS 3.4.17
- **Payment**: Stripe (@stripe/react-stripe-js 1.10.0)
- **Autenticación**: NextAuth 4.24.11 + Google OAuth
- **Mapas**: React Leaflet 5.0.0
- **Deployment**: Docker + Google Cloud Run (puerto 3000)

### Métricas del Proyecto
```
Total archivos fuente: ~51 archivos .tsx/.ts en /app
Total líneas componentes: 3,818 líneas
Páginas principales: 8 rutas públicas + 15+ API routes
Contextos React: 3 (Auth, Cart, Global)
Componentes UI: 54 componentes en /components
```

---

## 2. ARQUITECTURA DEL SISTEMA

### Diagrama de Alto Nivel
```
┌─────────────────────────────────────────────────────────────────┐
│                    FUTURA MARKETPLACE V2                        │
│                     (Next.js 15 App)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Browser    │  │  Google Tag  │  │   Leaflet    │        │
│  │   Context    │  │   Manager    │  │    Maps      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              React Context Layer                         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │  │
│  │  │ AuthContext │ │ CartContext │ │GlobalContext│       │  │
│  │  │ (JWT Token) │ │ (localStorage)│ │(Countries) │       │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 Pages Layer (App Router)                 │  │
│  │  / │ /checkout │ /cart │ /account │ /resume             │  │
│  │  /login │ /recover-account │ /footer/*                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           API Routes Layer (/app/api/*)                  │  │
│  │  auth/* │ events/* │ orders/* │ resales/*               │  │
│  │  transfer │ user/* │ stripe │ commission                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Stripe Payment Element                         │  │
│  │  (Elements Provider + PaymentElement)                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │     External APIs (3 diferentes)      │
        ├───────────────────────────────────────┤
        │ NEXT_PUBLIC_FUTURA_API (main backend) │
        │ NEXT_PUBLIC_FUTURA (events/orders)    │
        │ NEXT_PUBLIC_REFACTOR_RESALE_API       │
        │ NEXT_PUBLIC_BLOB_URL (Azure images)   │
        └───────────────────────────────────────┘
```

### Patrones Arquitectónicos
1. **Next.js App Router**: Routing basado en carpetas con RSC
2. **Server Components + Client Components**: Separación 'use client'
3. **API Routes como BFF**: Backend-for-Frontend proxy pattern
4. **Context API**: Estado global compartido (Auth, Cart, Global)
5. **Compound Components**: UI components con subcomponents
6. **Controlled Components**: Forms con react-hook-form + zod

---

## 3. ESTRUCTURA DE DIRECTORIOS DETALLADA

```
futura-market-place-v2-main/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout con providers
│   ├── page.tsx                 # Home page (487 líneas)
│   ├── loading.tsx              # Loading UI
│   ├── globals.css              # Tailwind imports
│   │
│   ├── api/                     # API Routes (Backend proxy)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── login-credentials/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── register-credentials/route.ts
│   │   │   ├── send-email-to-recover/route.ts
│   │   │   └── recover-password/route.ts
│   │   ├── events/
│   │   │   ├── route.ts
│   │   │   ├── create-order/route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/resales/route.ts
│   │   ├── orders/[paymentId]/route.ts
│   │   ├── resales/
│   │   │   ├── create/route.ts
│   │   │   ├── cancel-resale/route.ts
│   │   │   ├── purchase/route.ts
│   │   │   └── [eventId]/route.ts
│   │   ├── sales/profile/[userId]/route.ts
│   │   ├── transfer/route.ts
│   │   ├── user/
│   │   │   ├── profile/route.ts
│   │   │   ├── update-account/route.ts
│   │   │   ├── update-password/route.ts
│   │   │   └── tickets/[userId]/route.ts
│   │   ├── stripe/route.ts
│   │   ├── commission/route.ts
│   │   ├── coupon/[code]/route.ts
│   │   └── promoCode/[code]/route.ts
│   │
│   ├── account/page.tsx         # User account management
│   ├── cart/page.tsx            # Shopping cart
│   ├── checkout/page.tsx        # Checkout flow
│   ├── resume/page.tsx          # Order confirmation
│   ├── recover-account/page.tsx # Password recovery
│   │
│   ├── footer/                  # Static pages
│   │   ├── tickets/
│   │   │   ├── my-tickets/page.tsx
│   │   │   ├── transfer-tickets/page.tsx
│   │   │   └── ticket-issue/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── refund/page.tsx
│   │   ├── cookies/page.tsx
│   │   └── help/page.tsx
│   │
│   └── shared/                  # Shared utilities
│       ├── interface.ts         # TypeScript interfaces (470 líneas)
│       ├── constants.ts         # Global constants
│       ├── utils.ts             # Utility functions
│       └── services/
│           └── services.tsx     # API service layer (488 líneas)
│
├── components/                  # React components (3,818 líneas total)
│   ├── ui/                     # Radix UI components (54 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (50+ more)
│   │
│   ├── header.tsx              # Main navigation header
│   ├── footer.tsx              # Footer navigation
│   ├── cart-icon.tsx           # Shopping cart icon with badge
│   │
│   ├── checkout/               # Checkout components
│   │   ├── contact.tsx         # Contact form
│   │   ├── payment.tsx         # Stripe payment (197 líneas)
│   │   ├── summary.tsx         # Order summary (114 líneas)
│   │   └── coupon.tsx          # Coupon input
│   │
│   ├── event/                  # Event components
│   │   ├── event-card.tsx
│   │   ├── event-modal.tsx
│   │   ├── event-map.tsx
│   │   ├── ticket-selector.tsx # Ticket selection (13,015 líneas)
│   │   └── filters.tsx         # Event filters
│   │
│   ├── order-details/          # Order display components
│   │   ├── order-details-display.tsx
│   │   ├── order-reference-and-date.tsx
│   │   └── ...
│   │
│   ├── user-info.tsx           # User profile component (13,212 líneas)
│   ├── user-tickets.tsx        # User tickets display (14,090 líneas)
│   ├── ResellTicketModal.tsx  # Resale modal
│   ├── TransferTicketModal.tsx # Transfer modal
│   └── ticketDetailModal.tsx   # Ticket details
│
├── contexts/                    # React Context Providers
│   ├── auth-context.tsx        # Authentication state (86 líneas)
│   ├── cart-context.tsx        # Shopping cart state (167 líneas)
│   └── global-context.tsx      # Global app state (53 líneas)
│
├── hooks/                       # Custom React hooks
│   └── use-toast.ts
│
├── lib/                         # Utilities and data
│   ├── countries-data.ts       # Country list data
│   ├── events-data.ts          # Event type definitions
│   └── utils.ts                # Utility functions
│
├── public/                      # Static assets
│   └── images/
│       └── logo.png
│
├── styles/
│   └── globals.css             # Global styles
│
├── .dockerignore
├── Dockerfile                   # Multi-stage Docker build
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── components.json             # shadcn/ui config
└── package.json                # Dependencies
```

---

## 4. COMPONENTES Y MÓDULOS PRINCIPALES

### 4.1 Contexts (Estado Global)

#### AuthContext (`contexts/auth-context.tsx` - 86 líneas)
```typescript
interface AuthContextType {
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  userData: UserData | undefined;
  setUserData: Dispatch<SetStateAction<UserData | undefined>>;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

// Funcionalidad:
// - Almacena token JWT en localStorage como 'auth_token'
// - Verifica autenticación al montar la app
// - Llama a getUserProfile() si existe token
// - Maneja errores eliminando token inválido
```

#### CartContext (`contexts/cart-context.tsx` - 167 líneas)
```typescript
interface CartItem {
  promoterId: string;
  commission: number;
  id: string;
  resale?: string;           // ID de venta en reventa
  paymentId?: string;
  resaleId?: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  eventDate: string;
  eventVenue: string;
  promoter: string;
  ticketType: string;
  price: number;
  quantity: number;
}

// Funcionalidades:
// - Persiste en localStorage como 'futura-cart'
// - addToCart: agrega o incrementa cantidad
// - removeFromCart: elimina item
// - updateQuantity: actualiza cantidad
// - clearCart: vacía el carrito
// - Calcula totalItems y totalPrice automáticamente
```

#### GlobalContext (`contexts/global-context.tsx` - 53 líneas)
⚠️ **BUG DETECTADO**: Implementación incorrecta del Provider
```typescript
// PROBLEMA:
return (
  <GlobalContext.Provider value={{
    ...globalContextState,
    ...availableCountries,  // ❌ Spread de array como objeto
    setAvailableCountries,
    ...citiesByCountry,     // ❌ Spread de array como objeto
    setCitiesByCountry
  }}>
)

// SOLUCIÓN:
return (
  <GlobalContext.Provider value={{
    ...globalContextState,
    availableCountries,     // ✅ Pasar como propiedad
    setAvailableCountries,
    citiesByCountry,        // ✅ Pasar como propiedad
    setCitiesByCountry
  }}>
)
```

### 4.2 Service Layer (`app/shared/services/services.tsx` - 488 líneas)

```typescript
// API Endpoints utilizados:
const APIs = {
  FUTURA: process.env.NEXT_PUBLIC_FUTURA,           // Events, Orders, Sales
  FUTURA_API: process.env.NEXT_PUBLIC_FUTURA_API,   // Auth, Stripe config
  REFACTOR_RESALE: process.env.NEXT_PUBLIC_REFACTOR_RESALE_API, // Resale, Transfer
  BLOB: process.env.NEXT_PUBLIC_BLOB_URL            // Azure Blob Storage
};

// Funciones principales:
export async function getEvents(): Promise<EventAPI[]>
export async function getEventById(id: string): Promise<EventAPI>
export async function getEventByUrl(url: string): Promise<EventAPI>
export async function getEventCommission(eventId: string): Promise<Commission>
export async function loginWithGoogle(accessToken: string): Promise<AuthResponse>
export async function registerWithCredentials(...)
export async function loginWithCredentials(...)
export async function createOrderReq(createOrder: CreateOrder)
export async function getStripeConfig(): Promise<{ config: string }>
export async function getOrderById(paymentId: string): Promise<Order[]>
export async function getUserProfile(): Promise<UserData>
export async function updateUserProfile(newInfo: NewUserInfo): Promise<UserData>
export async function updateUserPassword(...)
export async function getUserTickets(userId: string): Promise<Order[]>
export async function getResaleTickets(eventId: string): Promise<ResaleTicket[]>
export async function resaleSale(sale: string, resalePrice: number)
export async function cancelResaleSale(sale: string)
export async function transferSale(sale: string, transferToTicket: TransferToTicket)
export async function getCouponInfo(code: string)
export async function getPromoCodeInfo(code: string)
export async function recoveryEmail(email: string)
export async function recoveryPassword(token: string, newPassword: string)
```

**Patrón de autenticación**:
```typescript
// Token almacenado en localStorage
headers: {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
}
```

### 4.3 Interfaces TypeScript (`app/shared/interface.ts` - 470 líneas)

```typescript
// Interfaces principales:
export interface EventAPI {
  _id: string;
  promoter: { _id: string; name: string };
  name: string;
  description: string;
  image: string;
  capacity: number;
  commission: number;
  resale: Resale;
  artists: Artist[];
  location: Location;
  dateTime: DateTime;
  conditions: Condition[];
  faqs: Faq[];
  isBlockchain: boolean;
  tickets: Ticket[];
  ticketLots: TicketLot[];
  maxQuantity: number;
  availableTickets: number;
}

export interface CreateOrder {
  contactDetails?: ContactDetails;
  orders: {
    event: string;
    promoter: string;
    paymentId?: string;
    promoCode?: string;
    couponCode?: string;
    items: Item[];
    resaleItems: Item[];
  }[];
}

export interface Item {
  sale?: string;    // ID de venta (para resales)
  type: string;
  amount: number;
  price: number;
}

export interface ContactDetails {
  name: string;
  lastName: string;
  birthdate: Date;
  email: string;
  phone?: string;
}

export interface ResaleTicket {
  client: {
    _id: string;
    name: string;
    lastName: string;
    email: string;
  };
  tickets: Array<{
    id: string;
    type: string;
    quantity: number;
  }>;
  _id: string;
  type: string;
  resale: {
    resalePrice: number;
    resaleDate: Date;
  };
  event: EventAPI;
  price: number;
  seller: string;
}

// Enums:
export enum EventStatus {
  HOLD = "HOLD",
  CREATED = "CREATED",
  LAUNCHED = "LAUNCHED",
  LIVE = "LIVE",
  CLOSED = "CLOSED"
}

export enum TicketStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  OPEN = "OPEN",
  SALE = "SALE",
  SOLD = "SOLD",
  CLOSED = "CLOSED",
  TRANSFERED = "TRANSFERED",
  EXPIRED = "EXPIRED"
}

export enum TicketActivity {
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

### 4.4 Componentes Principales

#### Header Component (`components/header.tsx` - 16,211 líneas)
```typescript
export function Header({ isCartVisible = true }: { isCartVisible?: boolean })

// Features:
// - Búsqueda de eventos (Search input)
// - Selector de país (Country dropdown)
// - Icono de carrito con badge de cantidad
// - Login/Register dropdown
// - User menu con opciones:
//   * Perfil
//   * Mis Entradas
//   * Cerrar sesión
// - Responsive mobile menu
// - Google OAuth integration

// Logout implementation:
const logOut = () => {
  localStorage.removeItem('auth_token');
  window.location.href = '/';
};
```

#### Checkout Page (`app/checkout/page.tsx`)
```typescript
// Flujo de checkout en 3 pasos:
// 1. Contact Information (Contact component)
// 2. Payment Method (Stripe Payment Element)
// 3. Order Summary (Summary component)

// Persistencia en sessionStorage:
sessionStorage.setItem('futura-payment-id', paymentId);
sessionStorage.setItem('futura-client-secret', clientSecret);
sessionStorage.setItem('futura-order-items', JSON.stringify(items));
sessionStorage.setItem('futura-contact-data', JSON.stringify(formData));

// PromoCode/Coupon logic:
const promoCodeValue = sessionStorage.getItem('futura-promo-code');
// Aplicado solo al evento correspondiente en el checkout
```

#### Payment Component (`components/checkout/payment.tsx` - 197 líneas)
```typescript
// Stripe Elements integration:
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#00c8b3',      // Futura teal
    colorBackground: 'rgba(255, 255, 255, 0.05)',
    colorText: '#ffffff',
    colorDanger: '#FE3E01',
    borderRadius: '0.5rem'
  }
};

// Payment flow:
const returnUrl = `${window.location.origin}/resume?paymentIntentId=${paymentId}&amount=${totalPrice}`;
await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
```

#### Summary Component (`components/checkout/summary.tsx` - 114 líneas)
```typescript
// Cálculo de precios:
const subtotal = totalPrice;
const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
const subtotalWithDiscount = subtotal - discountAmount;

// Service Fee calculation:
const serviceFee = ((subtotalWithDiscount + commission) * 1.25 / 100 + 0.25 + commission);

// Total final:
const finalTotal = subtotalWithDiscount + serviceFee;

// ⚠️ NOTA: Fórmula compleja de service fee que incluye comisión del evento
```

---

## 5. FLUJOS DE DATOS Y CASOS DE USO

### 5.1 Flujo de Compra de Tickets (Happy Path)

```
1. Home Page (/)
   └─> Usuario busca eventos por país/ciudad/fecha
   └─> Aplica filtros (venue, artist, genre, price)

2. Event Modal/Detail
   └─> Usuario selecciona tipo de ticket y cantidad
   └─> Click "Add to Cart"
   └─> CartContext.addToCart()
   └─> localStorage.setItem('futura-cart')

3. Cart Page (/cart)
   └─> Usuario revisa items
   └─> Puede aplicar PromoCode (sessionStorage)
   └─> Click "Proceed to Checkout"

4. Checkout Page (/checkout)
   └─> Step 1: Contact Information
       └─> Formulario con validación Zod
       └─> handleContactSubmit()
       └─> createOrderReq() → POST /api/events/create-order
       └─> Backend devuelve { paymentId, clientSecret }
       └─> Se guarda en sessionStorage

   └─> Step 2: Payment Method (Stripe)
       └─> Stripe Elements carga con clientSecret
       └─> Usuario ingresa tarjeta
       └─> stripe.confirmPayment()
       └─> Redirección a returnUrl

5. Resume Page (/resume)
   └─> Recibe paymentIntentId y amount en query params
   └─> getOrderById(paymentIntentId)
   └─> Muestra detalles de orden
   └─> clearCart()
```

### 5.2 Flujo de Reventa (Resale)

```
1. My Account (/account?tab=tickets)
   └─> Usuario ve sus tickets comprados
   └─> Selecciona ticket para revender
   └─> Click "Resell Ticket"

2. ResellTicketModal
   └─> Input: Precio de reventa
   └─> Validación: precio <= event.resale.maxPrice
   └─> resaleSale(saleId, resalePrice)
   └─> POST /api/resales/create
       └─> PATCH ${REFACTOR_RESALE_API}/user/events/resale

3. Ticket aparece en marketplace
   └─> getResaleTickets(eventId)
   └─> GET /api/resales/${eventId}
   └─> Badge "Reventa" en EventCard

4. Compra de ticket en reventa
   └─> addToCart(event, ticketType, quantity, resaleId)
   └─> CartItem.resale = resaleId
   └─> En checkout: orders.resaleItems[] en lugar de items[]
```

### 5.3 Flujo de Transferencia

```
1. My Account → My Tickets
   └─> Selecciona ticket
   └─> Click "Transfer"

2. TransferTicketModal
   └─> Formulario: name, lastName, email, birthdate, phone
   └─> transferSale(saleId, transferToTicket)
   └─> POST /api/transfer
       └─> PATCH ${REFACTOR_RESALE_API}/user/events/transfer

3. Backend procesa transferencia
   └─> Crea nuevo ownership
   └─> Envía email al receptor
   └─> Actualiza estado del ticket
```

### 5.4 Flujo de Autenticación

```
Google OAuth:
1. Click "Login with Google"
2. Google popup → accessToken
3. loginWithGoogle(accessToken)
4. POST /api/auth/login
   └─> POST ${FUTURA_API}/accounts/login-google
5. Recibe { token, user }
6. localStorage.setItem('auth_token', token)
7. AuthContext actualiza userData y isLoggedIn

Credentials:
1. Email + Password form
2. loginWithCredentials(email, password)
3. POST /api/auth/login-credentials
4. localStorage.setItem('auth_token', token)
```

---

## 6. API ROUTES Y ENDPOINTS

### Estructura de API Routes (BFF Pattern)

Todas las API routes actúan como proxy/BFF hacia los backends externos:

```typescript
// Patrón común:
export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA_API}/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: request.headers.get('authorization')!
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data);
}
```

### Mapeo de API Routes:

| Frontend Route | Backend API | Propósito |
|---------------|-------------|-----------|
| `/api/auth/login` | `${FUTURA_API}/accounts/login-google` | Login Google OAuth |
| `/api/auth/login-credentials` | `${FUTURA_API}/accounts/login` | Login email/password |
| `/api/auth/register` | `${FUTURA_API}/accounts/register-google` | Registro Google |
| `/api/auth/register-credentials` | `${FUTURA_API}/accounts` | Registro email/password |
| `/api/events` | `${FUTURA}/api/events` | Listar eventos |
| `/api/events/[id]` | `${FUTURA}/api/events/:id` | Detalle evento |
| `/api/events/create-order` | `${FUTURA_API}/events/create-order` | Crear orden Stripe |
| `/api/orders/[paymentId]` | `${FUTURA}/api/orders/:paymentId` | Obtener orden |
| `/api/user/profile` | `${FUTURA}/api/user/profile` | Perfil usuario |
| `/api/user/update-account` | `${FUTURA}/api/user/update-account` | Actualizar perfil |
| `/api/resales/create` | `${REFACTOR_RESALE}/user/events/resale` | Crear reventa |
| `/api/resales/[eventId]` | `${FUTURA}/api/resales/:eventId` | Listar reventas evento |
| `/api/transfer` | `${REFACTOR_RESALE}/user/events/transfer` | Transferir ticket |
| `/api/stripe` | `${FUTURA_API}/stripe/config` | Config Stripe |
| `/api/commission` | `${FUTURA_API}/events/:id` | Comisión evento |
| `/api/coupon/[code]` | Backend coupon validation | Validar cupón |
| `/api/promoCode/[code]` | Backend promo validation | Validar promo |

⚠️ **PROBLEMA**: Uso de 3 APIs diferentes sin documentación clara:
- `NEXT_PUBLIC_FUTURA`
- `NEXT_PUBLIC_FUTURA_API`
- `NEXT_PUBLIC_REFACTOR_RESALE_API`

---

## 7. CONFIGURACIÓN Y DEPLOYMENT

### Variables de Entorno Requeridas

```bash
# APIs Backend
NEXT_PUBLIC_FUTURA=https://api.futuratickets.com
NEXT_PUBLIC_FUTURA_API=https://api-main.futuratickets.com
NEXT_PUBLIC_REFACTOR_RESALE_API=https://resale-api.futuratickets.com

# Azure Blob Storage
NEXT_PUBLIC_BLOB_URL=https://futurastorage.blob.core.windows.net/images

# Google OAuth
GOOGLE_CLIENT_ID=15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com
```

⚠️ **SEGURIDAD**: Google Client ID expuesto en código (`layout.tsx:30`)

### Next.js Configuration (`next.config.mjs`)

```javascript
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },        // ⚠️ No valida ESLint
  typescript: { ignoreBuildErrors: true },      // ⚠️ No valida TypeScript
  images: { unoptimized: true },               // ⚠️ Desactiva optimización
  output: 'standalone',                        // ✅ Para Docker
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true
  }
};
```

### Dockerfile (Multi-stage Build)

```dockerfile
FROM node:18-alpine AS base

# Deps stage
FROM base AS deps
RUN npm ci --only=production --legacy-peer-deps

# Builder stage
FROM base AS builder
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Runner stage (producción)
FROM base AS runner
ENV NODE_ENV production
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Despliegue en Google Cloud Run

```bash
# Build
docker build -t gcr.io/PROJECT_ID/futura-marketplace:latest .

# Push
docker push gcr.io/PROJECT_ID/futura-marketplace:latest

# Deploy
gcloud run deploy futura-marketplace \
  --image gcr.io/PROJECT_ID/futura-marketplace:latest \
  --platform managed \
  --region europe-west1 \
  --port 3000 \
  --allow-unauthenticated
```

---

## 8. DEPENDENCIAS CLAVE Y VERSIONES

### package.json Dependencies

```json
{
  "dependencies": {
    "next": "^15.2.2",
    "react": "^19",
    "react-dom": "^19",
    "typescript": "^5",

    "@stripe/react-stripe-js": "^1.10.0",
    "@stripe/stripe-js": "^1.35.0",

    "next-auth": "^4.24.11",
    "@react-oauth/google": "^0.12.1",

    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",

    "react-hook-form": "^7.54.1",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",

    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0",

    "date-fns": "4.1.0",
    "react-datepicker": "^8.3.0",
    "react-qrcode-logo": "^3.0.0",
    "recharts": "2.15.0",

    "tailwindcss": "^3.4.17",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",

    "@next/third-parties": "^15.3.2",
    "lucide-react": "^0.454.0",
    "sonner": "^1.7.4"
  }
}
```

### Peer Dependencies Warnings
⚠️ Uso de `--legacy-peer-deps` indica posibles conflictos de dependencias.

---

## 9. TESTING Y CALIDAD

### Estado Actual: 0% Coverage

❌ **NO HAY TESTS**: No existen archivos de test en el repositorio.

### Testing Recomendado

```typescript
// tests/unit/contexts/cart-context.test.tsx
describe('CartContext', () => {
  it('should add item to cart', () => {});
  it('should persist to localStorage', () => {});
  it('should calculate total price correctly', () => {});
});

// tests/integration/checkout-flow.test.tsx
describe('Checkout Flow', () => {
  it('should create order with contact details', () => {});
  it('should integrate with Stripe', () => {});
  it('should apply coupon discount', () => {});
});

// tests/e2e/purchase.spec.ts (Playwright)
test('complete purchase flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Buy Tickets');
  // ...
});
```

---

## 10. PROBLEMAS DETECTADOS Y ÁREAS DE MEJORA

### 10.1 BUGS CRÍTICOS

#### 1. GlobalContext Mal Implementado
**Archivo**: `contexts/global-context.tsx:36-39`
```typescript
// ❌ ACTUAL:
<GlobalContext.Provider value={{
  ...globalContextState,
  ...availableCountries,  // Spread de array
  setAvailableCountries,
  ...citiesByCountry,     // Spread de array
  setCitiesByCountry
}}>

// ✅ CORRECCIÓN:
<GlobalContext.Provider value={{
  ...globalContextState,
  availableCountries,
  setAvailableCountries,
  citiesByCountry,
  setCitiesByCountry
}}>
```
**Impacto**: El contexto no funciona correctamente, países y ciudades no se propagan.

#### 2. API Response No Utilizada
**Archivo**: `app/api/resales/create/route.ts:20`
```typescript
const res = await fetch(...);
//const data = await res.json();  // ❌ Comentado
return NextResponse.json({});     // ❌ Retorna objeto vacío
```
**Impacto**: Cliente no recibe respuesta del backend, no puede manejar errores.

### 10.2 SEGURIDAD

#### 1. Google Client ID Hardcoded
**Archivo**: `app/layout.tsx:30`
```typescript
<GoogleOAuthProvider clientId="15290406881-f57qpfo1qu9sc9or1osn5dtq74ir25gs.apps.googleusercontent.com">
```
**Solución**: Mover a variable de entorno.

#### 2. Token en localStorage
```typescript
localStorage.setItem('auth_token', token);
```
**Riesgo**: Vulnerable a XSS. Considerar httpOnly cookies.

#### 3. No hay validación de entrada
API routes no validan request bodies antes de proxy al backend.

### 10.3 CÓDIGO Y ARQUITECTURA

#### 1. Build Warnings Ignorados
```javascript
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true }
```
**Impacto**: Errores de TypeScript/ESLint pasan a producción.

#### 2. Múltiples APIs sin documentación
Uso de 3 URLs de API diferentes sin documentación de cuándo usar cada una:
- `NEXT_PUBLIC_FUTURA`
- `NEXT_PUBLIC_FUTURA_API`
- `NEXT_PUBLIC_REFACTOR_RESALE_API`

#### 3. Lógica de negocio en cliente
Cálculo de service fee y comisiones en `summary.tsx`:
```typescript
const serviceFee = ((subtotalWithDiscount + commission) * 1.25 / 100 + 0.25 + commission);
```
**Problema**: Fórmula compleja replicada, debería venir del backend.

#### 4. Componentes muy grandes
- `components/user-info.tsx`: 13,212 líneas
- `components/user-tickets.tsx`: 14,090 líneas
- `components/header.tsx`: 16,211 líneas

**Solución**: Refactorizar en componentes más pequeños.

#### 5. Manejo de errores inconsistente
```typescript
.catch((err) => console.log(err))  // ❌ Solo log
.catch(async (err) => await err.json())  // ❌ await innecesario
```

#### 6. SessionStorage para checkout
```typescript
sessionStorage.setItem('futura-payment-id', paymentId);
```
**Problema**: Se pierde al abrir en nueva pestaña. Considerar server-side session.

### 10.4 PERFORMANCE

#### 1. Imágenes no optimizadas
```javascript
images: { unoptimized: true }
```

#### 2. Falta Code Splitting
Componentes grandes no lazy loaded.

#### 3. No hay Suspense boundaries
Faltan loading states para RSC.

---

## 11. INTEGRACIONES EXTERNAS

### 11.1 Stripe Payment Integration

```typescript
// Flujo completo:
1. Cliente: getStripeConfig()
   └─> GET /api/stripe
       └─> GET ${FUTURA_API}/stripe/config
       └─> Devuelve publishable key

2. Cliente: createOrderReq(orderData)
   └─> POST /api/events/create-order
       └─> POST ${FUTURA_API}/events/create-order
       └─> Backend crea PaymentIntent
       └─> Devuelve { paymentId, clientSecret }

3. Cliente: loadStripe(publishableKey)
   └─> Inicializa Stripe.js

4. Cliente: <Elements stripe={stripe} options={{ clientSecret }}>
   └─> Renderiza PaymentElement

5. Usuario: Ingresa datos de tarjeta

6. Cliente: stripe.confirmPayment({ elements, confirmParams })
   └─> Stripe procesa pago
   └─> Redirect a returnUrl

7. Backend: Stripe webhook (no implementado en este repo)
   └─> Actualiza estado de orden
   └─> Crea tickets
```

**Stripe Elements Appearance** (`components/checkout/payment.tsx:20-97`):
- Theme: 'night' (dark mode)
- Custom colors: Futura branding
- Accordion layout para métodos de pago

### 11.2 Google OAuth

```typescript
// Layout setup:
<GoogleOAuthProvider clientId="...">
  <GlobalProvider>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </GlobalProvider>
</GoogleOAuthProvider>

// Login flow:
import { useGoogleLogin } from '@react-oauth/google';

const login = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    const result = await loginWithGoogle(tokenResponse.access_token);
    localStorage.setItem('auth_token', result.token);
  }
});
```

### 11.3 Google Tag Manager

```typescript
// layout.tsx:25
<GoogleTagManager gtmId="GTM-M3V4JFSK" />
```

### 11.4 Leaflet Maps

```typescript
// event-map.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[lat, lon]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[lat, lon]}>
    <Popup>{event.venue}</Popup>
  </Marker>
</MapContainer>
```

### 11.5 Azure Blob Storage

```typescript
// Para imágenes de eventos:
const imageUrl = `${process.env.NEXT_PUBLIC_BLOB_URL}/${event.image}`;

// Ejemplo:
// https://futurastorage.blob.core.windows.net/images/event-123.jpg
```

---

## 12. DECISIONES TÉCNICAS Y PATRONES

### 12.1 Next.js App Router vs Pages Router

**Decisión**: App Router con Server Components

**Razones**:
- Streaming SSR
- Mejor SEO
- Layouts anidados
- Parallel routes

**Implementación**:
```typescript
// layout.tsx: Root layout con providers
// page.tsx: Server Component por defecto
'use client'; // Solo cuando necesita interactividad
```

### 12.2 Estado Global: Context API vs Zustand/Redux

**Decisión**: React Context API

**Pros**:
- Sencillo para 3 contextos
- Sin dependencias extra
- Integrado en React

**Contras**:
- Re-renders innecesarios
- No DevTools

### 12.3 Forms: react-hook-form + Zod

**Decisión**: Validación con Zod schemas

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
});

const form = useForm({
  resolver: zodResolver(schema)
});
```

### 12.4 Styling: Tailwind + Radix UI

**Decisión**: Utility-first CSS + Headless components

```typescript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'futura-teal': '#00c8b3',
      'futura-orange': '#FE3E01',
      'futura-dark': '#0a0a0a'
    }
  }
}
```

### 12.5 API Routes como BFF

**Decisión**: Proxy pattern en lugar de llamadas directas

**Ventajas**:
- Oculta URLs internas
- Agrega headers de autenticación
- Transforma datos
- CORS management

**Desventajas**:
- Latencia adicional
- Duplicación de código

---

## 13. MODELO DE DATOS Y RELACIONES

### Entidades Principales

```typescript
┌─────────────┐
│   Account   │
├─────────────┤
│ _id         │
│ email       │
│ name        │
│ lastName    │
│ password    │
│ birthdate   │
│ phone       │
│ avatar      │
│ createdAt   │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐       N:1        ┌─────────────┐
│   Order     │◄─────────────────│   Event     │
├─────────────┤                  ├─────────────┤
│ _id         │                  │ _id         │
│ paymentId   │                  │ name        │
│ clientSecret│                  │ promoter    │
│ status      │                  │ location    │
│ total       │                  │ dateTime    │
│ contact     │                  │ tickets[]   │
│ items[]     │                  │ capacity    │
│ resaleItems[]                  │ commission  │
│ createdAt   │                  │ resale      │
└─────────────┘                  │ maxQuantity │
       │                         │ url         │
       │ 1:N                     └─────────────┘
       ▼                                │
┌─────────────┐                        │
│    Sale     │                        │
├─────────────┤                        │
│ _id         │                        │
│ order       │────────────────────────┘
│ event       │       N:1
│ client      │
│ type        │       (ticket type)
│ price       │
│ qrCode      │
│ status      │       (TicketStatus enum)
│ activity    │       (TicketActivity enum)
│ resale      │
│   .isResale │
│   .resalePrice
│   .resaleDate
│ transfer    │
└─────────────┘

┌─────────────┐
│  PromoCode  │
├─────────────┤
│ _id         │
│ code        │
│ eventId     │
│ isActive    │
└─────────────┘

┌─────────────┐
│   Coupon    │
├─────────────┤
│ _id         │
│ code        │
│ discount    │       (percentage)
│ eventId     │
│ isActive    │
└─────────────┘
```

### Relación Order - Event - Sale

```typescript
// CreateOrder payload:
{
  contactDetails: { name, lastName, email, birthdate, phone },
  orders: [
    {
      event: "eventId",
      promoter: "promoterId",
      promoCode: "PROMO2024",
      couponCode: "DISCOUNT10",
      items: [
        { type: "VIP", amount: 2, price: 50.00 }
      ],
      resaleItems: [
        { sale: "saleId", type: "General", amount: 1, price: 30.00 }
      ]
    }
  ]
}

// Backend crea:
1. Order con paymentId (Stripe PaymentIntent)
2. N Sales (uno por cada ticket)
3. Cada Sale tiene:
   - QR code único
   - Estado inicial: PENDING
   - Referencia a Order y Event
```

---

## 14. MONITOREO Y OBSERVABILIDAD

### Actual

✅ **Google Tag Manager**: Tracking de eventos
```typescript
<GoogleTagManager gtmId="GTM-M3V4JFSK" />
```

❌ **NO HAY**:
- Error tracking (Sentry)
- APM (Application Performance Monitoring)
- Logging estructurado
- Analytics backend

### Recomendado

```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

// Logging
import pino from 'pino';
const logger = pino();

// Analytics
import posthog from 'posthog-js';
posthog.init(API_KEY, { api_host: 'https://app.posthog.com' });
```

---

## 15. DOCUMENTACIÓN TÉCNICA ADICIONAL

### 15.1 Constantes Globales

```typescript
// app/shared/constants.ts
export const GLOBAL_MAX_TICKETS = 3;

// ⚠️ NOTA: Solo hay UNA constante definida
// Faltan constantes para:
// - URLs de API
// - Timeouts
// - Límites de validación
// - Feature flags
```

### 15.2 Utility Functions

```typescript
// app/shared/utils.ts
// Funciones de formateo de fecha, moneda, etc.

// lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 15.3 Radix UI Components

54 componentes UI en `components/ui/`:
- accordion.tsx
- alert-dialog.tsx
- aspect-ratio.tsx
- avatar.tsx
- badge.tsx
- button.tsx
- calendar.tsx
- card.tsx
- carousel.tsx
- checkbox.tsx
- collapsible.tsx
- command.tsx
- context-menu.tsx
- dialog.tsx
- drawer.tsx
- dropdown-menu.tsx
- hover-card.tsx
- input.tsx
- input-otp.tsx
- label.tsx
- menubar.tsx
- navigation-menu.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- resizable.tsx
- scroll-area.tsx
- select.tsx
- separator.tsx
- sheet.tsx
- skeleton.tsx
- slider.tsx
- sonner.tsx
- switch.tsx
- table.tsx
- tabs.tsx
- textarea.tsx
- toast.tsx
- toaster.tsx
- toggle.tsx
- toggle-group.tsx
- tooltip.tsx
- use-toast.ts

Todos generados con shadcn/ui CLI.

---

## 16. ROADMAP Y PRÓXIMOS PASOS

### Bugs Críticos a Resolver (P0)

1. **Corregir GlobalContext**: Spread de arrays
2. **Retornar response en resales/create**: No retornar objeto vacío
3. **Mover Google Client ID a .env**: Seguridad

### Mejoras de Seguridad (P1)

1. **Implementar httpOnly cookies**: En lugar de localStorage
2. **Validar inputs en API routes**: Zod schemas
3. **Rate limiting**: En API routes
4. **CSRF protection**: Para forms
5. **Content Security Policy**: Headers de seguridad

### Refactoring Técnico (P2)

1. **Habilitar TypeScript checks**: Remover ignoreBuildErrors
2. **Habilitar ESLint checks**: Remover ignoreDuringBuilds
3. **Refactorizar componentes grandes**: user-info, user-tickets, header
4. **Extraer lógica de negocio**: Service fee calculation al backend
5. **Documentar APIs**: Swagger/OpenAPI para backends
6. **Unificar APIs**: Consolidar 3 APIs en una

### Testing (P2)

1. **Unit tests**: Contexts, utils, services
2. **Integration tests**: API routes, checkout flow
3. **E2E tests**: Playwright para flujos críticos
4. **Visual regression**: Chromatic o Percy

### Performance (P3)

1. **Habilitar next/image optimization**
2. **Lazy load componentes grandes**
3. **Implementar Suspense boundaries**
4. **Code splitting**: Dynamic imports
5. **Service Worker**: PWA capabilities

### Observabilidad (P3)

1. **Sentry**: Error tracking
2. **Vercel Analytics o similar**: Web vitals
3. **Structured logging**: pino o winston
4. **APM**: New Relic o Datadog

### Features (P4)

1. **Favoritos**: Guardar eventos favoritos
2. **Notificaciones push**: Web Push API
3. **Wallet integration**: Apple Wallet, Google Pay
4. **Social sharing**: OpenGraph metatags
5. **Multi-idioma**: i18n

---

## CONCLUSIÓN

**futura-market-place-v2-main** es una aplicación Next.js 15 moderna y compleja que implementa un marketplace completo de tickets con:

✅ **Fortalezas**:
- Stack moderno (React 19, Next.js 15, TypeScript)
- UI consistente con Radix + Tailwind
- Integración completa con Stripe
- Google OAuth funcional
- Docker deployment ready
- Responsive design

⚠️ **Áreas de Mejora Críticas**:
- Bug en GlobalContext que afecta funcionalidad
- 0% test coverage
- Builds ignorando errores TypeScript/ESLint
- Componentes extremadamente grandes (+13k líneas)
- Múltiples APIs sin documentación clara
- Seguridad: tokens en localStorage, Client ID hardcoded
- No hay error tracking ni monitoring

🎯 **Prioridades Inmediatas**:
1. Corregir bug de GlobalContext
2. Implementar tests unitarios para contextos y services
3. Habilitar validación TypeScript/ESLint
4. Refactorizar componentes grandes
5. Documentar uso de las 3 APIs diferentes
6. Mover secrets a variables de entorno
7. Implementar Sentry para error tracking

**Complejidad Técnica**: Alta
**Estado de Producción**: Funcional pero necesita hardening
**Tiempo estimado refactoring**: 3-4 semanas (2 desarrolladores)
