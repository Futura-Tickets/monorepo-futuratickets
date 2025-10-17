# 🛠️ FuturaTickets - Guía Completa de Desarrollo

> **Última actualización:** 2025-10-17
> **Audiencia:** Desarrolladores frontend/backend
> **Tiempo de setup:** 5 minutos

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Setup Inicial](#setup-inicial)
4. [Opciones de Inicio](#opciones-de-inicio)
5. [Flujo de Desarrollo](#flujo-de-desarrollo)
6. [Debugging y Troubleshooting](#debugging-y-troubleshooting)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🔧 REQUISITOS PREVIOS

### Software Requerido

| Software | Versión | Instalación |
|----------|---------|-------------|
| **Node.js** | 20.x | `brew install node@20` |
| **npm** | 10.x | Incluido con Node.js |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| **MongoDB Shell** | 2.x (opcional) | `brew install mongosh` |
| **Redis CLI** | 7.x (opcional) | `brew install redis` |

### Verificar Instalación

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
docker --version  # Docker version 24.x.x
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    FUTURA TICKETS STACK                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend Layer (Next.js 15)                                │
│  ├─ Marketplace Web (3000)  → React 19 + Radix UI          │
│  └─ Admin Web (3003)        → React 19 + Ant Design        │
│                                                             │
│  Backend Layer (NestJS)                                     │
│  ├─ Admin API (4101)        → Events, Auth, Analytics      │
│  ├─ Marketplace API (4102)  → Orders, Payments, Stripe     │
│  └─ Access API (4103)       → Resale, Transfer, Tickets    │
│                                                             │
│  Infrastructure Layer (Docker)                              │
│  ├─ MongoDB (27017)         → Database principal           │
│  ├─ Redis (6379)            → Cache y Queue                │
│  ├─ MinIO (9000/9001)       → S3-compatible storage        │
│  └─ Mongo Express (8081)    → DB Admin UI                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario → Marketplace Web (3000)
          ↓
          Admin API (4101)        → MongoDB
          Marketplace API (4102)  → Redis
          Access API (4103)       → MinIO
          ↓
          Stripe, Email, etc.
```

### Responsabilidades de Cada API

#### Admin API (4101)
- Gestión de eventos (CRUD)
- Autenticación y usuarios
- Analytics y reportes
- Configuración de promotores
- Promo codes y coupons

#### Marketplace API (4102)
- Creación de órdenes
- Integración con Stripe
- Envío de emails (tickets)
- Gestión de pagos
- Carrito de compras

#### Access API (4103)
- Sistema de reventa
- Transferencia de tickets
- Validación de QR codes
- Control de acceso a eventos

---

## 🚀 SETUP INICIAL

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-org/monorepo-futuratickets.git
cd monorepo-futuratickets
```

### 2. Verificar Estructura

```bash
tree -L 1
# Deberías ver:
# ├── futura-tickets-admin-api/
# ├── futura-market-place-api/
# ├── futura-access-api/
# ├── futura-market-place-v2/
# ├── futura-tickets-admin/
# ├── docker-compose.infra.yml
# └── scripts de inicio (*.sh)
```

### 3. Instalar Dependencias

**Opción A: Instalación automática (todo de una vez)**
```bash
# Instalará node_modules en todas las aplicaciones
for dir in futura-*-api futura-*-v2 futura-tickets-admin; do
  if [ -d "$dir" ]; then
    echo "Installing dependencies in $dir..."
    (cd "$dir" && npm install)
  fi
done
```

**Opción B: Instalación manual (una por una)**
```bash
# Backend APIs
cd futura-tickets-admin-api && npm install && cd ..
cd futura-market-place-api && npm install && cd ..
cd futura-access-api && npm install && cd ..

# Frontends
cd futura-market-place-v2 && npm install && cd ..
cd futura-tickets-admin && npm install && cd ..
```

### 4. Configurar Variables de Entorno

Ya están configuradas las siguientes:
- ✅ `futura-tickets-admin-api/.env.development`
- ✅ `futura-market-place-api/.env.development`
- ✅ `futura-access-api/.env.development`
- ✅ `futura-market-place-v2/.env.local`
- ✅ `futura-tickets-admin/.env.local`

**Verificar configuración:**
```bash
# Ver puertos configurados
grep "PORT=" futura-*-api/.env.development
# Debería mostrar: 4101, 4102, 4103
```

---

## 🎮 OPCIONES DE INICIO

### Opción A: Inicio Automático (Recomendado para Desarrollo)

**Inicia TODO el stack automáticamente:**
```bash
./start-all-dev.sh
```

✅ **Ventajas:**
- Un solo comando
- Inicio secuencial optimizado
- Health check automático
- PIDs guardados para stop fácil

⚠️ **Desventajas:**
- No ves logs en tiempo real
- Más difícil debuggear errores

**Detener todo:**
```bash
./stop-all-dev.sh
```

---

### Opción B: Inicio Manual (Recomendado para Debugging)

**Terminal 1: Infraestructura**
```bash
./start-infra.sh
# Logs visibles en esta terminal
# MongoDB, Redis, MinIO, Mongo Express
```

**Terminal 2: Admin API**
```bash
cd futura-tickets-admin-api
../start-admin-api.sh
# Hot reload con NestJS watch mode
# Puerto 4101
```

**Terminal 3: Marketplace API**
```bash
cd futura-market-place-api
../start-marketplace-api.sh
# Puerto 4102
```

**Terminal 4: Access API**
```bash
cd futura-access-api
../start-access-api.sh
# Puerto 4103
```

**Terminal 5: Marketplace Web**
```bash
cd futura-market-place-v2
../start-marketplace-web.sh
# Next.js con Turbopack
# Puerto 3000
```

**Terminal 6: Admin Web**
```bash
cd futura-tickets-admin
../start-admin-web.sh
# Puerto 3003
```

✅ **Ventajas:**
- Logs en tiempo real por terminal
- Fácil debugging
- Reinicio individual de servicios
- Ver errores inmediatamente

⚠️ **Desventajas:**
- 6 terminales abiertas
- Más comandos manuales

---

### Opción C: Layout con tmux (Avanzado)

```bash
# Crear layout de 6 ventanas
tmux new-session \; \
  split-window -h \; \
  split-window -v \; \
  split-window -v \; \
  select-pane -t 0 \; \
  split-window -v \; \
  split-window -v
```

---

## 🔄 FLUJO DE DESARROLLO

### Desarrollo Diario

```bash
# Mañana - Iniciar entorno
./start-all-dev.sh
# Espera 2 minutos hasta que todo esté listo

# Durante el día - Hacer cambios
# Los frontends y backends tienen hot reload automático

# Tarde - Detener entorno
./stop-all-dev.sh
```

### Verificar Estado del Sistema

```bash
./health-check.sh

# Output esperado:
# ✓ Docker daemon
# ✓ MongoDB container
# ✓ Redis container
# ✓ MinIO container
# ✓ Mongo Express container
# ✓ MongoDB connection
# ✓ Redis connection
# ✓ MinIO Console
# ✓ Mongo Express
# ✓ Admin API
# ✓ Marketplace API
# ✓ Access API
# ✓ Marketplace Web
# ✓ Admin Web
```

### Acceder a las Aplicaciones

| Aplicación | URL | Credenciales |
|------------|-----|--------------|
| **Marketplace** | http://localhost:3000 | Registro público |
| **Admin Panel** | http://localhost:3003 | Login promotor |
| **Mongo Express** | http://localhost:8081 | admin / admin123 |
| **MinIO Console** | http://localhost:9001 | futuraadmin / futurapass123 |

### Trabajar con la Base de Datos

```bash
# Conectar a MongoDB
mongosh "mongodb://futuraadmin:futurapass123@localhost:27017/futuratickets?authSource=admin"

# Ver colecciones
show collections

# Ver eventos
db.events.find().pretty()

# Ver órdenes
db.orders.find().limit(5).pretty()

# Limpiar base de datos (CUIDADO!)
db.dropDatabase()
```

### Trabajar con Redis

```bash
# Conectar a Redis
redis-cli -h localhost -p 6379 -a futurapass123

# Ver todas las keys
KEYS *

# Ver valor de una key
GET key_name

# Limpiar cache (CUIDADO!)
FLUSHALL
```

---

## 🐛 DEBUGGING Y TROUBLESHOOTING

### Problema: Puerto Ocupado

```bash
# Identificar qué usa el puerto
lsof -i :4101

# Matar proceso
kill -9 <PID>

# O usando el script de stop
./stop-all-dev.sh
```

### Problema: MongoDB Connection Failed

```bash
# Verificar contenedor
docker ps | grep futura-mongodb

# Ver logs
docker compose -f docker-compose.infra.yml logs mongodb

# Reiniciar MongoDB
docker compose -f docker-compose.infra.yml restart mongodb

# Si persiste, recrear
docker compose -f docker-compose.infra.yml down
./start-infra.sh
```

### Problema: Module Not Found (Frontend)

```bash
cd futura-market-place-v2  # o futura-tickets-admin
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

### Problema: Module Not Found (Backend)

```bash
cd futura-tickets-admin-api  # o cualquier API
rm -rf node_modules dist package-lock.json
npm install
npm run build
npm run start:dev
```

### Problema: Stripe No Funciona

```bash
# Verificar keys en .env.development
cat futura-market-place-api/.env.development | grep STRIPE

# Debe tener:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Problema: Next.js Build Error

```bash
# Limpiar cache de Next.js
cd futura-market-place-v2
rm -rf .next

# Rebuild
npm run build
```

### Ver Logs de Infraestructura

```bash
# Todos los servicios
docker compose -f docker-compose.infra.yml logs -f

# Solo MongoDB
docker compose -f docker-compose.infra.yml logs -f mongodb

# Solo Redis
docker compose -f docker-compose.infra.yml logs -f redis
```

---

## 🧪 TESTING

### Backend (APIs)

```bash
# Unit tests
cd futura-tickets-admin-api
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend

```bash
# Marketplace Web
cd futura-market-place-v2
npm run test          # Si existen tests

# Admin Web
cd futura-tickets-admin
npm run test
```

### Smoke Test Manual

```bash
# Ejecutar smoke test
./tests/smoke-test.sh

# Debe verificar:
# 1. Crear evento
# 2. Comprar ticket
# 3. Validar ticket
# 4. Resale flow
```

---

## 📦 DEPLOYMENT

### Build de Producción

```bash
# Frontend - Marketplace
cd futura-market-place-v2
npm run build
npm run start  # Puerto 3000

# Frontend - Admin
cd futura-tickets-admin
npm run build
npm run start  # Puerto 3003

# Backend - Ejemplo Admin API
cd futura-tickets-admin-api
npm run build
npm run start:prod  # Puerto 4101
```

### Docker Build

```bash
# Build imagen
docker build -t futuratickets/admin-api:latest futura-tickets-admin-api/

# Run container
docker run -p 4101:4101 \
  -e NODE_ENV=production \
  -e MONGO_URL=mongodb://... \
  futuratickets/admin-api:latest
```

---

## 📚 RECURSOS ADICIONALES

### Documentación

- [QUICK_START.md](./QUICK_START.md) - Setup rápido en 5 minutos
- [README.md](./README.md) - Overview del proyecto
- [docs/](./docs/) - Documentación técnica detallada

### Scripts Útiles

```bash
# Ver todos los scripts disponibles
ls -lah *.sh

# Ver puertos en uso
lsof -i -P | grep LISTEN | grep -E '(3000|3003|4101|4102|4103)'

# Verificar servicios Docker
docker compose -f docker-compose.infra.yml ps

# Monitorear CPU/RAM
docker stats
```

### Comandos Útiles de Git

```bash
# Ver estado
git status

# Crear feature branch
git checkout -b feature/mi-feature

# Commit
git add .
git commit -m "feat: nueva funcionalidad"

# Push
git push origin feature/mi-feature
```

---

## 🆘 SOPORTE

### ¿Problemas?

1. **Revisa health-check:** `./health-check.sh`
2. **Revisa logs:** `docker compose -f docker-compose.infra.yml logs`
3. **Reinicia servicios:** `./stop-all-dev.sh && ./start-all-dev.sh`
4. **Limpia y reinstala:** `rm -rf node_modules && npm install`

### Contacto

- **Slack:** #futura-dev
- **Email:** dev@futuratickets.com
- **Docs:** https://docs.futuratickets.com

---

**Happy Coding! 🚀**
