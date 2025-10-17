# 🚀 TERMINAL 1: BACKEND APIs

## Backend APIs (3 NestJS Services)

### 🚀 Inicio Rápido

```bash
./start-all-backends.sh
```

Este script inicia las 3 APIs NestJS en paralelo con logs diferenciados por colores.

---

## 🌐 APIs Disponibles

| API | Puerto | URL | Función |
|-----|--------|-----|---------|
| **Admin API** | 3002 | http://localhost:3002 | Gestión de eventos, órdenes, ventas, pagos |
| **Marketplace API** | 3004 | http://localhost:3004 | Procesamiento de pagos (Stripe), emails |
| **Access API** | 3005 | http://localhost:3005 | Control de acceso, validación de tickets |

---

## 📦 Estructura

```
futura-tickets-admin-api/       → NestJS 10.0.0 (Admin)
futura-market-place-api/        → NestJS 10.0.0 (Marketplace)
futura-access-api/              → NestJS 11.0.1 (Access)
```

---

## 🛠️ Comandos Útiles

### ✅ Health Check
```bash
./check-all-services.sh
```

Verifica el estado de las 3 APIs (y todos los demás servicios).

### 🛑 Detener Todas las APIs
```bash
# Opción 1: Script específico
pkill -f "nest start"

# Opción 2: Por puerto
kill -9 $(lsof -ti:3002 3004 3005)

# Opción 3: Todo el stack
./stop-all-stack.sh
```

### 🔍 Ver logs de una API específica
```bash
# Admin API
tail -f futura-tickets-admin-api/logs/*.log

# Marketplace API
tail -f futura-market-place-api/logs/*.log

# Access API
tail -f futura-access-api/logs/*.log
```

### 🔧 Verificar dependencias instaladas
```bash
cd futura-tickets-admin-api && npm list @nestjs/core
cd ../futura-market-place-api && npm list @nestjs/core
cd ../futura-access-api && npm list @nestjs/core
```

### 🧹 Limpiar y reinstalar dependencias (si hay problemas)
```bash
for api in futura-tickets-admin-api futura-market-place-api futura-access-api; do
  cd $api
  rm -rf node_modules package-lock.json
  npm install
  cd ..
done
```

---

## 📋 Detalles por API

### Admin API (Puerto 3002)

**Repositorio**: `futura-tickets-admin-api`

**Stack**:
- NestJS 10.0.0
- MongoDB + Mongoose 8.4.3
- Stripe 17.4.0
- Bull 4.14.0 (job queues)
- Socket.IO 4.7.5

**Funcionalidades**:
- ✅ CRUD de eventos
- ✅ Gestión de ventas/tickets
- ✅ Gestión de órdenes
- ✅ Sistema de pagos a promotores
- ✅ WebSockets para notificaciones
- ✅ CronJobs (cada 15 min) para actualizar eventos
- ✅ Sistema de emails con Bull queues

**Variables de entorno requeridas**:
```bash
PORT=3002
MONGO_URL=mongodb://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
REDIS_HOST=localhost
REDIS_PORT=6379
AZURE_STORAGE_CONNECTION_STRING=...
```

**Comando de inicio**:
```bash
cd futura-tickets-admin-api
PORT=3002 npm run start:dev
```

**Documentación completa**: `futura-tickets-admin-api/CLAUDE.md`

---

### Marketplace API (Puerto 3004)

**Repositorio**: `futura-market-place-api`

**Stack**:
- NestJS 10.0.0
- MongoDB + Mongoose 8.4.3
- Stripe 17.4.0
- Bull 4.14.0 + BullMQ 5.8.3
- Socket.IO 4.7.5 + Azure Web PubSub
- ethers 6.13.1 + viem 2.20.0 (blockchain)

**Funcionalidades**:
- ✅ Procesamiento de pagos con Stripe
- ✅ Creación de órdenes de compra
- ✅ Sistema de emails transaccionales (9 tipos)
- ✅ Gestión de tickets/sales
- ✅ WebSockets para notificaciones en tiempo real
- ✅ Sistema de colas para procesamiento asíncrono
- ⚠️ Integración blockchain (parcial)

**Variables de entorno requeridas**:
```bash
PORT=3004
MONGO_URL=mongodb://...
JWT_SECRET_KEY=...
STRIPE_PUBLIC_KEY=pk_...
STRIPE_PRIVATE_KEY=sk_...
STRIPE_ENDPOINT_SECRET=whsec_...
REDIS_HOST=localhost
REDIS_PORT=6379
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=...
MAIL_PASSWORD=...
SOCKET_MARKETPLACE=...
```

**Comando de inicio**:
```bash
cd futura-market-place-api
PORT=3004 npm run start:dev
```

**Documentación completa**: `futura-market-place-api/CLAUDE.md`

---

### Access API (Puerto 3005)

**Repositorio**: `futura-access-api`

**Stack**:
- NestJS 11.0.1
- MongoDB + Mongoose 8.19.1
- Socket.IO 4.8.1 + Azure Web PubSub
- JWT Authentication
- bcryptjs (password hashing)

**Funcionalidades**:
- ✅ Validación de tickets mediante QR
- ✅ Control de acceso a eventos (check-in/check-out)
- ✅ Gestión de personal de acceso
- ✅ Monitoreo en tiempo real vía WebSockets
- ✅ Gestión de promocodes e invitaciones
- ✅ Auditoría de accesos con historial

**Variables de entorno requeridas**:
```bash
PORT=3005
MONGO_URL=mongodb://...
JWT_SECRET_KEY=...
SOCKET_ACCESS=Endpoint=https://...;AccessKey=...;Version=1.0;
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

**Comando de inicio**:
```bash
cd futura-access-api
PORT=3005 npm run start:dev
```

**Documentación completa**: `futura-access-api/CLAUDE.md`

---

## 🔥 Problemas Comunes

### Error: "Port already in use"
```bash
# Ver qué proceso usa el puerto
lsof -i :3002

# Matarlo
kill -9 <PID>

# O matar todos los backends
./stop-all-stack.sh
```

### Error: "Cannot connect to MongoDB"
```bash
# Verificar conexión
mongosh "mongodb+srv://..."

# Verificar variable MONGO_URL en .env
cat futura-tickets-admin-api/.env | grep MONGO_URL
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
cd nombre-api
rm -rf node_modules package-lock.json
npm install
```

### Error: "Redis connection failed"
```bash
# Verificar Redis corriendo
redis-cli ping

# Si no tienes Redis local
brew install redis        # macOS
brew services start redis

# O usar Redis Cloud/AWS
```

---

## 📊 Monitoreo

### Ver estado de APIs
```bash
./check-all-services.sh
```

### Ver logs en vivo
```bash
# Admin API
cd futura-tickets-admin-api && npm run start:dev

# Marketplace API
cd futura-market-place-api && npm run start:dev

# Access API
cd futura-access-api && npm run start:dev
```

### Verificar conexiones MongoDB
```bash
# Desde cualquier API
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URL).then(() => console.log('✓ Connected')).catch(err => console.log('✗ Error:', err))"
```

---

## 🚀 Quick Start Completo

```bash
# 1. Asegurar que MongoDB y Redis están corriendo
# (O usar MongoDB Atlas y Redis Cloud)

# 2. Configurar variables de entorno en cada API
# Ver .env.example en cada carpeta

# 3. Instalar dependencias (primera vez)
for api in futura-tickets-admin-api futura-market-place-api futura-access-api; do
  cd $api && npm install && cd ..
done

# 4. Iniciar todas las APIs
./start-all-backends.sh

# 5. Verificar estado
./check-all-services.sh
```

---

## 📝 Notas Importantes

### Dependencias Compartidas
Las 3 APIs comparten la misma base de datos MongoDB, por lo que los datos son consistentes entre ellas.

**Colecciones compartidas**:
- `accounts` - Usuarios del sistema
- `events` - Eventos
- `orders` - Órdenes de compra
- `sales` - Tickets vendidos
- `promoters` - Organizadores

### Comunicación entre APIs
Las APIs NO se comunican directamente entre sí. Toda la comunicación es:
- **Cliente → API** (REST)
- **API → MongoDB** (compartida)
- **API → Redis** (colas de Bull)
- **API → WebSockets** (notificaciones en tiempo real)

### Testing
**Estado actual**: 0% coverage en las 3 APIs

**Próximos pasos**:
1. Tests unitarios de servicios
2. Tests de integración con MongoDB
3. Tests E2E de endpoints

---

**Para más información**: Ver `README_MASTER.md` y `PORT_MAP.md`
