# Scripts Reference - FuturaTickets

> Documentación completa de los 16 scripts de utilidad del monorepo

**Última actualización**: 2025-10-17

---

## 📑 Índice

1. [Verificación y Testing](#verificación-y-testing)
2. [Build y Deployment](#build-y-deployment)
3. [Development Tools](#development-tools)
4. [Database Management](#database-management)
5. [Monitoring y Performance](#monitoring-y-performance)
6. [Maintenance](#maintenance)

---

## Verificación y Testing

### 1. check-env-vars.sh

**Propósito**: Verificar que variables de entorno críticas estén configuradas

```bash
./scripts/utilities/check-env-vars.sh
```

**Chequea**:
- ✅ MONGO_URL
- ✅ JWT_SECRET
- ✅ STRIPE_KEY (donde aplique)
- ✅ PORT

**Output**:
```
🔍 Admin API
  ✅ .env existe
  ✅ MONGO_URL configurado
  ✅ JWT_SECRET configurado
  ✅ STRIPE_KEY configurado
  ✅ PORT configurado
```

**Servicios verificados**:
- futura-tickets-admin-api
- futura-market-place-api
- futura-access-api

---

### 2. smoke-tests.sh

**Propósito**: Tests de humo de 10 endpoints críticos

```bash
./scripts/utilities/smoke-tests.sh
```

**Endpoints testeados**:
1. Admin API /health (3002)
2. Marketplace API (3004)
3. Access API /health (3005)
4. Access API /health/ready (3005)
5. Access API /health/info (3005)
6. Marketplace Web (3000)
7. Admin Panel (3001)
8. Access Web (3007)
9. Admin API Swagger /api/docs (3002)
10. Access API Swagger /api/docs (3005)

**Output**:
```
✓ Admin API /health: HTTP 200
✓ Marketplace Web: HTTP 200
...
Passed: 9 | Failed: 1
```

**Uso**: Ejecutar después de arrancar servicios para verificar que todo funciona.

---

### 3. test-all.sh

**Propósito**: Ejecutar tests unitarios en todos los servicios backend

```bash
./scripts/utilities/test-all.sh
```

**Funcionalidad**:
- Itera sobre 3 APIs backend
- Ejecuta `npm test` en cada una
- Cuenta passed/failed

**Output**:
```
Testing futura-tickets-admin-api...
✓ futura-tickets-admin-api tests passed

Testing futura-market-place-api...
✓ futura-market-place-api tests passed

====== SUMMARY ======
Passed: 3
Failed: 0
```

**Exit codes**:
- 0: Todos los tests pasaron
- 1: Al menos un test falló

---

### 4. performance-test.sh

**Propósito**: Tests básicos de rendimiento de endpoints

```bash
./scripts/utilities/performance-test.sh
```

**Funcionalidad**:
- Mide tiempo de respuesta con `curl`
- Testa 5 endpoints principales

**Output**:
```
Admin API Health: 0.045s
Marketplace API: 0.123s
Access API Health: 0.038s
Marketplace Web: 0.234s
Admin Panel: 0.189s

Tip: Use Apache Bench for load testing:
  ab -n 1000 -c 10 http://localhost:3000/
```

**Uso**: Detectar degradación de performance.

---

## Build y Deployment

### 5. build-all.sh

**Propósito**: Compilar todos los servicios

```bash
./scripts/utilities/build-all.sh
```

**Servicios compilados**:
- 3 APIs backend (NestJS)
- 3 Frontends (Next.js)

**Output**:
```
Building futura-tickets-admin-api...
✓ Built

Building futura-market-place-v2...
✓ Built

====== BUILD COMPLETE ======
```

**Uso**: Antes de deployment o para verificar que todo compila.

---

### 6. docker-build-all.sh

**Propósito**: Build de Docker images de todos los servicios

```bash
./scripts/utilities/docker-build-all.sh
```

**Funcionalidad**:
- Busca Dockerfile en cada servicio
- Ejecuta `docker build -t service:latest`
- Lista imágenes creadas

**Output**:
```
Building Docker image: futura-tickets-admin-api
✓
Building Docker image: futura-market-place-api
✓

====== DOCKER BUILD COMPLETE ======
REPOSITORY                      TAG       SIZE
futura-tickets-admin-api        latest    450MB
futura-market-place-api         latest    420MB
futura-access-api               latest    400MB
```

**Requisitos**: Docker instalado

---

### 7. lint-all.sh

**Propósito**: Ejecutar linters en todos los servicios

```bash
./scripts/utilities/lint-all.sh
```

**Funcionalidad**:
- Ejecuta `npm run lint` en cada servicio
- Detecta issues de code style

**Output**:
```
Linting futura-tickets-admin-api...
✓ No issues found

Linting futura-market-place-api...
⚠️  3 warnings

====== LINT COMPLETE ======
```

**Uso**: Antes de commits o en CI/CD.

---

## Development Tools

### 8. setup-dev-environment.sh

**Propósito**: Setup automático completo para nuevos developers

```bash
./scripts/utilities/setup-dev-environment.sh
```

**Funcionalidad**:
1. Verifica Node.js, npm, MongoDB, Docker
2. Instala dependencias en 6 servicios
3. Chequea archivos .env

**Output**:
```
✓ Node.js v20.0.0 installed
✓ npm 9.0.0 installed

Installing Admin API dependencies...
✓ Admin API ready

Checking .env files...
✓ futura-tickets-admin-api/.env exists

====== Setup Complete ======
Next steps:
1. Configure .env files
2. Start services: ./start-all.sh
```

**Uso**: Primera vez que clonas el repo.

---

### 9. check-dependencies.sh

**Propósito**: Verificar versiones de dependencias

```bash
./scripts/utilities/check-dependencies.sh
```

**Chequea**:
- Node.js version
- npm version
- Docker version
- MongoDB Shell version
- `npm outdated` en cada servicio

**Output**:
```
====== DEPENDENCY VERSIONS ======
Node.js: v20.0.0
npm: 9.0.0
Docker: 24.0.0
MongoDB Shell: 2.0.0

====== NPM OUTDATED (Backend APIs) ======
futura-tickets-admin-api:
Package    Current  Wanted  Latest
mongoose   8.4.3    8.4.5   8.5.0
```

**Uso**: Antes de actualizar dependencias.

---

### 10. update-all-dependencies.sh

**Propósito**: Actualizar dependencias en todos los servicios

```bash
./scripts/utilities/update-all-dependencies.sh
```

**Funcionalidad**:
- Pide confirmación (destructivo)
- Ejecuta `npm update` en 6 servicios
- Usa `--legacy-peer-deps`

**Output**:
```
⚠️  WARNING: This will update dependencies in all services
Continue? (y/n) y

Updating futura-tickets-admin-api...
✓ Updated

====== UPDATE COMPLETE ======
Tip: Test all services after update
```

**⚠️ Cuidado**: Puede romper compatibilidad. Testear después.

---

### 11. generate-env-templates.sh

**Propósito**: Generar `.env.example` de archivos `.env` existentes

```bash
./scripts/utilities/generate-env-templates.sh
```

**Funcionalidad**:
- Encuentra todos los `.env`
- Crea `.env.example` con solo keys (sin values)
- Usa `sed` para remover valores

**Output**:
```
Processing ./futura-tickets-admin-api/.env
✓ Created ./futura-tickets-admin-api/.env.example

Processing ./futura-market-place-api/.env
✓ Created ./futura-market-place-api/.env.example
```

**Uso**: Cuando agregas nuevas variables de entorno.

---

### 12. check-ports.sh

**Propósito**: Verificar qué puertos están en uso

```bash
./scripts/utilities/check-ports.sh
```

**Puertos chequeados**:
- 3000 (Marketplace Web)
- 3001 (Admin Panel)
- 3002 (Admin API)
- 3004 (Marketplace API)
- 3005 (Access API)
- 3007 (Access Web)
- 8545 (Ganache)

**Output**:
```
====== PORT STATUS ======
✓ Port 3000 (Marketplace Web) - PID 12345
✗ Port 3001 (Admin Panel) - FREE
✓ Port 3002 (Admin API) - PID 12347

Tip: Kill process with: kill $(lsof -ti:PORT)
```

**Uso**: Debugging de conflictos de puertos.

---

## Database Management

### 13. reset-database.sh

**Propósito**: Reset de base de datos de desarrollo

```bash
./scripts/utilities/reset-database.sh
```

**Funcionalidad**:
- Pide confirmación (tipo "RESET")
- Conecta a MongoDB
- Ejecuta `db.dropDatabase()`

**Output**:
```
⚠️  WARNING: This will DELETE all data in development database
Only use for local development!

Type 'RESET' to confirm: RESET

Connecting to MongoDB...
✓ Database reset complete
Tip: Re-seed database with test data
```

**⚠️ PELIGRO**: Solo para desarrollo. Borra TODO.

---

### 14. seed-database.sh

**Propósito**: Populate base de datos con datos de prueba

```bash
./scripts/utilities/seed-database.sh
```

**Funcionalidad**:
- Busca `seeds/seed.js` en cada servicio
- Ejecuta script de seeding
- Crea eventos, usuarios, tickets de prueba

**Output**:
```
====== DATABASE SEEDING ======
Seeding futura-tickets-admin-api...
✓ Seeded

No seed script for futura-market-place-api

====== SEEDING COMPLETE ======
Tip: Create seeds/seed.js in each service
```

**Requisitos**: Crear scripts de seed en cada servicio.

---

## Monitoring y Performance

### 15. continuous-health-check.sh

**Propósito**: Monitoreo continuo 24/7 de servicios

```bash
# Default: check cada 30 segundos
./scripts/utilities/continuous-health-check.sh

# Custom interval: cada 10 segundos
./scripts/utilities/continuous-health-check.sh 10
```

**Funcionalidad**:
- Loop infinito con `sleep $INTERVAL`
- Chequea 7 servicios cada iteración
- Timestamp en cada check
- Ctrl+C para detener

**Output**:
```
Health Check - 2025-10-17 19:00:00

[19:00:00] ✓ Admin API (port 3002) - UP (HTTP 200)
[19:00:00] ✓ Marketplace API (port 3004) - UP (HTTP 200)
[19:00:00] ✗ Access API (port 3005) - DOWN

Next check in 30s...
```

**Uso**: Dejarlo corriendo en terminal separada mientras desarrollas.

---

### 16. monitor-logs.sh

**Propósito**: Tail de logs en tiempo real

```bash
./scripts/utilities/monitor-logs.sh
```

**Funcionalidad**:
- Busca directorio `/logs`
- Ejecuta `tail -f` en todos los `.log`
- Fallback a PM2 logs si existe

**Output**:
```
====== LOG MONITOR (Ctrl+C to stop) ======

[Admin API] 2025-10-17 19:00:00 INFO: Server started
[Marketplace API] 2025-10-17 19:00:01 INFO: Connected to MongoDB
[Access API] 2025-10-17 19:00:02 WARN: High memory usage
```

**Uso**: Debugging en tiempo real.

---

## Maintenance

### 17. cleanup-processes.sh

**Propósito**: Limpiar procesos zombies de scripts start-all

```bash
./scripts/utilities/cleanup-processes.sh
```

**Funcionalidad**:
- Detecta procesos `start-all` y `check-all`
- Lista PIDs encontrados
- Pide confirmación (y/n)
- Mata procesos con `kill`

**Output**:
```
CLEANUP DUPLICATE PROCESSES

Found processes:
  PID 12345: start-all-frontends.sh
  PID 12346: start-all-backends.sh

Found 2 processes

Kill these? (y/n) y
✓ Killed 12345
✓ Killed 12346

Cleanup complete
```

**Uso**: Cuando hay múltiples instancias corriendo.

---

### 18. backup-env-files.sh

**Propósito**: Backup encriptado de archivos .env

```bash
# Sin encriptación
./scripts/utilities/backup-env-files.sh

# Con encriptación AES-256
./scripts/utilities/backup-env-files.sh mi_password_secreto
```

**Funcionalidad**:
- Encuentra todos los `.env` (excluye node_modules)
- Crea `tar.gz` con timestamp
- Encripta con `openssl` (opcional)
- Guarda en `.env-backups/`

**Output**:
```
====== ENV FILES BACKUP ======
Finding .env files...
Found 3 .env files:
  ./futura-tickets-admin-api/.env
  ./futura-market-place-api/.env
  ./futura-access-api/.env

Creating backup...
✓ Backup created: .env-backups/env-backup-20251017_190000.tar.gz (2.3K)

Encrypting backup with password...
✓ Encrypted backup: .env-backups/env-backup-20251017_190000.tar.gz.enc

====== Backup Complete ======
Backup location: .env-backups/env-backup-20251017_190000.tar.gz.enc

To restore:
  1. Decrypt: openssl enc -aes-256-cbc -d -pbkdf2 -in file.tar.gz.enc -out backup.tar.gz -k PASSWORD
  2. Extract: tar -xzf backup.tar.gz

⚠️  IMPORTANT: Store this backup securely!
```

**Uso**: Antes de cambios mayores o rotación de secrets.

---

### 19. analyze-bundle-size.sh

**Propósito**: Analizar tamaño de bundles de Next.js

```bash
./scripts/utilities/analyze-bundle-size.sh
```

**Funcionalidad**:
- Chequea carpeta `.next/` en cada frontend
- Muestra tamaño total y de `/static`

**Output**:
```
====== BUNDLE SIZE ANALYSIS ======

futura-market-place-v2:
  Total: 45M
  Static: 12M

futura-tickets-admin:
  Total: 38M
  Static: 9M

Tip: Run 'npm run build' first in each frontend
```

**Uso**: Optimización de performance.

---

## Convenciones

### Permisos de Ejecución

Todos los scripts deben tener permisos de ejecución:
```bash
chmod +x scripts/utilities/*.sh
```

### Exit Codes

- `0`: Success
- `1`: Error general
- `2`: User cancelled

### Colores

Los scripts usan códigos ANSI:
- 🟢 Verde (`\033[0;32m`): Success, UP
- 🔴 Rojo (`\033[0;31m`): Error, DOWN
- 🟡 Amarillo (`\033[1;33m`): Warning, Info
- 🔵 Azul (`\033[0;34m`): Headers

---

## Uso en CI/CD

### GitHub Actions

Integrar scripts en workflows:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/utilities/check-env-vars.sh || true
      - run: ./scripts/utilities/test-all.sh
      - run: ./scripts/utilities/build-all.sh
```

### Pre-commit Hooks

Ejecutar automáticamente:

```bash
# .husky/pre-commit
./scripts/utilities/lint-all.sh
```

---

## Troubleshooting

**Script no ejecuta**:
```bash
chmod +x scripts/utilities/nombre-script.sh
```

**Script no encuentra servicios**:
```bash
# Ejecutar desde root del monorepo
cd /path/to/monorepo-futuratickets
./scripts/utilities/nombre-script.sh
```

**Errores de permisos**:
```bash
# Algunos scripts requieren sudo
sudo ./scripts/utilities/nombre-script.sh
```

---

## Contribuir

Para agregar un nuevo script:

1. Crear en `/scripts/utilities/`
2. Agregar shebang `#!/bin/bash`
3. Usar colores para output
4. Documentar en este README
5. `chmod +x script.sh`
6. Testear desde root del monorepo

---

**Total de scripts**: 16  
**Mantenimiento**: DevOps Team  
**Última actualización**: 2025-10-17
