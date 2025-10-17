# 🚀 FuturaTickets - Guía de Desarrollo Local

> **Fecha:** 2025-10-17
> **Versión:** 2.0
> **Estado:** Optimizado para desarrollo rápido

---

## 📋 ÍNDICE

1. [Estrategia de Desarrollo](#estrategia-de-desarrollo)
2. [Setup Inicial](#setup-inicial)
3. [Terminal 1: Infraestructura](#terminal-1-infraestructura)
4. [Desarrollo de APIs (npm run dev)](#desarrollo-de-apis)
5. [Desarrollo de Frontends](#desarrollo-de-frontends)
6. [Troubleshooting](#troubleshooting)
7. [Comandos Útiles](#comandos-útiles)

---

## 🎯 ESTRATEGIA DE DESARROLLO

### Filosofía: **Híbrida Docker + npm**

| Componente | Método | Razón |
|------------|--------|-------|
| **Infraestructura** | 🐳 Docker | Consistencia, aislamiento, fácil setup |
| **APIs Backend** | 📦 npm run dev | Hot reload, debugging, logs claros |
| **Frontends** | 📦 npm run dev | Fast refresh, mejor DX |

### ¿Por qué NO usar Docker para todo?

❌ **Problemas con Docker para desarrollo:**
- Lento para hot reload
- Difícil de debuggear
- Rebuild constante de imágenes
- Logs mezclados
- Mayor consumo de recursos

✅ **Ventajas de npm run dev local:**
- Hot reload instantáneo (NestJS watch mode)
- Debugging directo con breakpoints
- Logs claros por terminal
- Menor latencia
- Mejor experiencia de desarrollo

---

## ⚡ SETUP INICIAL

### Requisitos

```bash
# Node.js 20+
node --version  # v20.x.x o superior

# npm 10+
npm --version   # 10.x.x o superior

# Docker Desktop
docker --version  # 24.x.x o superior
```

### Instalación de Dependencias

```bash
# Opción 1: Instalar todo el monorepo (workspaces)
npm run bootstrap

# Opción 2: Instalar proyecto específico
cd futura-tickets-admin-api
npm install
```

---

## 🐳 TERMINAL 1: INFRAESTRUCTURA

### Setup con Script Automatizado

```bash
# Desde la raíz del monorepo
./start-infra.sh
```

**¿Qué hace el script?**
1. ✅ Verifica que Docker esté instalado y corriendo
2. ✅ Detiene servicios previos si existen
3. ✅ Levanta MongoDB, Redis, MinIO, Mongo Express
4. ✅ Muestra URLs de acceso y credenciales
5. ✅ Opción de ver logs en tiempo real

### Setup Manual (alternativo)

```bash
# Levantar infraestructura
docker compose -f docker-compose.infra.yml up -d

# Ver logs
docker compose -f docker-compose.infra.yml logs -f

# Detener
docker compose -f docker-compose.infra.yml down
```

### Servicios Disponibles

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **MongoDB** | `mongodb://localhost:27017` | User: `futuraadmin`<br>Pass: `futurapass123` |
| **Redis** | `localhost:6379` | Pass: `futurapass123` |
| **MinIO Console** | http://localhost:9001 | User: `futuraadmin`<br>Pass: `futurapass123` |
| **Mongo Express** | http://localhost:8081 | User: `admin`<br>Pass: `admin123` |

### Verificar Estado

```bash
# Ver servicios corriendo
docker compose -f docker-compose.infra.yml ps

# Ver recursos
docker stats

# Conectar a MongoDB
mongosh "mongodb://futuraadmin:futurapass123@localhost:27017"

# Conectar a Redis
redis-cli -h localhost -p 6379 -a futurapass123
```

---

## 📦 DESARROLLO DE APIS

### TERMINAL 2: Admin API (Puerto 4101)

```bash
cd futura-tickets-admin-api

# Verificar .env existe
ls -la .env

# Iniciar en modo desarrollo
PORT=4101 npm run start:dev

# Logs esperados:
# [Nest] 12345  - LOG [NestFactory] Starting Nest application...
# [Nest] 12345  - LOG [InstanceLoader] AppModule dependencies initialized
# [Nest] 12345  - LOG Application is running on: http://localhost:4101
```

**Variables de entorno críticas:**
```bash
# .env
PORT=4101
MONGO_URL=mongodb://futuraadmin:futurapass123@localhost:27017/futuratickets?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=futurapass123
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production
```

### TERMINAL 3: Marketplace API (Puerto 4102)

```bash
cd futura-market-place-api

PORT=4102 npm run start:dev
```

### TERMINAL 4: Access API (Puerto 4103)

```bash
cd futura-access-api

PORT=4103 npm run start:dev
```

---

## 🎨 DESARROLLO DE FRONTENDS

### TERMINAL 5: Marketplace Frontend (Puerto 3000)

```bash
cd futura-market-place-v2

# Verificar .env.local
cat .env.local

# Variables críticas:
# NEXT_PUBLIC_FUTURA_API=http://localhost:4102
# NEXT_PUBLIC_FUTURA=http://localhost:4102

npm run dev
```

**Acceso:** http://localhost:3000

### TERMINAL 6: Admin Frontend (Puerto 3003)

```bash
cd futura-tickets-admin

# Variables críticas:
# NEXT_PUBLIC_FUTURA=http://localhost:4101
# NEXT_PUBLIC_FUTURA_API=http://localhost:4101

npm run dev
```

**Acceso:** http://localhost:3003

---

## 🛠️ TROUBLESHOOTING

### Error: "Cannot connect to MongoDB"

```bash
# Verificar que Docker esté corriendo
docker ps | grep mongo

# Ver logs de MongoDB
docker compose -f docker-compose.infra.yml logs mongodb

# Reiniciar MongoDB
docker compose -f docker-compose.infra.yml restart mongodb

# Probar conexión manual
mongosh "mongodb://futuraadmin:futurapass123@localhost:27017"
```

### Error: "Port already in use"

```bash
# Ver qué proceso usa el puerto
lsof -i :4101

# Matar proceso
kill -9 <PID>

# O cambiar puerto
PORT=4111 npm run start:dev
```

### Error: "Redis connection refused"

```bash
# Verificar Redis
docker compose -f docker-compose.infra.yml logs redis

# Reiniciar Redis
docker compose -f docker-compose.infra.yml restart redis

# Probar conexión
redis-cli -h localhost -p 6379 -a futurapass123 PING
```

### Error: "Module not found"

```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# O usar install fresco
npm ci
```

### Hot Reload no funciona

```bash
# Verificar que estás usando start:dev
npm run start:dev

# NO uses:
# npm run start  (no tiene watch mode)
```

---

## 📝 COMANDOS ÚTILES

### Infraestructura

```bash
# Reiniciar todo
docker compose -f docker-compose.infra.yml restart

# Ver logs en vivo
docker compose -f docker-compose.infra.yml logs -f

# Ver solo logs de MongoDB
docker compose -f docker-compose.infra.yml logs -f mongodb

# Limpiar todo (⚠️ borra datos)
docker compose -f docker-compose.infra.yml down -v
```

### Desarrollo

```bash
# Instalar dependencias de todo el monorepo
npm run bootstrap

# Limpiar caches
npm run clean  # (si existe script)

# Build de producción
npm run build

# Tests
npm run test
npm run test:watch
npm run test:cov
```

### Base de Datos

```bash
# Conectar a MongoDB
mongosh "mongodb://futuraadmin:futurapass123@localhost:27017/futuratickets?authSource=admin"

# Listar databases
show dbs

# Usar database
use futuratickets

# Ver colecciones
show collections

# Contar documentos
db.events.countDocuments()
```

### Redis

```bash
# Conectar
redis-cli -h localhost -p 6379 -a futurapass123

# Ver todas las keys
KEYS *

# Ver colas de Bull
KEYS bull:*

# Limpiar toda la cache
FLUSHALL
```

---

## 🔄 WORKFLOW RECOMENDADO

### Inicio de Día

```bash
# 1. Levantar infraestructura
./start-infra.sh

# 2. Levantar APIs (en terminales separadas)
cd futura-tickets-admin-api && PORT=4101 npm run start:dev &
cd futura-market-place-api && PORT=4102 npm run start:dev &
cd futura-access-api && PORT=4103 npm run start:dev &

# 3. Levantar frontends (en terminales separadas)
cd futura-market-place-v2 && npm run dev &
cd futura-tickets-admin && npm run dev &
```

### Fin de Día

```bash
# 1. Cerrar frontends y APIs (Ctrl+C en cada terminal)

# 2. Detener infraestructura
docker compose -f docker-compose.infra.yml down

# Opcional: Limpiar todo (⚠️ borra datos)
docker compose -f docker-compose.infra.yml down -v
```

---

## 🚨 IMPORTANTE: NO USAR docker-compose.yml PARA DESARROLLO

**Archivo:** `docker-compose.yml` (raíz)

❌ **NO USAR PARA DESARROLLO**
- Contiene TODAS las aplicaciones
- Build muy lento (varios minutos)
- Difícil de debuggear
- Consume muchos recursos

✅ **USAR SOLO PARA:**
- Testing de integración completa
- Demos
- CI/CD
- Deployment preview

**Comando correcto para desarrollo:**
```bash
# ✅ CORRECTO
docker compose -f docker-compose.infra.yml up

# ❌ INCORRECTO
docker compose up  # Levanta TODO, muy lento
```

---

## 📊 MAPA DE PUERTOS

| Servicio | Puerto | URL |
|----------|--------|-----|
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | localhost:6379 |
| MinIO API | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |
| Mongo Express | 8081 | http://localhost:8081 |
| **Admin API** | **4101** | http://localhost:4101 |
| **Marketplace API** | **4102** | http://localhost:4102 |
| **Access API** | **4103** | http://localhost:4103 |
| **Marketplace Web** | **3000** | http://localhost:3000 |
| **Admin Web** | **3003** | http://localhost:3003 |

---

## 💡 TIPS DE PRODUCTIVIDAD

### 1. Alias útiles

```bash
# Añadir a ~/.zshrc o ~/.bashrc
alias infra-up="docker compose -f docker-compose.infra.yml up -d"
alias infra-down="docker compose -f docker-compose.infra.yml down"
alias infra-logs="docker compose -f docker-compose.infra.yml logs -f"
alias infra-ps="docker compose -f docker-compose.infra.yml ps"
```

### 2. Tmux/iTerm2 Layouts

Guardar un layout con todas las terminales pre-configuradas

### 3. VS Code Multi-root Workspace

Crear un workspace con todos los proyectos:

```json
{
  "folders": [
    { "path": "futura-tickets-admin-api" },
    { "path": "futura-market-place-api" },
    { "path": "futura-access-api" },
    { "path": "futura-market-place-v2" },
    { "path": "futura-tickets-admin" }
  ]
}
```

---

**¿Preguntas? Revisa la documentación completa en `/docs`**

**Última actualización:** 2025-10-17
