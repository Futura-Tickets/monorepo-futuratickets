# Errores TypeScript en Admin API

**Fecha**: 2025-10-17
**API**: futura-tickets-admin-api
**Total errores**: 14

## Resumen

Al intentar iniciar la Admin API en modo desarrollo, se detectaron 14 errores de TypeScript que impiden la compilación. Aunque el proyecto tiene configurado `ignoreBuildErrors: true`, estos errores deberían corregirse para mejorar la estabilidad del código.

## Categorías de Errores

### 1. Errores de Blockchain (SmartAccountClient) - 11 errores

**Problema**: Incompatibilidad de tipos entre la definición local de `SmartAccountClient` y la versión de `permissionless` en node_modules.

**Archivos afectados**:
- `src/Event/admin-event.service.ts` (líneas 220, 312, 333, 352, 683)
- `src/Event/user-event.service.ts` (líneas 583, 709)
- `src/Sales/sales.service.ts` (líneas 198, 229, 261, 279)

**Error principal**:
```typescript
Argument of type 'SmartAccountClient' (local) is not assignable to
parameter of type 'SmartAccountClient' (from permissionless).

Missing properties: cacheTime, chain, key, name, wallet, and 20 more.
```

**Causa raíz**:
- La interfaz `SmartAccountClient` en `src/Abstraction/abstraction.service.ts` define una propiedad `wallet: Wallet`
- La versión de `permissionless` en node_modules tiene una interfaz diferente y más completa
- Hay conflicto entre dos definiciones del mismo tipo

**Solución recomendada**:
- Usar directamente el tipo de `permissionless` sin redefinirlo
- O actualizar la versión de `permissionless` y ajustar el código
- O renombrar la interfaz local para evitar conflictos

---

### 2. Error de WebSocket (IoAdapter) - 1 error

**Archivo**: `src/main.ts:83`

**Error**:
```typescript
Argument of type 'IoAdapter' is not assignable to parameter of type
'WebSocketAdapter<any, any, any>'.

Property 'bindClientConnect' is missing in type 'IoAdapter'.
```

**Código problemático**:
```typescript
app.useWebSocketAdapter(new IoAdapter());
```

**Causa**:
- La versión de `@nestjs/platform-socket.io` o `@nestjs/common` cambió la interfaz
- `IoAdapter` ya no tiene el método `bindClientConnect` requerido

**Solución recomendada**:
- Actualizar la versión de `@nestjs/platform-socket.io`
- O implementar un adapter personalizado que incluya `bindClientConnect`
- O usar directamente Socket.IO sin adapter de NestJS

---

### 3. Errores en Sales Service - 2 errores

#### Error 3.1: Tipo de retorno incorrecto
**Archivo**: `src/Sales/sales.service.ts:158`

**Error**:
```typescript
Type 'FlattenMaps<SalesDocument> & Required<{ _id: string; }> & { __v: number; }'
is not assignable to type 'void'.
```

**Código problemático**:
```typescript
return this.salesModel.findOne(...)
```

**Causa**: Método declarado con tipo de retorno `void` pero está retornando un valor.

**Solución**: Cambiar firma del método a:
```typescript
async methodName(): Promise<Sale> {
  return this.salesModel.findOne(...);
}
```

---

#### Error 3.2: Query con enum
**Archivo**: `src/Sales/sales.service.ts:160`

**Error**:
```typescript
Type 'TicketStatus.CLOSED' is not assignable to type 'number | boolean'.
```

**Código problemático**:
```typescript
{ status: TicketStatus.CLOSED }
```

**Causa**: Mongoose está esperando un tipo primitivo pero recibe un enum de TypeScript.

**Solución**: Asegurar que el enum esté correctamente definido en el schema:
```typescript
status: {
  type: String,
  enum: Object.values(TicketStatus),
  default: TicketStatus.PENDING
}
```

---

## Estado Actual del Proyecto

### Configuración que Permite Ejecución
El proyecto tiene configurado en `tsconfig.json` o `nest-cli.json`:
```json
{
  "typescript": {
    "ignoreBuildErrors": true
  }
}
```

Esto permite que el proyecto se ejecute en producción **IGNORANDO estos errores**, lo cual **NO ES RECOMENDABLE** para un proyecto enterprise.

### Prioridades de Corrección

#### Prioridad Alta 🔴
1. **Corregir errores de Blockchain (11 errores)** - Afectan funcionalidad core
2. **Corregir error de WebSocket** - Afecta notificaciones en tiempo real

#### Prioridad Media 🟡
3. **Corregir errores en Sales Service** - Afectan gestión de tickets

#### Acción Inmediata Recomendada
```bash
# 1. Verificar versiones de dependencias
cd futura-tickets-admin-api
npm list permissionless @nestjs/platform-socket.io mongoose

# 2. Considerar actualizar dependencias
npm update permissionless @nestjs/platform-socket.io

# 3. O deshabilitar temporalmente verificación estricta
# (NO recomendado para producción)
```

---

## Impacto

### En Desarrollo
- ⚠️ Hot-reload con errores - dificulta debugging
- ⚠️ IntelliSense degradado en VS Code
- ⚠️ Posibles bugs no detectados en tiempo de desarrollo

### En Producción
- ✅ El código se ejecuta (con `ignoreBuildErrors`)
- ⚠️ Potenciales runtime errors no detectados
- ⚠️ Mantenibilidad reducida
- ⚠️ Riesgo de bugs en funcionalidades blockchain

---

## Próximos Pasos

1. ✅ **Documentar errores** (este archivo)
2. ⏳ **Crear issues en GitHub** para tracking
3. ⏳ **Investigar soluciones** para cada categoría
4. ⏳ **Implementar fixes** uno por uno
5. ⏳ **Habilitar verificación estricta** una vez corregidos

---

## Notas Adicionales

### Errores Conocidos del Proyecto
Estos errores probablemente existan desde hace tiempo, ya que el proyecto tiene configurado `ignoreBuildErrors: true`. No son nuevos, pero es importante documentarlos y planear su corrección.

### Verificación Realizada
- **Fecha**: 2025-10-17
- **Método**: `npm run start:dev` durante 5 segundos
- **Resultado**: 14 errores detectados por TypeScript compiler
- **Estado**: Documentado para posterior corrección

---

**Conclusión**: La Admin API puede ejecutarse en producción pero requiere correcciones de TypeScript para mejorar estabilidad y mantenibilidad a largo plazo.
