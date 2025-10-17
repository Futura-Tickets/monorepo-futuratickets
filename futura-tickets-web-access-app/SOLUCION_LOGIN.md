# ⚠️ SOLUCIÓN AL PROBLEMA DE LOGIN

## 🔴 PROBLEMA IDENTIFICADO

El login de la Access App **NO FUNCIONA** con las credenciales de admin porque:

1. **La cuenta `admin@futuratickets.com` tiene rol `ADMIN`**
2. **El Access API solo acepta cuentas con rol `ACCESS`**
3. **No existen cuentas ACCESS creadas actualmente**

## 📋 CÓDIGO QUE CAUSA EL PROBLEMA

En `/futura-access-api/src/Account/account.service.ts` línea 77:

```typescript
public async getAccessAccountByEmail(accountEmail: string): Promise<Account | null> {
  return await this.accountModel
    .findOne<Account>({ email: accountEmail, role: Roles.ACCESS })  // ← Solo busca role: ACCESS
    .populate({
      path: 'promoter',
      model: 'Promoter',
      select: { name: 1, createdAt: 1 },
    })
    .populate({
      path: 'accessEvent',
      model: 'Event',
      select: { name: 1, createdAt: 1 },
    });
}
```

**Resultado:** Cuando intentas login con `admin@futuratickets.com`, el sistema busca una cuenta con ese email **Y** rol ACCESS, pero esa cuenta tiene rol ADMIN, por lo que retorna `null` y lanza "Error Login In!".

---

## ✅ SOLUCIONES DISPONIBLES

### Opción 1: Crear una Cuenta ACCESS desde Admin Panel (RECOMENDADO)

**Pasos:**

1. **Abrir Admin Panel:**
   ```
   http://localhost:3006
   ```

2. **Login como Admin:**
   - Email: `admin@futuratickets.com`
   - Password: `Admin123456`

3. **Ir a la sección de Eventos**

4. **Seleccionar un evento**

5. **Crear Personal de Acceso:**
   - Click en "Crear Personal de Acceso" o similar
   - Llenar formulario:
     - Nombre: `Test`
     - Apellido: `Access`
     - Email: `access@futuratickets.com`
     - Password: `Access123456`
     - Evento asignado: Seleccionar el evento

6. **Guardar**

7. **Ahora podrás hacer login en Access App con:**
   ```
   Email: access@futuratickets.com
   Password: Access123456
   ```

---

### Opción 2: Crear Cuenta ACCESS Directamente en MongoDB

**Usando Compass o mongosh:**

```javascript
// Conectar a MongoDB
mongosh "mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod"

// Buscar un evento existente
db.events.findOne({}, { _id: 1, name: 1, promoter: 1 })

// Crear cuenta ACCESS
db.accounts.insertOne({
  name: "Test",
  lastName: "Access",
  email: "access@futuratickets.com",
  password: "$2a$10$X4kW7Z.QY5xH3Kq.W8HxNuFvH5Xz6Kq.W8HxNuFvH5Xz6Kq.W8HxN", // Bcrypt de "Access123456"
  role: "ACCESS",
  promoter: ObjectId("promoter_id_aqui"),  // Del evento
  accessEvent: ObjectId("event_id_aqui"),   // ID del evento
  accessPass: "Access123456",
  address: "0x0000000000000000000000000000000000000000",
  registered: true,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Nota:** El hash de password mostrado arriba NO es válido, necesitas generar uno real con bcrypt.

---

### Opción 3: Modificar el Código para Aceptar ADMIN (TEMPORAL)

**⚠️ NO RECOMENDADO para producción**

Editar `/futura-access-api/src/Account/account.service.ts`:

```typescript
public async getAccessAccountByEmail(accountEmail: string): Promise<Account | null> {
  return await this.accountModel
    .findOne<Account>({
      email: accountEmail,
      $or: [{ role: Roles.ACCESS }, { role: Roles.ADMIN }]  // ← Permitir ADMIN también
    })
    .populate({
      path: 'promoter',
      model: 'Promoter',
      select: { name: 1, createdAt: 1 },
    })
    .populate({
      path: 'accessEvent',
      model: 'Event',
      select: { name: 1, createdAt: 1 },
    });
}
```

**Después reiniciar Access API:**
```bash
# Matar proceso actual
pkill -f "nest.*3005"

# Reiniciar
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-access-api
npm run start:dev
```

**Problema con esta opción:**
- Los ADMIN no tienen `accessEvent` asignado, por lo que romperá otras funcionalidades
- No es la forma correcta de usar el sistema

---

### Opción 4: Script para Generar Hash de Password

**Crear archivo `generate-password-hash.js`:**

```javascript
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'Access123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash();
```

**Ejecutar:**
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-access-api
node generate-password-hash.js
```

---

## 🎯 RECOMENDACIÓN FINAL

**La mejor solución es la Opción 1:** Crear una cuenta ACCESS desde el Admin Panel.

### ¿Por qué?

1. ✅ Es el flujo correcto del sistema
2. ✅ La cuenta queda correctamente vinculada a un evento
3. ✅ El promoter se asigna automáticamente
4. ✅ Todas las funcionalidades funcionarán correctamente
5. ✅ No requiere modificar código ni base de datos manualmente

### Pasos Rápidos:

1. Abrir `http://localhost:3006`
2. Login con `admin@futuratickets.com` / `Admin123456`
3. Ir a Eventos → Seleccionar evento → Crear Personal de Acceso
4. Crear cuenta:
   - Email: `access@futuratickets.com`
   - Password: `Access123456`
5. Usar esas credenciales en Access App

---

## 📝 ACTUALIZACIÓN DE DOCUMENTACIÓN

El archivo `CREDENCIALES_ACCESS_APP.md` necesita ser actualizado con:

**CREDENCIALES CORRECTAS:**
```
📧 Email:    access@futuratickets.com
🔑 Password: Access123456
👤 Rol:      ACCESS
```

**NO FUNCIONA:**
```
❌ Email:    admin@futuratickets.com
❌ Password: Admin123456
❌ Rol:      ADMIN (no es ACCESS)
```

---

## 🔍 DEBUGGING

### Verificar si una cuenta ACCESS existe:

```bash
# Curl directo al API
curl -X POST http://localhost:3005/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"access@futuratickets.com","password":"Access123456"}'
```

**Respuesta exitosa:**
```json
{
  "_id": "...",
  "name": "Test",
  "lastName": "Access",
  "email": "access@futuratickets.com",
  "role": "ACCESS",
  "accessEvent": {
    "_id": "...",
    "name": "Nombre del Evento"
  },
  "promoter": {
    "_id": "...",
    "name": "Promotora"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta con error (cuenta no existe):**
```json
{
  "message": "Error Login In!",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## 📞 CONTACTO

Si ninguna opción funciona:
1. Verificar que el Admin Panel está corriendo (puerto 3006)
2. Verificar que existe al menos un evento en el sistema
3. Revisar logs del Access API: `/tmp/access-api.log`
4. Verificar conexión a MongoDB

---

**Última actualización:** 2025-10-14
**Estado:** ⚠️ Problema identificado y soluciones documentadas
