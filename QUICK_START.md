# ⚡ FuturaTickets - Quick Start (5 minutos)

> **Última actualización:** 2025-10-17
> **Objetivo:** Stack completo corriendo en 5 minutos

---

## 🚀 OPCIONES DE INICIO

### Opción A: Inicio Automático (TODO EN UNO) ⚡

```bash
./start-all-dev.sh
```

✅ **Esto inicia TODO automáticamente**: Infraestructura + 3 APIs + 2 Frontends

**Para detener todo:**
```bash
./stop-all-dev.sh
```

---

### Opción B: Inicio Manual (CONTROL TERMINAL POR TERMINAL) 🎛️

#### Paso 1: Infraestructura (Terminal 1)

```bash
./start-infra.sh
```

✅ Levanta: MongoDB, Redis, MinIO, Mongo Express

---

#### Paso 2: Backend APIs

**Terminal 2 - Admin API:**
```bash
cd futura-tickets-admin-api
../start-admin-api.sh
```

**Terminal 3 - Marketplace API:**
```bash
cd futura-market-place-api
../start-marketplace-api.sh
```

**Terminal 4 - Access API:**
```bash
cd futura-access-api
../start-access-api.sh
```

---

#### Paso 3: Frontends

**Terminal 5 - Marketplace Web:**
```bash
cd futura-market-place-v2
../start-marketplace-web.sh
```

**Terminal 6 - Admin Web:**
```bash
cd futura-tickets-admin
../start-admin-web.sh
```

---

#### Paso 4: Verificar

```bash
./health-check.sh
```

Deberías ver:
```
✅ TODOS LOS SERVICIOS FUNCIONANDO CORRECTAMENTE
Servicios OK: 9/9
```

---

## 📊 ARQUITECTURA VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│                    TERMINAL 1: INFRAESTRUCTURA              │
├─────────────────────────────────────────────────────────────┤
│  ./start-infra.sh                                           │
│                                                             │
│  MongoDB        →  localhost:27017                          │
│  Redis          →  localhost:6379                           │
│  MinIO          →  localhost:9000, 9001                     │
│  Mongo Express  →  localhost:8081                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TERMINAL 2: ADMIN API                    │
├─────────────────────────────────────────────────────────────┤
│  cd futura-tickets-admin-api                                │
│  ../start-admin-api.sh                                      │
│                                                             │
│  Puerto: 4101                                               │
│  URL: http://localhost:4101                                 │
│  Función: CRUD eventos, analytics, cron jobs                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TERMINAL 3: MARKETPLACE API                 │
├─────────────────────────────────────────────────────────────┤
│  cd futura-market-place-api                                 │
│  ../start-marketplace-api.sh                                │
│                                                             │
│  Puerto: 4102                                               │
│  URL: http://localhost:4102                                 │
│  Función: Pagos Stripe, órdenes, emails                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   TERMINAL 4: ACCESS API                    │
├─────────────────────────────────────────────────────────────┤
│  cd futura-access-api                                       │
│  ../start-access-api.sh                                     │
│                                                             │
│  Puerto: 4103                                               │
│  URL: http://localhost:4103                                 │
│  Función: Validación tickets, check-in                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  TERMINAL 5: MARKETPLACE WEB                │
├─────────────────────────────────────────────────────────────┤
│  cd futura-market-place-v2                                  │
│  npm run dev                                                │
│                                                             │
│  Puerto: 3000                                               │
│  URL: http://localhost:3000                                 │
│  Función: Frontend compradores                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TERMINAL 6: ADMIN WEB                    │
├─────────────────────────────────────────────────────────────┤
│  cd futura-tickets-admin                                    │
│  npm run dev                                                │
│                                                             │
│  Puerto: 3003                                               │
│  URL: http://localhost:3003                                 │
│  Función: Panel administración                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ MAPA DE PUERTOS

| Puerto | Servicio | Tipo | URL | Terminal |
|--------|----------|------|-----|----------|
| **27017** | MongoDB | DB | mongodb://localhost:27017 | T1 (Docker) |
| **6379** | Redis | Cache | localhost:6379 | T1 (Docker) |
| **9000** | MinIO API | Storage | http://localhost:9000 | T1 (Docker) |
| **9001** | MinIO Console | UI | http://localhost:9001 | T1 (Docker) |
| **8081** | Mongo Express | UI | http://localhost:8081 | T1 (Docker) |
| **4101** | Admin API | Backend | http://localhost:4101 | T2 (npm) |
| **4102** | Marketplace API | Backend | http://localhost:4102 | T3 (npm) |
| **4103** | Access API | Backend | http://localhost:4103 | T4 (npm) |
| **3000** | Marketplace Web | Frontend | http://localhost:3000 | T5 (npm) |
| **3003** | Admin Web | Frontend | http://localhost:3003 | T6 (npm) |

---

## 🔑 CREDENCIALES POR DEFECTO

### MongoDB
- **URL:** `mongodb://futuraadmin:futurapass123@localhost:27017`
- **User:** `futuraadmin`
- **Pass:** `futurapass123`
- **Database:** `futuratickets`

### Redis
- **Host:** `localhost`
- **Port:** `6379`
- **Pass:** `futurapass123`

### MinIO Console
- **URL:** http://localhost:9001
- **User:** `futuraadmin`
- **Pass:** `futurapass123`

### Mongo Express
- **URL:** http://localhost:8081
- **User:** `admin`
- **Pass:** `admin123`

---

## ⚙️ SCRIPTS DISPONIBLES

### Scripts de Inicio Individual

| Script | Función | Puerto | Terminal |
|--------|---------|--------|----------|
| `start-infra.sh` | Levantar infraestructura Docker | varios | Terminal 1 |
| `start-admin-api.sh` | Iniciar Admin API | 4101 | Terminal 2 |
| `start-marketplace-api.sh` | Iniciar Marketplace API | 4102 | Terminal 3 |
| `start-access-api.sh` | Iniciar Access API | 4103 | Terminal 4 |
| `start-marketplace-web.sh` | Iniciar Marketplace Web | 3000 | Terminal 5 |
| `start-admin-web.sh` | Iniciar Admin Web | 3003 | Terminal 6 |

### Scripts de Orquestación

| Script | Función | Descripción |
|--------|---------|-------------|
| `start-all-dev.sh` | **Iniciar TODO** | Inicia todos los servicios automáticamente |
| `stop-all-dev.sh` | **Detener TODO** | Detiene todos los servicios y Docker |
| `health-check.sh` | Verificar stack | Verifica estado de todos los servicios |

---

## 🔄 FLUJO DE DATOS

```
   Cliente Web/Mobile
          │
          ├──► Marketplace Frontend (3000)
          │         │
          │         ├──► Marketplace API (4102)
          │         │         │
          │         │         ├──► Stripe (pagos)
          │         │         ├──► MongoDB (órdenes)
          │         │         └──► Email Queue
          │         │
          ├──► Admin Frontend (3003)
          │         │
          │         └──► Admin API (4101)
          │                   │
          │                   ├──► MongoDB (eventos)
          │                   ├──► Redis (cache)
          │                   └──► CronJobs
          │
          └──► Access App
                    │
                    └──► Access API (4103)
                              │
                              └──► MongoDB (validación)
```

---

## 🛠️ TROUBLESHOOTING

### Error: Puerto ocupado
```bash
# Ver qué usa el puerto
lsof -i :4101

# Matar proceso
kill -9 <PID>
```

### Error: MongoDB connection failed
```bash
# Verificar contenedor
docker ps | grep mongo

# Ver logs
docker compose -f docker-compose.infra.yml logs mongodb

# Reiniciar
docker compose -f docker-compose.infra.yml restart mongodb
```

### Error: Module not found
```bash
cd <directorio-api>
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- **DEV_SETUP.md** - Guía detallada de desarrollo
- **README.md** - Visión general del proyecto
- **docs/** - Documentación técnica por módulo

---

## 💡 TIPS

1. **Mantén Terminal 1 visible** - Logs de infraestructura
2. **Usa tmux/iTerm layouts** - Configurar layout de 6 terminales
3. **Alias útiles:**
   ```bash
   alias infra-up="./start-infra.sh"
   alias check-health="./health-check.sh"
   ```

---

**¿Todo corriendo?** Ejecuta `./health-check.sh` para verificar ✅

**¿Problemas?** Lee `DEV_SETUP.md` para troubleshooting detallado
