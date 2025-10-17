# FUTURA TICKETS MAIN - DOCUMENTACIÓN TÉCNICA COMPLETA

> **Repositorio:** `futura-tickets-main`
> **Tipo:** Frontend Web Application (React + TypeScript)
> **Propósito:** Aplicación web legacy de marketplace de tickets (versión anterior a v2)
> **Versión:** 0.1.0
> **Estado:** Legacy / Deprecado (sustituido por futura-market-place-v2-main)

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Componentes y Páginas](#4-componentes-y-páginas)
5. [Estado Global y Gestión](#5-estado-global-y-gestión)
6. [Servicios y API Integration](#6-servicios-y-api-integration)
7. [Autenticación y Autorización](#7-autenticación-y-autorización)
8. [Modelos de Datos (Interfaces)](#8-modelos-de-datos-interfaces)
9. [Flujos de Usuario](#9-flujos-de-usuario)
10. [Deployment y Containerización](#10-deployment-y-containerización)
11. [Comparación con v2](#11-comparación-con-v2)
12. [Estado del Proyecto](#12-estado-del-proyecto)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito
**Futura Tickets Main** es la versión **legacy/original** del frontend web del marketplace de tickets de FuturaTickets, construida con **Create React App**, **TypeScript**, **React Router** y **Ant Design**. Esta aplicación ha sido **sustituida** por `futura-market-place-v2-main` (Next.js 15).

### 1.2 Responsabilidades Principales
- ✅ **Explorar eventos** disponibles
- ✅ **Comprar tickets** NFT con Stripe
- ✅ **Carrito de compras** multi-evento
- ✅ **Gestión de cuenta** de usuario
- ✅ **Autenticación** con JWT
- ✅ **Ver tickets** comprados (NFTs)
- ⚠️ **Mercado secundario** (implementación limitada)

### 1.3 Stack Tecnológico Principal

```
┌─────────────────────────────────────────┐
│   Frontend Stack (Legacy)                │
├─────────────────────────────────────────┤
│ • React 18.3.1                          │
│ • TypeScript 4.9.5                      │
│ • React Router DOM 6.26.2              │
│ • Ant Design 5.20.6 (UI Library)       │
│ • @stripe/react-stripe-js 1.10.0       │
│ • SASS 1.79.2 (Styling)                 │
│ • Create React App 5.0.1                │
└─────────────────────────────────────────┘
```

### 1.4 Diferencias Clave vs V2

| Aspecto | futura-tickets-main (v1) | futura-market-place-v2-main |
|---------|--------------------------|----------------------------|
| Framework | Create React App | Next.js 15 (App Router) |
| React Version | 18.3.1 | 19 |
| UI Library | Ant Design | Radix UI + Tailwind |
| Routing | React Router v6 | Next.js App Router |
| State Management | Context API (custom) | Context API (3 providers) |
| Styling | SASS | Tailwind CSS |
| Build Output | SPA | SSR + Static |
| Deployment | Nginx Docker | Google Cloud Run |
| TypeScript | 4.9.5 | 5.x |
| API Layer | Direct fetch calls | API Routes (BFF) |

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Diagrama de Alto Nivel

```
┌────────────────────────────────────────────────────────┐
│          FUTURA TICKETS MAIN (Legacy v1)               │
│              (React SPA Architecture)                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │         React Router (BrowserRouter)         │    │
│  │  / │ /events │ /events/:id │ /cart           │    │
│  │  /cart/checkout │ /account │ /login          │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │       GlobalStateProvider (Context API)      │    │
│  │  - account: Account | undefined              │    │
│  │  - cart: Cart                                │    │
│  │  - dispatch: (newState) => void              │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │            Component Layer                    │    │
│  │  Header │ Events │ Event │ Cart              │    │
│  │  CheckOut │ Payment │ Account │ Login        │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │         Services Layer (shared/)              │    │
│  │  - getEvents()                                │    │
│  │  - createOrder()                              │    │
│  │  - loginAccount()                             │    │
│  │  - validate(token)                            │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
                       │
                       │ HTTP Fetch
                       ▼
        ┌──────────────────────────────┐
        │   Backend API (REST)         │
        │ REACT_APP_API_URL            │
        ├──────────────────────────────┤
        │ /user/events                 │
        │ /accounts/login              │
        │ /accounts/validate/:token    │
        │ /orders                      │
        │ /nfts/owner/:owner           │
        │ /stripe/config               │
        └──────────────────────────────┘
```

### 2.2 Patrones Arquitectónicos

#### Single Page Application (SPA)
- **Client-Side Routing** con React Router
- **Lazy Loading** NO implementado
- **Code Splitting** NO implementado
- **Hydration** NO aplica (solo CSR)

#### Context API para Estado Global
```typescript
// GlobalStateProvider patrón
const GlobalContext = createContext({});

export const GlobalStateProvider = ({ children }) => {
  const [state, setState] = useState({
    account: undefined,
    cart: {}
  });

  const dispatch = (newState) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  return (
    <GlobalContext.Provider value={[state, dispatch]}>
      {children}
    </GlobalContext.Provider>
  );
};
```

#### Service Layer Pattern
```typescript
// Todas las llamadas API centralizadas en services.tsx
export async function getEvents(): Promise<Event[]> {
  return fetch(`${process.env.REACT_APP_API_URL}/user/events`, {...});
}
```

---

## 3. ESTRUCTURA DEL PROYECTO

```
futura-tickets-main/
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   ├── manifest.json           # PWA manifest
│   └── robots.txt
│
├── nginx/                       # Nginx configuration
│   └── nginx.conf              # Server config for Docker
│
├── src/
│   ├── index.tsx               # Entry point (ReactDOM.render)
│   ├── App.tsx                 # Main App component (22 líneas)
│   ├── FuturaTickets.tsx       # Auth wrapper component (58 líneas)
│   ├── index.scss              # Global styles
│   │
│   ├── GlobalStateProvider/    # Estado global
│   │   └── GlobalStateProvider.tsx (Context API)
│   │
│   ├── shared/                 # Código compartido
│   │   ├── services.tsx        # API service layer (140 líneas)
│   │   ├── interfaces.tsx      # TypeScript interfaces (134 líneas)
│   │   └── Header/
│   │       └── Header.tsx      # Navigation header
│   │
│   ├── Events/                 # Listado de eventos
│   │   ├── Events.tsx
│   │   └── EventItem/
│   │       └── EventItem.tsx   # Card de evento individual
│   │
│   ├── Event/                  # Detalle de evento
│   │   └── Event.tsx
│   │
│   ├── Cart/                   # Carrito de compras
│   │   └── Cart.tsx
│   │
│   ├── CheckOut/               # Proceso de checkout
│   │   └── CheckOut.tsx
│   │
│   ├── Payment/                # Integración Stripe
│   │   └── Payment.tsx
│   │
│   ├── Summary/                # Resumen de orden
│   │   └── Summary.tsx
│   │
│   ├── Account/                # Perfil de usuario
│   │   └── Account.tsx
│   │
│   ├── Profile/                # Edición de perfil
│   │   └── Profile.tsx
│   │
│   ├── Login/                  # Login page
│   │   └── Login.tsx
│   │
│   ├── Register/               # Registro de usuario
│   │   └── Register.tsx
│   │
│   ├── react-app-env.d.ts      # CRA TypeScript definitions
│   ├── setupTests.ts           # Jest setup
│   └── reportWebVitals.ts      # Performance metrics
│
├── Dockerfile                   # Multi-stage build (Nginx)
├── .dockerignore
├── .env                        # Environment variables
├── .gitignore
├── package.json                # Dependencies
├── README.md                   # Basic CRA readme
└── tsconfig.json               # TypeScript config
```

---

## 4. COMPONENTES Y PÁGINAS

### 4.1 App.tsx - Root Component

```typescript
// Router setup con 7 rutas principales
<Routes>
  <Route path='/' element={<Events/>}/>
  <Route path="/account" element={<Account />} />
  <Route path="/cart" element={<Cart />} />
  <Route path="/cart/checkout" element={<CheckOut />} />
  <Route path='/events' element={<Events/>}/>
  <Route path='/events/:eventId' element={<Event/>}/>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Routes>
```

**Características:**
- ✅ Header persistente en todas las rutas
- ❌ No hay layout anidados
- ❌ No hay rutas protegidas con guards
- ❌ No hay 404 page

---

### 4.2 FuturaTickets.tsx - Auth Wrapper

```typescript
// Wrapper que verifica autenticación al montar
function FuturaTickets({ children }: any) {
  const [state, dispatch] = useGlobalState();

  const checkAccount = async (): Promise<void> => {
    const token = localStorage.getItem('token') as string;

    if (token) {
      const decodedToken = await validate(token);

      if (!decodedToken || !decodedToken.account) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      dispatch({
        account: {
          _id: decodedToken.account,
          name: decodedToken.name,
          lastName: decodedToken.lastName,
          email: decodedToken.email,
          role: decodedToken.role,
          address: decodedToken.address
        }
      });
    }
  };

  useEffect(() => {
    checkAccount();
  }, [])

  return(children);
}
```

**Funcionalidad:**
- ✅ Verifica token JWT al montar
- ✅ Decodifica token y actualiza estado global
- ✅ Redirige a login si token inválido
- ⚠️ useEffect sin dependencias (warning de React)
- ❌ No refresca token expirado

---

### 4.3 Páginas Principales

#### Events.tsx - Listado de Eventos
```typescript
// Muestra grid de eventos disponibles
// - Fetch de /user/events
// - Ant Design Grid layout
// - EventItem cards
```

#### Event.tsx - Detalle de Evento
```typescript
// Parámetro de ruta: /events/:eventId
// - Muestra info detallada del evento
// - Selector de tipo de ticket
// - Botón "Add to Cart"
// - Muestra NFTs disponibles para reventa
```

#### Cart.tsx - Carrito
```typescript
// Muestra items del carrito desde GlobalState
// - Lista de tickets seleccionados
// - Cálculo de total
// - Botón "Proceed to Checkout"
```

#### CheckOut.tsx - Checkout Flow
```typescript
// Multi-step checkout:
// 1. Contact Details (nombre, email, teléfono)
// 2. Payment (Stripe integration)
// 3. Summary (resumen de orden)
```

#### Account.tsx - Perfil de Usuario
```typescript
// Muestra datos del usuario autenticado
// - Información personal
// - Lista de NFTs comprados (tickets)
// - Opción de poner en venta (setNftPrice)
```

---

## 5. ESTADO GLOBAL Y GESTIÓN

### 5.1 GlobalStateProvider

```typescript
// Estado global simple con Context API
interface GlobalState {
  account?: Account;
  cart: Cart;
}

// Account interface
interface Account {
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  address?: string;
  balance?: number;
  role?: Roles;
  avatar?: string;
  token?: string;
}

// Cart type
type Cart = {
  [key: string]: {       // key = eventId
    type: string;        // Tipo de ticket
    amount: number;      // Cantidad
  }[]
};
```

**Ejemplo de cart state:**
```typescript
{
  "event_id_123": [
    { type: "VIP", amount: 2 },
    { type: "General", amount: 3 }
  ],
  "event_id_456": [
    { type: "General", amount: 1 }
  ]
}
```

### 5.2 Dispatch Pattern

```typescript
// Actualizar estado global
const [state, dispatch] = useGlobalState();

// Actualizar account
dispatch({
  account: {
    _id: "123",
    name: "Juan",
    lastName: "Pérez",
    email: "juan@example.com",
    address: "0xabc...",
    role: Roles.USER
  }
});

// Actualizar cart
dispatch({
  cart: {
    ...state.cart,
    [eventId]: [
      ...(state.cart[eventId] || []),
      { type: ticketType, amount: quantity }
    ]
  }
});
```

**Problemas de esta implementación:**
- ❌ **No hay persistencia** en localStorage para el cart
- ❌ **No hay separación de concerns** (un dispatch para todo)
- ❌ **No hay actions tipadas** (cualquier objeto es válido)
- ❌ **No hay reducers** (lógica mezclada en componentes)

---

## 6. SERVICIOS Y API INTEGRATION

### 6.1 Services Layer (`shared/services.tsx`)

Todas las funciones hacen fetch directamente al backend:

```typescript
// Variable de entorno
const API_URL = process.env.REACT_APP_API_URL;

// 1. Eventos
export async function getEvents(): Promise<Event[]>
export async function getEvent(event: string): Promise<Event>
export async function getEventByAddress(eventAddress: string): Promise<Event>

// 2. Autenticación
export async function createAccount(createAccount: CreateAccount): Promise<Account>
export async function loginAccount(loginAccount: LoginAccount): Promise<Account>
export async function validate(token: string): Promise<DecodedToken>

// 3. Account Management
export async function setAccount(account: Account): Promise<Account>
export async function getNftsByOwner(owner: string): Promise<EventTicket[]>

// 4. Orders & Payment
export async function createOrder(createOrder: CreateOrder): Promise<any>
export async function getStripeConfig(): Promise<any>

// 5. NFT Marketplace
export async function buyNft(buyNft: BuyNft): Promise<any>
```

### 6.2 API Endpoints Consumidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/user/events` | Listar todos los eventos |
| GET | `/user/events/:id` | Obtener evento por ID |
| GET | `/events/address/:address` | Obtener evento por address de contrato |
| POST | `/accounts/create` | Registrar nuevo usuario |
| POST | `/accounts/login` | Login de usuario |
| GET | `/accounts/validate/:token` | Validar JWT token |
| POST | `/accounts/save` | Actualizar cuenta (requiere auth) |
| GET | `/nfts/owner/:owner` | Obtener NFTs del usuario |
| POST | `/nfts/buy` | Comprar NFT del mercado secundario |
| POST | `/orders` | Crear orden de compra (requiere auth) |
| GET | `/stripe/config` | Obtener Stripe publishable key |

### 6.3 Patrón de Autenticación

```typescript
// Token almacenado en localStorage
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token') as string}`
}
```

**Endpoints que requieren auth:**
- `POST /orders`
- `POST /accounts/save`

---

## 7. AUTENTICACIÓN Y AUTORIZACIÓN

### 7.1 Flujo de Login

```
┌─────────┐      ┌──────────┐      ┌─────────────┐
│  USER   │      │  FRONTEND│      │   BACKEND   │
└────┬────┘      └─────┬────┘      └──────┬──────┘
     │                 │                   │
     │ Ingresa         │                   │
     │ email/password  │                   │
     ├────────────────►│                   │
     │                 │                   │
     │                 │ POST /accounts/   │
     │                 │ login             │
     │                 ├──────────────────►│
     │                 │ { loginAccount }  │
     │                 │                   │
     │                 │◄──────────────────┤
     │                 │ { account, token }│
     │                 │                   │
     │                 │ localStorage.     │
     │                 │ setItem('token')  │
     │                 ├────┐              │
     │                 │◄───┘              │
     │                 │                   │
     │                 │ dispatch({        │
     │                 │   account: {...}  │
     │                 │ })                │
     │                 ├────┐              │
     │                 │◄───┘              │
     │                 │                   │
     │◄────────────────┤ Navigate to /     │
     │  Redirect       │                   │
     │                 │                   │
```

### 7.2 Flujo de Validación de Token

```typescript
// Al montar la app (FuturaTickets.tsx)
const token = localStorage.getItem('token');

if (token) {
  const decodedToken = await validate(token);  // GET /accounts/validate/:token

  if (decodedToken && decodedToken.account) {
    // Token válido, actualizar estado global
    dispatch({ account: {...} });
  } else {
    // Token inválido, limpiar y redirigir
    localStorage.removeItem('token');
    navigate('/login');
  }
}
```

### 7.3 Roles del Sistema

```typescript
export enum Roles {
  ADMIN = 'Admin',
  USER = 'User',
};
```

**Nota**: En v2 hay más roles (ACCESS, PROMOTER) pero en v1 solo hay 2.

---

## 8. MODELOS DE DATOS (INTERFACES)

### 8.1 Event Interface

```typescript
export interface Event {
  _id: string;
  name: string;
  promoter: string;
  conditions: string;
  date: string;
  description: string;
  image: string;
  location: Location;
  symbol: string;             // Token symbol (ej: "TKT")
  capacity: number;
  tickets: Ticket[];          // Tipos de tickets disponibles
  nfts: EventTicket[];        // NFTs del evento en reventa
}

export interface Location {
  address: string;
  city: string;
  country: string;
}

export interface Ticket {
  type: string;               // "VIP", "General", etc
  capacity: number;
  price: number;
}
```

### 8.2 Account & Auth

```typescript
export interface Account {
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  address?: string;           // Blockchain address
  balance?: number;
  role?: Roles;
  avatar?: string;
  password?: string;          // Solo al crear/actualizar
  token?: string;             // JWT token
}

export interface CreateAccount {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginAccount {
  email: string;
  password: string;
}

export interface DecodedToken {
  _id: string;
  account: string;            // Account ID
  name: string;
  lastName: string;
  email: string;
  address: string;
  role: string;
  iat: number;                // Issued at
  exp: number;                // Expiration
}
```

### 8.3 Orders & Cart

```typescript
export interface CreateOrder {
  contactDetails: ContactDetails;
  items: string[];            // Array de ticket IDs
}

export interface ContactDetails {
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export type Cart = {
  [key: string]: {            // key = eventId
    type: string;             // Tipo de ticket
    amount: number;           // Cantidad
  }[]
};
```

### 8.4 NFT / Tickets

```typescript
export interface EventTicket {
  _id?: string;
  collectionAddress: string;  // Smart contract address
  owner: Account;
  tokenId: number;
  buyPrice?: number;
  price?: number;             // Precio de reventa
  status: NftStatus;
}

export enum NftStatus {
  MINTED = "MINTED",
  HOLD = "HOLD",
  SALE = "SALE",
  SOLD = "SOLD",
}

export interface SetNftPrice {
  email: string;
  collectionAddress: string;
  tokenId: number;
  price: number;
}

export interface BuyNft {
  email: string;
  owner: string;
  collectionAddress: string;
  tokenId: number;
}
```

---

## 9. FLUJOS DE USUARIO

### 9.1 Flujo de Compra de Ticket (Happy Path)

```
1. Usuario visita / (Events page)
   └─> Fetch de getEvents()
   └─> Muestra lista de eventos con EventItem cards

2. Click en evento
   └─> Navigate to /events/:eventId
   └─> Fetch de getEvent(eventId)
   └─> Muestra detalle: descripción, artistas, tickets disponibles

3. Selecciona tipo de ticket y cantidad
   └─> Click "Add to Cart"
   └─> dispatch({
        cart: {
          ...state.cart,
          [eventId]: [...tickets]
        }
      })

4. Navigate to /cart
   └─> Muestra items del carrito
   └─> Calcula total
   └─> Click "Proceed to Checkout"

5. Navigate to /cart/checkout
   └─> Step 1: Contact Details form
       └─> Valida y guarda contactDetails

   └─> Step 2: Payment (Stripe)
       └─> getStripeConfig() obtiene publishable key
       └─> Renderiza Stripe Elements
       └─> Usuario ingresa tarjeta

   └─> Step 3: createOrder()
       └─> POST /orders con contactDetails e items
       └─> Backend procesa pago con Stripe
       └─> Backend crea orden y mints NFTs

6. Success
   └─> Muestra Summary page con detalles de orden
   └─> Limpia carrito
   └─> Usuario recibe email con tickets
```

### 9.2 Flujo de Reventa (Mercado Secundario)

```
1. Usuario en /account
   └─> Fetch de getNftsByOwner(userAddress)
   └─> Muestra lista de NFTs comprados

2. Selecciona NFT para revender
   └─> Ingresa precio de reventa
   └─> Click "Set Price"
   └─> Llama a función setNftPrice() (NO IMPLEMENTADA en services.tsx)
   └─> Backend actualiza estado NFT a SALE

3. Otro usuario visita /events/:eventId
   └─> event.nfts muestra NFTs en venta
   └─> Click "Buy Resale Ticket"
   └─> buyNft() → POST /nfts/buy
   └─> Backend procesa transferencia
   └─> Actualiza ownership del NFT
```

⚠️ **NOTA**: La función `setNftPrice()` NO está implementada en `services.tsx` aunque hay una interfaz `SetNftPrice` definida.

---

## 10. DEPLOYMENT Y CONTAINERIZACIÓN

### 10.1 Dockerfile (Nginx)

```dockerfile
# Multi-stage build (comentado el stage de build)
# FROM node:16 as build
# WORKDIR /app
# COPY package*.json .
# RUN npm install
# COPY . .
# CMD npm run build

# Production stage
FROM nginx:1.21.6-alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY /build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
```

**Nota**: El stage de build está comentado, se asume pre-build antes de Docker.

### 10.2 Proceso de Deployment

```bash
# 1. Build de React app
npm install
npm run build  # Genera /build con assets estáticos

# 2. Docker build (copia /build al nginx)
docker build -t futura-tickets:latest .

# 3. Docker run
docker run -p 80:80 futura-tickets:latest
```

### 10.3 Nginx Configuration

```nginx
# nginx/nginx.conf
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;  # SPA fallback
  }
}
```

### 10.4 Variables de Entorno

```bash
# .env (Create React App)
REACT_APP_API_URL=https://api.futuratickets.com
```

**Nota**: En CRA solo variables con prefijo `REACT_APP_` son accesibles.

---

## 11. COMPARACIÓN CON V2

### 11.1 Mejoras en V2 (futura-market-place-v2-main)

| Característica | V1 (este repo) | V2 (actual) |
|----------------|----------------|-------------|
| **Framework** | CRA (Client-side only) | Next.js 15 (SSR + Static) |
| **SEO** | ❌ Pobre (SPA puro) | ✅ Excelente (SSR) |
| **Performance** | ⚠️ Media (todo JS client) | ✅ Alta (streaming, RSC) |
| **Routing** | React Router | Next.js App Router |
| **UI Library** | Ant Design (pesado) | Radix + Tailwind (ligero) |
| **API Layer** | Direct fetch | API Routes (BFF) |
| **State Mgmt** | Context simple | 3 contexts especializados |
| **Autenticación** | JWT en localStorage | JWT en localStorage + Google OAuth |
| **Cart Persistence** | ❌ No persiste | ✅ localStorage |
| **Stripe Integration** | Básica | Avanzada (Payment Element) |
| **Resale Market** | ⚠️ Parcial | ✅ Completo |
| **Transfer Tickets** | ❌ No implementado | ✅ Implementado |
| **Promocodes** | ❌ No implementado | ✅ Implementado |
| **Multi-idioma** | ❌ No | ❌ No (pendiente en v2) |
| **Testing** | ❌ 0% | ❌ 0% |
| **TypeScript** | ✅ Sí (4.9.5) | ✅ Sí (5.x) |
| **Bundle Size** | ⚠️ Grande | ✅ Optimizado |

### 11.2 Funcionalidades Removidas en V2

- ❌ **Ant Design**: Removido por completo
- ❌ **SASS**: Sustituido por Tailwind
- ❌ **Direct API calls**: Ahora vía API Routes

### 11.3 Funcionalidades Nuevas en V2

- ✅ **Google OAuth**: Login con Google
- ✅ **Transfer Tickets**: Transferir tickets a otros usuarios
- ✅ **Promocodes & Coupons**: Sistema completo de descuentos
- ✅ **Resale Market mejorado**: Interfaz completa
- ✅ **Leaflet Maps**: Mapas interactivos de eventos
- ✅ **QR Codes**: Generación de QR para tickets
- ✅ **Order History**: Historial completo de compras
- ✅ **Server Components**: RSC para mejor performance

---

## 12. ESTADO DEL PROYECTO

### 12.1 Funcionalidades Implementadas ✅

#### Core Functionality
- ✅ Listado de eventos
- ✅ Detalle de evento
- ✅ Carrito de compras (sin persistencia)
- ✅ Checkout flow básico
- ✅ Integración con Stripe
- ✅ Autenticación con JWT
- ✅ Registro de usuarios
- ✅ Perfil de usuario
- ✅ Ver NFTs comprados

#### UI Components
- ✅ Header con navegación
- ✅ Event cards (Ant Design)
- ✅ Forms de login/register
- ✅ Checkout multi-step

### 12.2 Funcionalidades Parciales ⚠️

#### Mercado Secundario
- ⚠️ Interfaz para ver NFTs en venta
- ⚠️ `buyNft()` implementado
- ❌ `setNftPrice()` NO implementado en services
- ❌ No hay UI completa para gestionar ventas

#### Autenticación
- ⚠️ Login funcional
- ⚠️ Token en localStorage (vulnerable XSS)
- ❌ No hay refresh token
- ❌ No hay logout explícito
- ❌ No hay Google OAuth

### 12.3 Funcionalidades Faltantes ❌

#### Testing
- ❌ Tests unitarios (0%)
- ❌ Tests E2E (0%)
- ❌ Tests de integración (0%)

#### Features
- ❌ Transferencia de tickets
- ❌ Promocodes / Coupons
- ❌ Multi-idioma
- ❌ Notificaciones push
- ❌ Wallet integration (MetaMask)
- ❌ Favoritos
- ❌ Búsqueda avanzada
- ❌ Filtros de eventos

#### Developer Experience
- ❌ ESLint configuración custom
- ❌ Pre-commit hooks
- ❌ CI/CD pipeline
- ❌ Documentación de componentes

#### Performance
- ❌ Code splitting
- ❌ Lazy loading de rutas
- ❌ Image optimization
- ❌ Service Worker / PWA

#### Seguridad
- ❌ CORS configurado en frontend
- ❌ Input sanitization
- ❌ Rate limiting (debe ser backend)
- ❌ HTTPS enforcement

---

## 13. PROBLEMAS DETECTADOS

### 13.1 Bugs Críticos 🔴

#### 1. useEffect sin dependencias
**Archivo**: `FuturaTickets.tsx:50`
```typescript
useEffect(() => {
  checkAccount();
}, [])  // ❌ Falta navigate y dispatch en deps
```
**Impacto**: Warning de React, posible comportamiento inesperado.

#### 2. setNftPrice no implementado
**Archivo**: `services.tsx`
- Interface `SetNftPrice` existe
- Función NO está implementada en services
**Impacto**: No se pueden poner NFTs en venta.

#### 3. Token en localStorage
```typescript
localStorage.getItem('token')  // Vulnerable a XSS
```
**Riesgo**: Robo de tokens via XSS attack.

### 13.2 Code Smells ⚠️

#### 1. any types
```typescript
function FuturaTickets({ children }: any)  // ❌ Should be ReactNode
```

#### 2. Manejo de errores silencioso
```typescript
.catch((err) => console.log(err))  // ❌ Solo log, no UI feedback
```

#### 3. Estado global sin estructura
```typescript
const dispatch = (newState) => {
  setState((prevState) => ({ ...prevState, ...newState }));
};
```
No hay validación de qué campos se están actualizando.

#### 4. Cart no persiste
Al recargar página se pierde el carrito.

### 13.3 Performance Issues 🐌

#### 1. Ant Design bundle size
Ant Design es pesado (~500KB gzipped) vs Radix UI (~50KB).

#### 2. No code splitting
Todo el código se carga de una vez.

#### 3. No lazy loading
Componentes grandes no se cargan bajo demanda.

---

## 14. MIGRACIÓN A V2

### 14.1 Razones para la Migración

1. **SEO**: V1 es SPA puro, V2 tiene SSR
2. **Performance**: V2 usa RSC y streaming
3. **UX**: V2 tiene mejor UI con Radix + Tailwind
4. **Features**: V2 tiene más funcionalidades (transfer, promocodes, etc)
5. **Mantenibilidad**: Next.js es más fácil de mantener que CRA
6. **Bundle Size**: V2 es más ligero

### 14.2 Pasos de Migración Realizados

```
CRA (V1)                    →    Next.js (V2)
───────────────────────────────────────────────
React Router                →    App Router
src/Events/Events.tsx       →    app/page.tsx
src/Event/Event.tsx         →    app/events/[id]/page.tsx
src/Cart/Cart.tsx           →    app/cart/page.tsx
Ant Design                  →    Radix UI + Tailwind
Direct fetch                →    API Routes (BFF)
SASS                        →    Tailwind CSS
GlobalStateProvider         →    3 specialized contexts
localStorage token          →    Kept (+ Google OAuth)
```

### 14.3 Datos Preservados

- ✅ Interfaces TypeScript (adaptadas)
- ✅ Lógica de negocio core
- ✅ Flujos de usuario principales
- ✅ Integración con Stripe
- ✅ Sistema de autenticación

### 14.4 Datos Descartados

- ❌ Ant Design components
- ❌ SASS styles
- ❌ React Router setup
- ❌ CRA config

---

## 15. RECOMENDACIONES

### 15.1 Para Mantenimiento de V1 (si se requiere)

#### Prioridad Alta 🔴
1. **Implementar setNftPrice()** en services.tsx
2. **Corregir useEffect deps** en FuturaTickets.tsx
3. **Persistir cart** en localStorage
4. **Añadir manejo de errores** en UI

#### Prioridad Media 🟡
5. **Tipado fuerte** (eliminar `any`)
6. **Tests básicos** (al menos smoke tests)
7. **Code splitting** con React.lazy()
8. **Error boundaries**

### 15.2 Para Migración a V2 ✅

**RECOMENDACIÓN: Ya se migró a V2 (futura-market-place-v2-main)**

Este repositorio (V1) debería considerarse **LEGACY** y no recibir más desarrollo.

### 15.3 Para Deprecación

```bash
# Agregar al README.md
⚠️ **DEPRECATED**: This repository is legacy code.
Please use `futura-market-place-v2-main` instead.

# Archivar el repo en GitHub
Settings → Archive this repository
```

---

## 16. CONCLUSIONES

### 16.1 Fortalezas de V1 ✅

1. **Arquitectura simple**: Fácil de entender para principiantes
2. **TypeScript**: Interfaces bien definidas
3. **Separación de concerns**: Services layer separado
4. **Ant Design**: UI consistente out-of-the-box
5. **Funcional**: Core functionality trabaja correctamente

### 16.2 Limitaciones de V1 ⚠️

1. **SEO pobre**: SPA puro sin SSR
2. **Performance**: Bundle size grande, no optimization
3. **Escalabilidad**: Difícil añadir features complejas
4. **Mantenibilidad**: CRA no se mantiene activamente
5. **Testing**: 0% coverage
6. **Seguridad**: Token en localStorage, no input validation

### 16.3 Veredicto Final 🎯

**Este repositorio (V1) ha sido EXITOSAMENTE SUSTITUIDO por V2.**

La migración a Next.js 15 fue la decisión correcta porque:
- ✅ Mejor performance (SSR + RSC)
- ✅ Mejor SEO (crawlers pueden indexar)
- ✅ Más features (transfer, promocodes, OAuth)
- ✅ Mejor DX (App Router, API Routes)
- ✅ Mejor UX (UI más ligera y rápida)

**Acción recomendada:**
1. Archivar este repositorio
2. Documentar en README que está deprecado
3. Redirigir todo desarrollo a V2
4. Mantener solo por referencia histórica

---

## ANEXOS

### A. Scripts npm

```json
{
  "scripts": {
    "start": "react-scripts start",     // Dev server (port 3000)
    "build": "react-scripts build",     // Production build
    "test": "react-scripts test",       // Jest tests
    "eject": "react-scripts eject"      // Eject from CRA (irreversible)
  }
}
```

### B. Comandos Útiles

```bash
# Desarrollo
npm start                # http://localhost:3000

# Build
npm run build           # Output: /build folder

# Testing
npm test                # Jest interactive mode
npm test -- --coverage  # Coverage report

# Deployment
docker build -t futura-tickets:latest .
docker run -p 80:80 futura-tickets:latest
```

### C. Environment Variables

```bash
# .env
REACT_APP_API_URL=https://api.futuratickets.com

# Acceso en código
process.env.REACT_APP_API_URL
```

---

**FIN DEL DOCUMENTO**

---

**Proyecto:** FuturaTickets Main (Legacy v1)
**Tecnología:** React 18 + TypeScript + CRA + Ant Design
**Estado:** ⚠️ DEPRECADO (usar futura-market-place-v2-main)
**Documentación actualizada:** 2025-10-10
