# CREDENCIALES DE ACCESO UNIFICADO - FUTURA TICKETS

> **Fecha de creación:** 2025-10-14
> **Última actualización:** 2025-10-14
> **Estado:** Verificado y funcionando

---

## 1. CREDENCIALES PRINCIPALES

### Admin Principal (Super Admin)

```
📧 Email:    admin@futuratickets.com
🔑 Password: Admin123456
👤 Role:     ADMIN
```

**Acceso verificado:**
- ✅ Marketplace Frontend (http://localhost:3001)
- ✅ Admin Dashboard (http://localhost:3000 o puerto configurado)
- ✅ Panel de administración del marketplace (/admin)

**Funcionalidades disponibles:**
- Gestión completa de usuarios
- Gestión de eventos
- Visualización de órdenes y ventas
- Configuración de sistema
- Acceso a todos los módulos administrativos

---

## 2. ESTRUCTURA DEL SISTEMA

### URLs de Acceso

| Servicio | URL Local | Puerto | Estado |
|----------|-----------|--------|--------|
| **Marketplace Frontend** | http://localhost:3001 | 3001 | ✅ Activo |
| **Admin Dashboard** | http://localhost:3000 | 3000 | ⚠️ Configurable |
| **Marketplace API** | http://localhost:3002 | 3002 | ✅ Activo |
| **Admin API** | http://localhost:3004 | 3004 | ✅ Activo |
| **Access API** | http://localhost:3005 | 3005 | ✅ Activo |

---

## 3. VERIFICACIÓN DE ACCESO

### Logs de Verificación Exitosa (Marketplace)

**Timestamp:** 2025-10-14T16:04:39.068Z
**Resultado:** ✅ Login exitoso (200 OK)

```log
[2025-10-14T16:04:39.068Z] POST /api/auth/login-credentials
[2025-10-14T16:04:39.172Z] POST /api/auth/login-credentials - 200 (104ms)
POST /api/auth/login-credentials 200 in 281ms
GET / 200 in 8ms
GET /admin 200 in 311ms
```

**Navegación verificada:**
- `/account?tab=profile` - ✅ Perfil de usuario
- `/admin` - ✅ Panel de administración
- `/admin/promoters` - ✅ Gestión de promotores
- `/admin/events` - ✅ Gestión de eventos
- `/admin/orders` - ✅ Gestión de órdenes

---

## 4. OTRAS CUENTAS DE PRUEBA

### Cuenta de Prueba Marketplace

```
📧 Email:    marketplace-test@futuratickets.com
🔑 Password: Test123456
👤 Role:     USER
🆔 User ID:  68ee6e9f88dc62e2cded1a7d
```

**Uso:** Pruebas de compra de tickets, transferencias y reventas.

---

## 5. ARQUITECTURA DE AUTENTICACIÓN

### Sistema de Tokens JWT

**Almacenamiento:**
- Frontend almacena token en `localStorage` como `auth_token`
- Todas las peticiones API incluyen header: `Authorization: Bearer {token}`

**Validación:**
```typescript
// En API Routes
const token = request.headers.get('authorization')?.replace('Bearer ', '');
if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Validar con backend
const response = await fetch(`${API_URL}/user/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Expiración:**
- Token JWT expira según configuración del backend
- Al expirar, usuario debe hacer login nuevamente

---

## 6. FLUJO DE LOGIN

### Marketplace Frontend (http://localhost:3001/login)

```
1. Usuario ingresa email y password
   └─> POST /api/auth/login-credentials
       {
         "email": "admin@futuratickets.com",
         "password": "Admin123456"
       }

2. API Route valida credenciales
   └─> POST ${FUTURA_API}/accounts/login
       └─> Backend valida con MongoDB
       └─> Genera JWT token

3. Respuesta exitosa
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "_id": "...",
       "email": "admin@futuratickets.com",
       "name": "Admin",
       "role": "ADMIN"
     }
   }

4. Frontend guarda token
   localStorage.setItem('auth_token', token);

5. Redirección
   → Usuarios normales: /
   → Admins: /admin (opcional)
```

### Admin Dashboard

```
Similar al flujo del Marketplace, pero:
- URL de login: http://localhost:3000/login (o puerto configurado)
- Backend API: ${ADMIN_API}/auth/login
- Almacenamiento token: localStorage como 'token'
```

---

## 7. ROLES Y PERMISOS

### Jerarquía de Roles

```
ADMIN (Super Admin)
  ├─> Acceso completo a todos los módulos
  ├─> Gestión de usuarios y promotores
  ├─> Configuración de sistema
  └─> Visualización de todas las órdenes

PROMOTER
  ├─> Gestión de sus propios eventos
  ├─> Visualización de ventas de sus eventos
  ├─> Gestión de códigos promocionales
  └─> Acceso a analytics de sus eventos

USER (Cliente)
  ├─> Compra de tickets
  ├─> Visualización de sus tickets
  ├─> Transferencia de tickets
  └─> Reventa de tickets
```

### Matriz de Permisos

| Funcionalidad | ADMIN | PROMOTER | USER |
|---------------|-------|----------|------|
| Ver todos los eventos | ✅ | ❌ | ✅ |
| Crear eventos | ✅ | ✅ | ❌ |
| Editar cualquier evento | ✅ | ⚠️ Solo propios | ❌ |
| Ver todas las órdenes | ✅ | ⚠️ Solo propias | ⚠️ Solo propias |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Comprar tickets | ✅ | ✅ | ✅ |
| Revender tickets | ✅ | ✅ | ✅ |
| Configuración sistema | ✅ | ❌ | ❌ |

---

## 8. SEGURIDAD Y MEJORES PRÁCTICAS

### ⚠️ Consideraciones de Seguridad Actuales

**Estado actual:**
1. **Tokens en localStorage:** Vulnerable a ataques XSS
   - Recomendación: Migrar a httpOnly cookies

2. **Password en plaintext (en algunos emails):**
   - Archivo: `futura-market-place-api/src/Mail/mail.service.ts`
   - Recomendación: Nunca enviar passwords por email

3. **URLs hardcoded:**
   - Algunos servicios tienen URLs hardcoded
   - Recomendación: Usar variables de entorno validadas

### ✅ Mejores Prácticas Implementadas

1. **Passwords hasheados con bcrypt:**
   - Salt rounds: 10
   - Nunca se almacenan en plaintext en MongoDB

2. **JWT tokens:**
   - Firmados con secret key
   - Incluyen expiración

3. **Validación en backend:**
   - Todas las operaciones críticas validadas server-side

---

## 9. TROUBLESHOOTING

### Problema: Login retorna 401 Unauthorized

**Causas posibles:**
1. Password incorrecto
2. Cuenta no existe en MongoDB
3. Token expirado

**Solución:**
```bash
# Verificar cuenta en MongoDB
mongosh "mongodb+srv://..." --eval "db.accounts.findOne({ email: 'admin@futuratickets.com' })"

# Reset password (ver script en RESUMEN_EJECUTIVO_FINAL.md)
```

### Problema: Token inválido o expirado

**Síntomas:**
- API retorna 401 en todas las peticiones
- Usuario no puede acceder a rutas protegidas

**Solución:**
1. Hacer logout (limpia localStorage)
2. Hacer login nuevamente
3. Verificar en DevTools que token se almacena correctamente

### Problema: Admin no puede acceder a panel /admin

**Verificar:**
1. Rol en base de datos es 'ADMIN' (no 'USER')
2. Token tiene claims correctos
3. Middleware de autenticación funciona

**Revisar logs:**
```bash
# Marketplace logs
tail -f /tmp/marketplace-port3001.log

# Admin API logs
tail -f /tmp/admin-api-final.log
```

---

## 10. SCRIPTS DE UTILIDAD

### Reset Password para Admin

```javascript
// reset-admin-password.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  await mongoose.connect('mongodb+srv://...');

  const hashedPassword = await bcrypt.hash('Admin123456', 10);

  await mongoose.connection.db.collection('accounts').updateOne(
    { email: 'admin@futuratickets.com' },
    {
      $set: {
        password: hashedPassword,
        registered: true
      }
    }
  );

  console.log('✅ Password reset exitoso');
  process.exit(0);
}

resetPassword();
```

### Verificar Token JWT

```javascript
// verify-token.js
const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const secret = process.env.JWT_SECRET_KEY;

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token válido:', decoded);
} catch (err) {
  console.error('Token inválido:', err.message);
}
```

---

## 11. CONTACTO Y SOPORTE

Para reset de passwords, problemas de acceso o dudas sobre las credenciales:

**Email:** soporte@futuratickets.com
**Documentación técnica:** Ver `ARQUITECTURA_SISTEMA_COMPLETO.md`
**Guía de despliegue:** Ver `GUIA_DESPLIEGUE_COMPLETA.md`

---

## ANEXO: RESUMEN DE VERIFICACIÓN

**Fecha de verificación:** 2025-10-14
**Credenciales verificadas:**
- ✅ admin@futuratickets.com / Admin123456 (ADMIN)
- ✅ marketplace-test@futuratickets.com / Test123456 (USER)

**Servicios verificados:**
- ✅ Marketplace Frontend (puerto 3001)
- ✅ Marketplace API (puerto 3002)
- ✅ Login credentials endpoint
- ✅ Panel de administración (/admin)
- ✅ Perfil de usuario (/account)

**Funcionalidades probadas:**
- ✅ Login con credenciales
- ✅ Navegación a panel admin
- ✅ Visualización de promotores
- ✅ Acceso a gestión de eventos
- ✅ Acceso a gestión de órdenes

**Estado final:** ✅ Sistema completamente operativo con credenciales unificadas

---

**FIN DEL DOCUMENTO**
