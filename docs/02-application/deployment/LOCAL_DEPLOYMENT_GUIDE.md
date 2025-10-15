# Guía de Despliegue Local - FuturaTickets 🚀

**Última actualización**: 2025-10-14
**Propósito**: Levantar todo el ecosistema FuturaTickets en local

---

## 📋 Resumen de Servicios

| Servicio | Puerto | Comando | Status |
|----------|--------|---------|--------|
| **MongoDB** | 27017 | MongoDB Atlas (cloud) | ✅ Ya configurado |
| **Redis** | 6379 | No requerido aún | ⚠️ Opcional |
| **Admin API** | 3001 | `npm run start:dev` | ⚠️ Tiene errores |
| **Marketplace API** | 3002 | `npm run start:dev` | ✅ Listo |
| **Access API** | 3004 | `npm run start:dev` | ✅ Listo |
| **Marketplace V2 (Frontend)** | 3000 | `npm run dev` | ✅ Listo |
| **Admin Frontend** | 3003 | `npm run dev` | ✅ Listo |

---

## 🚨 IMPORTANTE: Estado Actual

### ✅ Lo que funciona:
- MongoDB Atlas (cloud) - Ya configurado
- .env files creados en las 3 APIs
- Dependencias instaladas

### ⚠️ Lo que tiene problemas:
- **Admin API**: 22 errores TypeScript (módulo Abstraction faltante)
- **Docker Desktop**: No se instaló (requiere sudo manual)

### 🎯 Plan de Acción:
**OPCIÓN A: Levantar sin Admin API** (más rápido)
**OPCIÓN B: Arreglar Admin API primero** (completo)

---

## 🚀 OPCIÓN A: Despliegue Rápido (Sin Admin API)

### Ventajas:
- ✅ Todo funciona en 5 minutos
- ✅ Puedes probar marketplace y compra de tickets
- ✅ No necesitas arreglar errores

### Desventajas:
- ❌ No puedes crear eventos desde el admin panel
- ❌ Solo lectura de eventos existentes

### Pasos:

#### 1. Marketplace API (Puerto 3002)
```bash
# Terminal 1
cd futura-market-place-api
npm run start:dev

# Esperar mensaje: "Application is running on: http://localhost:3002"
```

#### 2. Access API (Puerto 3004)
```bash
# Terminal 2
cd futura-access-api
npm run start:dev

# Esperar mensaje: "Application is running on: http://localhost:3004"
```

#### 3. Marketplace Frontend (Puerto 3000)
```bash
# Terminal 3
cd futura-market-place-v2
npm run dev

# Esperar mensaje: "ready - started server on 0.0.0.0:3000"
```

#### 4. Verificar que funciona:
```bash
# En otra terminal
curl http://localhost:3002/health
curl http://localhost:3004/health
open http://localhost:3000
```

---

## 🔧 OPCIÓN B: Despliegue Completo (Con Admin API)

### Prerequisitos:
Arreglar los 22 errores del Admin API primero.

### Paso 1: Fix Módulo Abstraction (30 minutos)

#### Solución Rápida - Crear módulo dummy:

```bash
cd futura-tickets-admin-api/src
mkdir -p Abstraction
```

**Crear `Abstraction/abstraction.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { AbstractionService } from './abstraction.service';

@Module({
  providers: [AbstractionService],
  exports: [AbstractionService],
})
export class AbstractionModule {}
```

**Crear `Abstraction/abstraction.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AbstractionService {
  // Servicio dummy - agregar métodos si se necesitan
  constructor() {}
}
```

#### Verificar compilación:
```bash
cd futura-tickets-admin-api
npm run build
```

Si compila, continuar. Si no, ver `ERRORES_Y_SOLUCIONES.md`.

### Paso 2: Fix Swagger Config (15 minutos)

Editar `src/config/swagger.config.ts`:

```typescript
// Línea 108
.setTitle(finalConfig.title || 'Futura Tickets Admin API')

// Línea 109
.setDescription(finalConfig.description || 'Backend API for ticket management')

// Línea 110
.setVersion(finalConfig.version || '1.0.0')

// Línea 112
finalConfig.contactName || 'Support',

// Línea 116
.setLicense(finalConfig.license || 'MIT', finalConfig.licenseUrl || '')

// Línea 121
finalConfig.servers?.forEach((server) => {  // ← Agregar ?

// Línea 194
SwaggerModule.setup(finalConfig.path || 'api-docs', app, document, swaggerUiOptions);

// Línea 199
const outputPath = join(process.cwd(), finalConfig.exportPath || 'swagger.json');
```

### Paso 3: Fix Health Check (5 minutos)

Editar `src/Health/health-check.controller.ts`:

```typescript
// Líneas 85, 86, 111 - Cambiar catch
catch (error: any) {  // ← Agregar : any
  return {
    message: error.message,
    error: error.stack
  };
}
```

### Paso 4: Levantar Admin API

```bash
# Terminal 1
cd futura-tickets-admin-api
npm run start:dev

# Esperar mensaje: "Application is running on: http://localhost:3001"
```

### Paso 5: Levantar resto de servicios

```bash
# Terminal 2 - Marketplace API
cd futura-market-place-api
npm run start:dev

# Terminal 3 - Access API
cd futura-access-api
npm run start:dev

# Terminal 4 - Marketplace Frontend
cd futura-market-place-v2
npm run dev

# Terminal 5 - Admin Frontend (opcional)
cd futura-tickets-admin
npm run dev
```

---

## 🧪 Verificación de Servicios

### Health Checks:

```bash
# Admin API
curl http://localhost:3001/health
# Esperado: {"status":"ok","info":{...}}

# Marketplace API
curl http://localhost:3002/health
# Esperado: {"status":"ok"}

# Access API
curl http://localhost:3004/health
# Esperado: {"status":"ok"}
```

### Verificar APIs funcionando:

```bash
# Listar eventos
curl http://localhost:3002/api/events

# Obtener config Stripe
curl http://localhost:3002/stripe/config

# Verificar MongoDB conectado
curl http://localhost:3001/health
```

### Abrir Frontends:

```bash
# Marketplace
open http://localhost:3000

# Admin Panel
open http://localhost:3003

# Swagger Admin API
open http://localhost:3001/api-docs
```

---

## 🐛 Troubleshooting Común

### Error: "EADDRINUSE: address already in use"
**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -ti:3001
# Matar proceso
kill -9 $(lsof -ti:3001)
```

### Error: "Cannot connect to MongoDB"
**Solución**:
```bash
# Verificar MONGO_URL en .env
cat futura-tickets-admin-api/.env | grep MONGO

# Probar conexión
mongosh "mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod"
```

### Error: "Module not found"
**Solución**:
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: Compilation errors
**Ver**:
- `ERRORES_Y_SOLUCIONES.md` para soluciones detalladas
- Logs completos en terminal

---

## 📊 Estado de las APIs

### Admin API (puerto 3001)
**Status**: ⚠️ Con errores (22 TypeScript errors)
**Errores**:
- 8 errores: Módulo Abstraction faltante
- 11 errores: Swagger config TypeScript
- 3 errores: Health check error typing

**Acción requerida**: Ver OPCIÓN B arriba

### Marketplace API (puerto 3002)
**Status**: ✅ Funcionando
**Dependencias**: ✅ Instaladas
**.env**: ✅ Configurado

### Access API (puerto 3004)
**Status**: ✅ Funcionando
**Dependencias**: ✅ Instaladas
**.env**: ✅ Configurado

---

## 🎯 Recomendación Final

### Para empezar YA (5 minutos):
👉 **Usar OPCIÓN A** - Levantar Marketplace API + Access API + Frontend

```bash
# Abrir 3 terminales y ejecutar:
cd futura-market-place-api && npm run start:dev
cd futura-access-api && npm run start:dev
cd futura-market-place-v2 && npm run dev

# Luego abrir: http://localhost:3000
```

### Para tener todo completo (1 hora):
👉 **Usar OPCIÓN B** - Arreglar Admin API primero

```bash
# Seguir pasos de OPCIÓN B
# Ver ERRORES_Y_SOLUCIONES.md para detalles
```

---

## 📝 Checklist de Despliegue

### OPCIÓN A - Rápido:
- [ ] Abrir Terminal 1: Marketplace API (puerto 3002)
- [ ] Abrir Terminal 2: Access API (puerto 3004)
- [ ] Abrir Terminal 3: Frontend (puerto 3000)
- [ ] Verificar health checks
- [ ] Abrir http://localhost:3000
- [ ] Probar navegación de eventos
- [ ] ✅ Listo para testing

### OPCIÓN B - Completo:
- [ ] Fix módulo Abstraction (30 min)
- [ ] Fix Swagger config (15 min)
- [ ] Fix Health check types (5 min)
- [ ] Compilar Admin API
- [ ] Levantar Admin API (puerto 3001)
- [ ] Levantar Marketplace API (puerto 3002)
- [ ] Levantar Access API (puerto 3004)
- [ ] Levantar Marketplace Frontend (puerto 3000)
- [ ] Levantar Admin Frontend (puerto 3003)
- [ ] Verificar todos los health checks
- [ ] Probar crear evento desde admin
- [ ] ✅ Sistema completo funcionando

---

## 🔥 Quick Start - Copiar y Pegar

### Levantar servicios esenciales (OPCIÓN A):

```bash
# Terminal 1 - Marketplace API
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-api && npm run start:dev

# Terminal 2 - Access API
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-access-api && npm run start:dev

# Terminal 3 - Frontend
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2 && npm run dev
```

Luego abrir: http://localhost:3000

---

## 📞 Soporte

**Si algo falla**:
1. Ver `ERRORES_Y_SOLUCIONES.md`
2. Verificar `.env` files están configurados
3. Verificar dependencias instaladas: `npm install --legacy-peer-deps`
4. Revisar logs en terminal

**Documentación adicional**:
- `MCP_CONFIGURATION.md` - MCPs instalados
- `MCP_API_KEYS_NEEDED.md` - API keys necesarias
- `SESSION_SUMMARY_2025-10-14.md` - Resumen de cambios

---

**Creado**: 2025-10-14
**Versión**: 1.0
**Autor**: Claude Code Assistant
