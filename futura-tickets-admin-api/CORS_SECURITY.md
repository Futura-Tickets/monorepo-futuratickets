# Configuración de CORS - Futura Tickets Admin API

## Resumen

Este documento describe la configuración de seguridad CORS (Cross-Origin Resource Sharing) implementada en el API de administración.

## Estado Actual

✅ **CORS correctamente configurado con whitelist específica**

## Configuración

### Ubicación
`src/main.ts` (líneas 44-62)

### Implementación

```typescript
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003'
    ];

app.enableCors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
});
```

## Orígenes Permitidos

### Desarrollo Local (`.env`)
```bash
CORS_ORIGINS=http://localhost:3001,http://localhost:3003,http://localhost:3005
```

| URL | Servicio | Puerto |
|-----|----------|--------|
| `http://localhost:3001` | Admin Panel (Next.js) | 3001 |
| `http://localhost:3003` | Marketplace Frontend | 3003 |
| `http://localhost:3005` | Access App | 3005 |

### Producción (Ejemplo)
```bash
CORS_ORIGINS=https://admin.futuratickets.com,https://marketplace.futuratickets.com,https://access.futuratickets.com
```

## Características de Seguridad

### ✅ Whitelist de Orígenes
- Solo los dominios listados en `CORS_ORIGINS` pueden hacer peticiones
- Otros dominios recibirán error CORS
- Protege contra ataques CSRF desde dominios maliciosos

### ✅ Credenciales Habilitadas
```typescript
credentials: true
```
- Permite envío de cookies HTTP
- Permite headers de autorización
- Necesario para autenticación basada en tokens

### ✅ Métodos HTTP Permitidos
```typescript
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
```
- Solo métodos RESTful estándar
- `OPTIONS` necesario para preflight requests

### ✅ Headers Permitidos
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
```
- `Content-Type` - Para JSON payloads
- `Authorization` - Para JWT tokens
- `stripe-signature` - Para webhooks de Stripe

## Configuración por Entorno

### Desarrollo Local
```bash
CORS_ORIGINS=http://localhost:3001,http://localhost:3003,http://localhost:3005
```

### Staging
```bash
CORS_ORIGINS=https://admin-staging.futuratickets.com,https://marketplace-staging.futuratickets.com,https://access-staging.futuratickets.com
```

### Producción
```bash
CORS_ORIGINS=https://admin.futuratickets.com,https://marketplace.futuratickets.com,https://access.futuratickets.com
```

## Agregar Nuevos Orígenes

### 1. Actualizar Variable de Entorno
Editar `.env`:
```bash
CORS_ORIGINS=http://localhost:3001,http://localhost:3003,http://localhost:3005,http://localhost:3007
```

### 2. Reiniciar Servicio
```bash
npm run start:dev
```

### 3. Verificar
```bash
curl -H "Origin: http://localhost:3007" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:3000/api/events
```

Debe retornar:
```
Access-Control-Allow-Origin: http://localhost:3007
Access-Control-Allow-Credentials: true
```

## Testing CORS

### Test 1: Origen Permitido
```bash
curl -H "Origin: http://localhost:3001" \
     -i http://localhost:3000/api/events
```
✅ **Esperado:** Header `Access-Control-Allow-Origin: http://localhost:3001`

### Test 2: Origen NO Permitido
```bash
curl -H "Origin: http://malicious-site.com" \
     -i http://localhost:3000/api/events
```
❌ **Esperado:** Sin header `Access-Control-Allow-Origin` (bloqueado por navegador)

### Test 3: Preflight Request
```bash
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     -i http://localhost:3000/api/events
```
✅ **Esperado:** Headers CORS completos

## Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** El origen no está en la whitelist

**Solución:**
1. Verificar `CORS_ORIGINS` en `.env`
2. Agregar el origen faltante
3. Reiniciar el servicio

### Error: "CORS policy: The value of the 'Access-Control-Allow-Credentials' header"

**Causa:** Frontend intenta enviar credenciales pero CORS no lo permite

**Solución:**
```typescript
// Ya configurado correctamente
credentials: true
```

### Error: "CORS policy: Method PUT is not allowed"

**Causa:** Método HTTP no está en la lista permitida

**Solución:**
```typescript
// Ya configurado correctamente
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
```

## Seguridad Adicional

### Recomendaciones Implementadas
- ✅ Whitelist específica (no usar `*`)
- ✅ Credenciales habilitadas solo cuando necesario
- ✅ Métodos HTTP limitados a los necesarios
- ✅ Headers permitidos limitados

### Próximos Pasos (Opcional)
- [ ] Rate limiting por origen
- [ ] Logging de peticiones CORS bloqueadas
- [ ] Alertas de intentos de acceso desde orígenes sospechosos
- [ ] CORS dinámico basado en base de datos

## Referencias

- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [NestJS - CORS](https://docs.nestjs.com/security/cors)
- [OWASP - CORS](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)

---

**Última actualización:** 2025-10-14
**Estado:** ✅ Producción Ready
