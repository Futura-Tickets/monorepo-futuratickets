# Servicios Futura Tickets - Puertos y Enlaces

**Última actualización:** 2025-10-14

---

## 📋 Resumen de Servicios

| Servicio | Puerto | Estado | URL | Descripción |
|----------|--------|--------|-----|-------------|
| **Admin API** | 3000 | ✅ Activo | http://localhost:3000 | Backend NestJS para admin panel |
| **Admin Frontend** | 3001 | ✅ Activo | http://localhost:3001 | Panel de administración (Next.js) |
| **Marketplace API** | 3002 | ⚠️ Opcional | http://localhost:3002 | Backend para marketplace público |
| **Marketplace Frontend** | 3003 | ⚠️ Opcional | http://localhost:3003 | Tienda pública de eventos |
| **Access API** | 3004 | ⚠️ Opcional | http://localhost:3004 | Backend para control de accesos |
| **Redis** | 6379 | ✅ Activo | localhost:6379 | Cache y colas (Bull) |
| **MongoDB** | 27017 | ✅ Activo | mongodb://localhost:27017 | Base de datos principal |

---

## 🎯 Servicios Principales (Activos)

### 1. Admin API (Puerto 3000)

**URL:** http://localhost:3000

**Descripción:** Backend principal para el panel de administración de promotores.

**Stack:**
- NestJS 10.0.0
- MongoDB + Mongoose
- Redis + Bull Queues
- Socket.IO (⚠️ actualmente deshabilitado)
- JWT Authentication

**Endpoints principales:**
```
GET    http://localhost:3000/health          - Health check
GET    http://localhost:3000/api-docs        - Swagger documentation
POST   http://localhost:3000/api/auth/login  - Login
GET    http://localhost:3000/api/events      - Listar eventos
POST   http://localhost:3000/api/events      - Crear evento
```

**Cómo iniciar:**
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev
```

**Logs:**
```bash
tail -f /tmp/admin-api-final.log
```

---

### 2. Admin Frontend (Puerto 3001)

**URL:** http://localhost:3001

**Descripción:** Panel de administración web para promotores. Gestión de eventos, ventas, clientes, pagos y analytics.

**Stack:**
- Next.js 15.0.3
- React 19 RC
- Ant Design 5.22.0
- Socket.IO Client (⚠️ actualmente deshabilitado)
- TypeScript 5

**Páginas principales:**
```
http://localhost:3001/login             - Login de promotor
http://localhost:3001/events            - Dashboard de eventos
http://localhost:3001/events/create     - Crear nuevo evento
http://localhost:3001/events/[id]       - Detalle de evento
http://localhost:3001/clients           - Gestión de clientes
http://localhost:3001/payments          - Pagos y retiros
http://localhost:3001/analytics         - Analytics y estadísticas
http://localhost:3001/campaigns         - Campañas de marketing
http://localhost:3001/settings          - Configuración
```

**Cómo iniciar:**
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
npm run dev
```

**Logs:**
```bash
tail -f /tmp/admin-frontend-fixed.log
```

---

### 3. Redis (Puerto 6379)

**URL:** localhost:6379

**Descripción:** In-memory data store para caching, sesiones, y colas de trabajo (Bull).

**Cómo verificar:**
```bash
redis-cli ping
# Debe retornar: PONG
```

**Cómo iniciar (si no está corriendo):**
```bash
brew services start redis
# o
redis-server
```

**Ver datos:**
```bash
redis-cli
> KEYS *
> GET key_name
> QUIT
```

---

### 4. MongoDB (Puerto 27017)

**URL:** mongodb://localhost:27017

**Base de datos:** `futura-tickets-admin`

**Descripción:** Base de datos NoSQL para almacenar eventos, órdenes, usuarios, etc.

**Cómo verificar:**
```bash
mongosh
> show dbs
> use futura-tickets-admin
> show collections
> exit
```

---

## ⚠️ Servicios Opcionales (No necesarios para Admin Panel)

### 5. Marketplace API (Puerto 3002)

**URL:** http://localhost:3002

**Descripción:** Backend para el marketplace público donde los usuarios compran tickets.

**Estado:** ⚠️ Opcional - No necesario para desarrollo básico del admin panel

**Cómo iniciar (si es necesario):**
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-api
npm run start:dev > /tmp/marketplace-api.log 2>&1 &
```

**Endpoints:**
```
GET    http://localhost:3002/api/events          - Eventos públicos
POST   http://localhost:3002/api/orders          - Crear orden
GET    http://localhost:3002/api/tickets/[id]    - Info de ticket
```

---

### 6. Marketplace Frontend (Puerto 3003)

**URL:** http://localhost:3003

**Descripción:** Tienda pública donde los clientes compran tickets para eventos.

**Estado:** ⚠️ Opcional - Solo necesario para testing de compras end-to-end

**Cómo iniciar (si es necesario):**
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2
npm run dev > /tmp/marketplace-frontend.log 2>&1 &
```

**Páginas:**
```
http://localhost:3003/                  - Home con eventos
http://localhost:3003/events/[id]       - Detalle de evento
http://localhost:3003/checkout          - Proceso de compra
http://localhost:3003/my-tickets        - Mis tickets
```

---

### 7. Access API (Puerto 3004)

**URL:** http://localhost:3004

**Descripción:** Backend para control de accesos en eventos (escaneo de QR, check-in).

**Estado:** ⚠️ Opcional - Solo necesario para testing de control de accesos

**Cómo iniciar (si es necesario):**
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-access-api
npm run start:dev > /tmp/access-api.log 2>&1 &
```

**Endpoints:**
```
POST   http://localhost:3004/api/access/check-in    - Check-in de ticket
GET    http://localhost:3004/api/access/stats       - Estadísticas de acceso
```

---

## 🚀 Cómo Iniciar TODO el Stack

### Opción 1: Solo Admin Panel (Recomendado para desarrollo)

```bash
# 1. Iniciar servicios base
brew services start redis
brew services start mongodb-community

# 2. Iniciar Admin API
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev > /tmp/admin-api.log 2>&1 &

# 3. Iniciar Admin Frontend
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
npm run dev > /tmp/admin-frontend.log 2>&1 &

# 4. Abrir navegador
open http://localhost:3001
```

### Opción 2: Stack Completo (Admin + Marketplace + Access)

```bash
# 1. Servicios base
brew services start redis
brew services start mongodb-community

# 2. APIs
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev > /tmp/admin-api.log 2>&1 &

cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-api
npm run start:dev > /tmp/marketplace-api.log 2>&1 &

cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-access-api
npm run start:dev > /tmp/access-api.log 2>&1 &

# 3. Frontends
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
npm run dev > /tmp/admin-frontend.log 2>&1 &

cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2
npm run dev > /tmp/marketplace-frontend.log 2>&1 &

# 4. Abrir navegadores
open http://localhost:3001  # Admin Panel
open http://localhost:3003  # Marketplace
```

---

## 🔍 Verificación de Servicios

### Ver todos los puertos ocupados

```bash
lsof -i :3000,3001,3002,3003,3004,6379,27017
```

### Ver procesos Node.js corriendo

```bash
ps aux | grep -E "node.*start:dev|node.*next" | grep -v grep
```

### Verificar logs de cada servicio

```bash
# Admin API
tail -f /tmp/admin-api.log | grep -i error

# Admin Frontend
tail -f /tmp/admin-frontend.log | grep -i error

# Marketplace API
tail -f /tmp/marketplace-api.log | grep -i error

# Marketplace Frontend
tail -f /tmp/marketplace-frontend.log | grep -i error

# Access API
tail -f /tmp/access-api.log | grep -i error
```

### Health checks

```bash
# Admin API
curl http://localhost:3000/health
# Debe retornar: {"status":"ok","redis":"connected","database":"connected"}

# Marketplace API
curl http://localhost:3002/health

# Access API
curl http://localhost:3004/health
```

---

## 🛑 Cómo Detener Servicios

### Detener solo frontends

```bash
lsof -ti:3001,3003 | xargs kill -9 2>/dev/null
```

### Detener solo APIs

```bash
lsof -ti:3000,3002,3004 | xargs kill -9 2>/dev/null
```

### Detener TODO (APIs + Frontends)

```bash
lsof -ti:3000,3001,3002,3003,3004 | xargs kill -9 2>/dev/null
```

### Detener servicios base

```bash
brew services stop redis
brew services stop mongodb-community
```

---

## 🐛 Troubleshooting

### Error: "Port 3000 already in use"

```bash
# Ver qué proceso está usando el puerto
lsof -i :3000

# Matar el proceso
lsof -ti:3000 | xargs kill -9
```

### Error: "xhr poll error" en el frontend

**Causa:** Frontend intentando conectarse a Socket.IO pero el backend no tiene el endpoint configurado.

**Solución:** El Socket.IO está temporalmente deshabilitado en `.env.local`:

```bash
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3000  # ✅ Comentado para evitar errores
```

### Error: "MongoDB connection failed"

```bash
# Verificar si MongoDB está corriendo
brew services list | grep mongodb

# Iniciar MongoDB si está detenido
brew services start mongodb-community

# Ver logs de MongoDB
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Error: "Redis connection failed"

```bash
# Verificar si Redis está corriendo
redis-cli ping

# Iniciar Redis si está detenido
brew services start redis

# Ver logs de Redis
tail -f /usr/local/var/log/redis.log
```

---

## 📚 Documentación Adicional

- **Swagger Admin API:** http://localhost:3000/api-docs
- **CORS Configuration:** Ver `CORS_SECURITY.md`
- **Socket.IO Fix:** Ver `SOCKET_FIX.md`
- **Refactoring Plan:** Ver `REFACTORING_PLAN.md`
- **Health Checks:** Ver `HEALTH_CHECKS.md` (si existe)

---

## 🔐 Variables de Entorno

### Admin Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_FUTURA=http://localhost:3000
NEXT_PUBLIC_FUTURA_API=http://localhost:3000

# WebSocket (temporalmente deshabilitado)
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
# NEXT_PUBLIC_SOCKET_ACCESS_URL=http://localhost:3004
# NEXT_PUBLIC_SOCKET_MARKET_PLACE_URL=http://localhost:3002

# Azure Blob Storage
NEXT_PUBLIC_BLOB_URL=https://futuratickets.blob.core.windows.net/images

# Marketplace
NEXT_PUBLIC_MARKET_PLACE=http://localhost:3003

# Blockchain
NEXT_PUBLIC_BASE_SEPOLIA_SCAN=https://sepolia.etherscan.io

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Admin API (.env)

```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/futura-tickets-admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# Email (NodeMailer)
EMAIL_USER=noreply@futuratickets.com
EMAIL_PASS=your-email-password

# Stripe (opcional)
STRIPE_PRIVATE_KEY=sk_test_...

# Azure Storage (opcional)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...

# Blockchain (opcional)
RPC_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=0x...
```

---

## 📞 Contacto y Soporte

Para problemas técnicos, consultar:
1. Logs de servicios en `/tmp/*.log`
2. Documentación en cada repositorio
3. Issues en GitHub (si está configurado)

**Estado actual:** ✅ Admin API y Frontend funcionando correctamente sin errores Socket.IO
