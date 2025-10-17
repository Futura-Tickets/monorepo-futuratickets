# 🗺️ FUTURA TICKETS - Mapa de Puertos

## Arquitectura Completa del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                     FUTURA TICKETS STACK                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TERMINAL 1: BACKEND APIs 🚀                                    │
│  ├─ Admin API        → http://localhost:3002                    │
│  ├─ Marketplace API  → http://localhost:3004                    │
│  └─ Access API       → http://localhost:3005                    │
│                                                                  │
│  TERMINAL 2: BLOCKCHAIN ⛓️                                       │
│  └─ Hardhat Node     → http://localhost:8545                    │
│                                                                  │
│  TERMINAL 3: FRONTEND Apps 🎨                                   │
│  ├─ Marketplace      → http://localhost:3000                    │
│  ├─ Admin Panel      → http://localhost:3001                    │
│  └─ Access Web       → http://localhost:3007                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tabla de Puertos

| Puerto | Servicio | Tipo | Terminal | Estado |
|--------|----------|------|----------|--------|
| **3000** | Marketplace Frontend | Next.js | 3 | ✅ Asignado |
| **3001** | Admin Panel Frontend | Next.js | 3 | ✅ Asignado |
| **3002** | Admin API Backend | NestJS | 1 | ✅ Asignado |
| **3004** | Marketplace API Backend | NestJS | 1 | ✅ Asignado |
| **3005** | Access API Backend | NestJS | 1 | ✅ Asignado |
| **3007** | Access Web Frontend | Next.js | 3 | ✅ Asignado |
| **8545** | Hardhat Node | Blockchain | 2 | ✅ Asignado |

## Detalles por Componente

### TERMINAL 1: Backend APIs (NestJS)

#### Admin API (Puerto 3002)
- **Repositorio**: `futura-tickets-admin-api`
- **Framework**: NestJS 10.0.0
- **Base de Datos**: MongoDB
- **Funcionalidad**: Gestión de eventos, órdenes, ventas, pagos
- **Documentación**: `futura-tickets-admin-api/CLAUDE.md`
- **Comando**: `npm run start:dev`

#### Marketplace API (Puerto 3004)
- **Repositorio**: `futura-market-place-api`
- **Framework**: NestJS 10.0.0
- **Base de Datos**: MongoDB
- **Funcionalidad**: Procesamiento de pagos (Stripe), emails
- **Documentación**: `futura-market-place-api/CLAUDE.md`
- **Comando**: `npm run start:dev`

#### Access API (Puerto 3005)
- **Repositorio**: `futura-access-api`
- **Framework**: NestJS 11.0.1
- **Base de Datos**: MongoDB
- **Funcionalidad**: Control de acceso, validación de tickets
- **Documentación**: `futura-access-api/CLAUDE.md`
- **Comando**: `npm run start:dev`

---

### TERMINAL 2: Blockchain

#### Hardhat Node (Puerto 8545)
- **Repositorio**: `futura-tickets-contracts-v2`
- **Framework**: Hardhat
- **Network**: Local Ethereum node
- **Funcionalidad**: Smart contracts de tickets NFT
- **Comando**: `npx hardhat node`

---

### TERMINAL 3: Frontend Apps (Next.js)

#### Marketplace Frontend (Puerto 3000)
- **Repositorio**: `futura-market-place-v2`
- **Framework**: Next.js 15.2.2 + React 19
- **UI**: Tailwind + Radix UI
- **Funcionalidad**: Compra de tickets, marketplace
- **Documentación**: `futura-market-place-v2/CLAUDE.md`
- **Comando**: `npm run dev`

#### Admin Panel (Puerto 3001)
- **Repositorio**: `futura-tickets-admin`
- **Framework**: Next.js 15.0.3 + React 18
- **UI**: Ant Design
- **Funcionalidad**: Panel de administración de eventos
- **Documentación**: `futura-tickets-admin/CLAUDE.md`
- **Comando**: `npm run dev`

#### Access Web (Puerto 3007)
- **Repositorio**: `futura-tickets-web-access-app`
- **Framework**: Next.js
- **Funcionalidad**: Validación de accesos y QR
- **Comando**: `npm run dev`

---

## Variables de Entorno por API

### Admin API (.env)
```bash
PORT=3002
MONGO_URL=mongodb://...
STRIPE_SECRET_KEY=sk_...
JWT_SECRET=...
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Marketplace API (.env)
```bash
PORT=3004
MONGO_URL=mongodb://...
STRIPE_PUBLIC_KEY=pk_...
STRIPE_PRIVATE_KEY=sk_...
JWT_SECRET_KEY=...
REDIS_HOST=localhost
```

### Access API (.env)
```bash
PORT=3005
MONGO_URL=mongodb://...
JWT_SECRET_KEY=...
SOCKET_ACCESS=...
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

---

## Dependencias Entre Servicios

```
Marketplace Frontend (3000)
    │
    ├──► Marketplace API (3004) → Stripe, MongoDB
    └──► Admin API (3002) → Events, Orders

Admin Panel (3001)
    │
    └──► Admin API (3002) → CRUD completo

Access Web (3007)
    │
    └──► Access API (3005) → Validación, WebSockets

Hardhat Node (8545)
    │
    └──► Usado por las 3 APIs para blockchain operations
```

---

## Comandos Rápidos

### Verificar puertos en uso
```bash
lsof -i :3000,:3001,:3002,:3004,:3005,:3007,:8545
```

### Matar procesos específicos
```bash
# Frontends
kill -9 $(lsof -ti:3000,:3001,:3007)

# APIs
kill -9 $(lsof -ti:3002,:3004,:3005)

# Blockchain
kill -9 $(lsof -ti:8545)
```

### Health check de todos los servicios
```bash
./check-all-services.sh
```

---

**Última actualización**: 2025-10-17
