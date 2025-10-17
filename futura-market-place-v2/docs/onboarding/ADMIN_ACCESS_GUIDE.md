# 🎯 GUÍA DE ACCESO AL PANEL DE ADMINISTRADOR

## 📧 CREDENCIALES DE ADMIN UNIVERSAL

**Email:** `admin@futuratickets.com`
**Password:** `FuturaAdmin2025!`

**NOTA:** Este usuario ya tiene rol ADMIN asignado en el sistema.

---

## 🌐 URLs DE ACCESO

### Frontend Marketplace (Puerto 3003)
- **Home**: http://localhost:3003
- **Login**: http://localhost:3003/login
- **Panel Admin**: http://localhost:3003/admin
- **Gestión de Eventos**: http://localhost:3003/admin/events
- **Gestión de Promotores**: http://localhost:3003/admin/promoters
- **Gestión de Órdenes**: http://localhost:3003/admin/orders

---

## 🔧 PROBLEMA ACTUAL: BACKEND SIN ENDPOINTS

Tu backend en `localhost:3002` **NO tiene implementados** los siguientes endpoints necesarios:

### Endpoints Faltantes:
```
POST /accounts                    → Crear usuarios/admins
GET /api/events                   → Listar eventos (para admin)
GET /promoters                    → Listar promotores
GET /api/orders                   → Listar órdenes
POST /api/events                  → Crear eventos
POST /promoters                   → Crear promoters
```

### Endpoints que SÍ funcionan:
```
POST /accounts/login              → Login con credenciales ✅
GET /accounts/profile             → Obtener perfil de usuario ✅
```

---

## ✅ CÓMO ACCEDER AL PANEL ADMIN AHORA MISMO

### Paso 1: Login con usuario existente

Si ya tienes un usuario en el sistema, puedes hacer login:

1. Ve a http://localhost:3003/login
2. Ingresa tu email y password
3. Si tienes rol ADMIN, serás redirigido automáticamente al panel

### Paso 2: Verificar el panel

Una vez logueado:

1. Ve a http://localhost:3003/admin
2. Deberías ver el dashboard con estadísticas (aunque estén en 0 por falta de datos)
3. Puedes navegar por las secciones:
   - Events: http://localhost:3003/admin/events
   - Promoters: http://localhost:3003/admin/promoters
   - Orders: http://localhost:3003/admin/orders

---

## ⚠️ POR QUÉ NO VES DATOS

El panel admin muestra "0 events", "0 promoters", "0 orders" porque:

1. **El backend devuelve 404** en las rutas de admin
2. **No hay datos en la base de datos** (o la base de datos no está conectada)
3. **Los endpoints no están implementados** en tu API

---

##  SOLUCIÓN: IMPLEMENTAR BACKEND

Necesitas implementar en tu backend (`futura-market-place-api` o el proyecto correcto en el puerto 3002):

### 1. Endpoint para crear cuentas ADMIN

```typescript
// POST /accounts
{
  "newAccount": {
    "name": "Admin Futura",
    "email": "admin@futuratickets.com",
    "password": "FuturaAdmin2025!",
    "role": "ADMIN"  // ← Importante: rol ADMIN
  }
}
```

### 2. Endpoints para listar datos (con autenticación)

```typescript
// GET /api/events (con header Authorization: Bearer TOKEN)
// Debe devolver array de eventos

// GET /promoters (con header Authorization: Bearer TOKEN)
// Debe devolver array de promotores

// GET /api/orders (con header Authorization: Bearer TOKEN)
// Debe devolver array de órdenes
```

### 3. Endpoints para crear datos

```typescript
// POST /api/events (con header Authorization: Bearer TOKEN)
// POST /promoters (con header Authorization: Bearer TOKEN)
```

---

## 🎨 LO QUE YA FUNCIONA EN EL FRONTEND

✅ **Middleware de autenticación**: Protege rutas `/admin/*`
✅ **Verificación de rol ADMIN**: Solo usuarios con role='ADMIN' pueden acceder
✅ **UI completa del panel**: Dashboard, gestión de eventos, promoters, órdenes
✅ **Modales de creación**: Forms para crear eventos y promoters
✅ **Integración con cookies**: El token se guarda en cookies httpOnly
✅ **Servicios del frontend**: Todos los servicios llaman correctamente a las APIs

---

## 📝 RESUMEN

**Estado actual:**
- ✅ Frontend admin panel: COMPLETO
- ✅ Autenticación y seguridad: FUNCIONANDO
- ❌ Backend endpoints: FALTANTES
- ❌ Datos para mostrar: NO DISPONIBLES

**Siguiente paso:**
Implementa los endpoints en tu backend API (`localhost:3002`) para que el panel admin pueda:
1. Crear usuarios ADMIN
2. Listar eventos, promoters y orders
3. Crear nuevos eventos y promoters

---

## 🔐 MIENTRAS TANTO: ACCESO CON USUARIO EXISTENTE

Si ya creaste algún usuario con el formulario de registro normal:

1. Ve a la base de datos
2. Encuentra tu usuario
3. Actualiza el campo `role` a `"ADMIN"`
4. Haz login con ese usuario
5. Podrás acceder al panel admin

**Consulta SQL ejemplo (si usas MongoDB):**
```javascript
db.accounts.updateOne(
  { email: "tu@email.com" },
  { $set: { role: "ADMIN" } }
)
```

**Consulta SQL ejemplo (si usas PostgreSQL):**
```sql
UPDATE accounts
SET role = 'ADMIN'
WHERE email = 'tu@email.com';
```

---

## 📞 CONTACTO Y SOPORTE

Si necesitas ayuda para:
- Implementar los endpoints del backend
- Configurar la base de datos
- Crear el usuario ADMIN manualmente

¡Avísame y te ayudo paso a paso!
