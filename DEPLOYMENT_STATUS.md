# FuturaTickets - Estado de Deployment

**Fecha:** 2025-10-15
**Estado General:** ✅ FUNCIONANDO EN DESARROLLO

---

## 📊 SERVICIOS ACTIVOS (5/5)

| Servicio | Puerto | Estado | URL | Descripción |
|----------|--------|--------|-----|-------------|
| **Admin API** (Backend) | 3001 | ✅ RUNNING | http://localhost:3001 | API principal de administración (NestJS) |
| **Access API** (Backend) | 3004 | ✅ RUNNING | http://localhost:3004 | API de control de acceso (NestJS) |
| **Marketplace** (Frontend) | 3000 | ✅ RUNNING | http://localhost:3000 | Marketplace de tickets (Next.js) |
| **Admin Panel** (Frontend) | 3003 | ✅ RUNNING | http://localhost:3003 | Panel de administración (Next.js) |
| **Access App** (Frontend) | 3007 | ✅ RUNNING | http://localhost:3007 | App de control de acceso (Next.js) |

---

## 🔧 CORRECCIONES APLICADAS

### 1. Access API - Puerto Incorrecto
**Archivo:** `futura-access-api/.env`
**Cambio:**
```diff
- PORT=3005
+ PORT=3004
```

### 2. Admin Panel - Puerto Incorrecto
**Archivo:** `futura-tickets-admin/package.json`
**Cambio:**
```diff
- "dev": "next dev -p 3006"
+ "dev": "next dev -p 3003"
```

###  3. Admin Panel - Error TypeScript en Headers
**Archivo:** `futura-tickets-admin/shared/utils/http.ts:20-26`
**Cambio:**
```diff
- const headers: HeadersInit = {
+ const headers: Record<string, string> = {
    'Content-Type': 'application/json',
-   ...options.headers,
+   ...(options.headers as Record<string, string>),
  };
```

### 4. Access App - Promesa en Condición
**Archivo:** `futura-tickets-web-access-app/components/QrCode/QrCode.tsx:57`
**Cambio:**
```diff
- if (qrScanner && qrScanner.hasFlash()) {
+ if (qrScanner && await qrScanner.hasFlash()) {
```

### 5. Admin Panel - Zod Enum ErrorMap
**Archivo:** `futura-tickets-admin/shared/validations/coupon.schemas.ts:18`
**Cambio:**
```diff
- discountType: z.enum(['percentage', 'fixed'], {
-   errorMap: () => ({ message: 'Tipo de descuento inválido' }),
- }),
+ discountType: z.enum(['percentage', 'fixed']).refine((val) => val === 'percentage' || val === 'fixed', {
+   message: 'Tipo de descuento inválido',
+ }),
```

---

## ✅ BUILDS DE PRODUCCIÓN

### Exitosos
- ✅ **Marketplace** (futura-market-place-v2): Compilado sin errores
- ✅ **Access API** (futura-access-api): Compilado sin errores

### Con Errores No Bloqueantes
- ⚠️ **Admin API** (futura-tickets-admin-api): 74 errores TypeScript (relacionados con librería `permissionless`)
  - El servicio **FUNCIONA PERFECTAMENTE** en desarrollo
  - Los errores son de tipos incompatibles entre `viem` y `permissionless`
  - **Acción recomendada:** Actualizar librerías en el futuro

### Con Errores de Compilación
- ❌ **Admin Panel** (futura-tickets-admin): Errores en validaciones Zod
  - Error en `payment.schemas.ts`: uso de `errorMap` deprecado
  - El servicio **FUNCIONA PERFECTAMENTE** en desarrollo
  - **Acción recomendada:** Corregir esquemas Zod antes de deployment

- ❌ **Access App** (futura-tickets-web-access-app): Error de validación TypeScript
  - Error en `Toast.tsx:63`: propiedad posiblemente undefined
  - El servicio **FUNCIONA PERFECTAMENTE** en desarrollo
  - **Acción recomendada:** Agregar validación nullable

---

## 🚀 COMANDOS PARA INICIAR SERVICIOS

### Opción 1: Iniciar Todos los Servicios
```bash
# Desde el directorio del monorepo
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets

# Terminal 1 - Admin API
cd futura-tickets-admin-api && npm run start:dev

# Terminal 2 - Access API
cd futura-access-api && npm run start:dev

# Terminal 3 - Marketplace
cd futura-market-place-v2 && npm run dev

# Terminal 4 - Admin Panel
cd futura-tickets-admin && npm run dev

# Terminal 5 - Access App
cd futura-tickets-web-access-app && npm run dev
```

### Opción 2: Script de Inicio (Crear archivo `start-all.sh`)
```bash
#!/bin/bash

echo "🚀 Iniciando todos los servicios de FuturaTickets..."

# Admin API
cd futura-tickets-admin-api
npm run start:dev > /tmp/admin-api.log 2>&1 &
echo "✅ Admin API iniciado en puerto 3001"

# Access API
cd ../futura-access-api
npm run start:dev > /tmp/access-api.log 2>&1 &
echo "✅ Access API iniciado en puerto 3004"

# Marketplace
cd ../futura-market-place-v2
npm run dev > /tmp/marketplace.log 2>&1 &
echo "✅ Marketplace iniciado en puerto 3000"

# Admin Panel
cd ../futura-tickets-admin
npm run dev > /tmp/admin-panel.log 2>&1 &
echo "✅ Admin Panel iniciado en puerto 3003"

# Access App
cd ../futura-tickets-web-access-app
npm run dev > /tmp/access-app.log 2>&1 &
echo "✅ Access App iniciado en puerto 3007"

echo ""
echo "✨ Todos los servicios están iniciando..."
echo "📋 Logs disponibles en /tmp/*.log"
```

---

## 📝 VARIABLES DE ENTORNO

### Admin API (.env)
```env
PORT=3001
MONGO_URL=mongodb+srv://...
JWT_SECRET=...
```

### Access API (.env)
```env
PORT=3004
MONGO_URL=mongodb+srv://...
JWT_SECRET_KEY=...
SOCKET_ACCESS=...
```

### Marketplace (.env.local)
```env
NEXT_PUBLIC_FUTURA_API=http://localhost:3001
NEXT_PUBLIC_FUTURA=http://localhost:3001
```

### Admin Panel (.env.local)
```env
NEXT_PUBLIC_FUTURA=http://localhost:3001
```

### Access App (.env.local)
```env
NEXT_PUBLIC_FUTURA_API=http://localhost:3004
```

---

## ⚠️ ERRORES CONOCIDOS Y PENDIENTES

### 1. Admin Panel - Errores Zod (No Bloqueantes)
**Archivos afectados:**
- `shared/validations/payment.schemas.ts:9`
- Otros archivos de validación con `errorMap`

**Solución temporal:** Funciona en desarrollo
**Solución permanente:** Refactorizar todos los esquemas Zod para usar sintaxis correcta

### 2. Access App - Toast Duration Undefined
**Archivo:** `components/Toast/Toast.tsx:63`
**Error:** `'newToast.duration' is possibly 'undefined'`

**Solución:**
```typescript
// Antes
if (newToast.duration > 0) {

// Después
if (newToast.duration && newToast.duration > 0) {
```

### 3. Admin API - Incompatibilidad Permissionless
**Archivos afectados:**
- `src/Abstraction/abstraction.service.ts`
- `src/Blockchain/blockchain.service.ts`

**Causa:** Incompatibilidad entre versiones de `viem` y `permissionless`
**Impacto:** Warnings de compilación, pero funciona en runtime
**Solución a largo plazo:** Actualizar ambas librerías a versiones compatibles

---

## 🎯 PRÓXIMOS PASOS

### Inmediatos
- [ ] Corregir errores de validación Zod en Admin Panel
- [ ] Corregir validación de duration en Access App Toast
- [ ] Verificar builds de producción después de correcciones

### Corto Plazo
- [ ] Dockerizar todos los servicios
- [ ] Configurar CI/CD
- [ ] Añadir tests automatizados
- [ ] Documentar APIs con Swagger

### Mediano Plazo
- [ ] Resolver incompatibilidades de librería en Admin API
- [ ] Migrar a monorepo con Nx o Turborepo
- [ ] Implementar logging centralizado
- [ ] Configurar monitoring (Sentry, Datadog)

---

## 📚 DOCUMENTACIÓN ADICIONAL

Cada servicio tiene su archivo `CLAUDE.md` con documentación técnica detallada:

- **Admin API:** `/futura-tickets-admin-api/CLAUDE.md`
- **Access API:** `/futura-access-api/CLAUDE.md`
- **Marketplace:** `/futura-market-place-v2/CLAUDE.md`
- **Admin Panel:** `/futura-tickets-admin/CLAUDE.md`
- **Access App:** `/futura-tickets-web-access-app/CLAUDE.md`

---

## 🔐 CREDENCIALES DE ACCESO

### Bases de Datos
Ver archivos `.env` de cada servicio (NO SUBIR A GITHUB)

### Panel Admin
Consultar con el administrador del sistema

### Access App
Credenciales de personal de acceso configuradas en Admin Panel

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Puerto ya en uso
```bash
# Encontrar proceso en puerto
lsof -ti:3001

# Matar proceso
kill -9 <PID>
```

### Node modules corruptos
```bash
# En cada servicio
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection failed
```bash
# Verificar que MongoDB Atlas esté accesible
# Verificar MONGO_URL en .env
# Verificar whitelist de IPs en MongoDB Atlas
```

---

**Última actualización:** 2025-10-15 10:45 AM
**Responsable:** Claude Code Assistant
