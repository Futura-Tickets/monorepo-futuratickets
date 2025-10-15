# 🎫 FUTURA TICKETS - GUÍA DE ACCESO COMPLETO

**Fecha**: 2025-10-15
**Estado**: ✅ Todas las aplicaciones desplegadas y funcionando

---

## 📍 RESUMEN RÁPIDO

Todas las aplicaciones están corriendo y configuradas correctamente:

| Aplicación | URL | Puerto |
|-----------|-----|--------|
| **Admin API** (Backend) | http://localhost:3001 | 3001 |
| **Admin Panel** | http://localhost:3003 | 3003 |
| **Marketplace** | http://localhost:3000 | 3000 |
| **Access App** | http://localhost:3007 | 3007 |

---

## 🔐 CREDENCIALES DE ACCESO

### 1️⃣ ADMIN / PROMOTOR
**Para acceder a Admin Panel y Access App**

```
📧 Email:    admin.local@futuratickets.com
🔐 Password: AdminLocal2025
```

**URLs donde puedes usar estas credenciales:**
- Admin Panel: http://localhost:3003
- Access App: http://localhost:3007

**Role:** ADMIN
**Permisos:** Acceso completo a todas las funcionalidades

---

### 2️⃣ USUARIO / CLIENTE
**Para acceder a Marketplace**

```
📧 Email:    usuario.demo@futuratickets.com
🔐 Password: UsuarioDemo2025
```

**URLs donde puedes usar estas credenciales:**
- Marketplace: http://localhost:3000

**Role:** USER
**Permisos:** Compra de tickets, gestión de mis entradas

---

## 🧪 VERIFICACIÓN DE FUNCIONAMIENTO

### Opción 1: Probar desde el navegador

1. Ve a la aplicación que quieras probar:
   - Admin Panel: http://localhost:3003
   - Marketplace: http://localhost:3000
   - Access App: http://localhost:3007

2. Ingresa las credenciales correspondientes

3. Deberías poder acceder sin problemas

---

### Opción 2: Probar desde la API directamente

Si las aplicaciones frontend tienen problemas, puedes verificar que las credenciales funcionan usando curl:

#### Test ADMIN credentials:
```bash
curl -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.local@futuratickets.com","password":"AdminLocal2025"}' | jq .
```

#### Test USER credentials:
```bash
curl -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario.demo@futuratickets.com","password":"UsuarioDemo2025"}' | jq .
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "Admin",
  "lastName": "Local",
  "email": "admin.local@futuratickets.com",
  "role": "ADMIN",
  "_id": "..."
}
```

---

### Opción 3: Usar Swagger UI (API Docs)

1. Abre: http://localhost:3001/api/docs

2. Busca el endpoint: `POST /accounts/login`

3. Click "Try it out"

4. Pega las credenciales en el body:
```json
{
  "email": "admin.local@futuratickets.com",
  "password": "AdminLocal2025"
}
```

5. Click "Execute"

6. Deberías ver el token JWT en la respuesta

---

## 🔗 ENLACES ÚTILES

### API Backend
- **Base URL:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **Swagger Docs:** http://localhost:3001/api/docs

### Admin Panel
- **URL:** http://localhost:3003
- **Funcionalidades:**
  - Gestión de eventos
  - Ver ventas
  - Gestión de clientes
  - Pagos y withdrawals
  - Analytics

### Marketplace
- **URL:** http://localhost:3000
- **Funcionalidades:**
  - Búsqueda de eventos
  - Compra de tickets
  - Mis entradas
  - Reventa de tickets
  - Transferencia de tickets

### Access App
- **URL:** http://localhost:3007
- **Funcionalidades:**
  - Control de acceso
  - Escaneo de QR
  - Lista de asistentes
  - Validación de tickets

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### Variables de Entorno Actualizadas

**Admin Panel** (`.env.local`):
```env
NEXT_PUBLIC_FUTURA=http://localhost:3001
NEXT_PUBLIC_FUTURA_API=http://localhost:3001
```

**Marketplace** (`.env.local`):
```env
NEXT_PUBLIC_FUTURA_API=http://localhost:3001
NEXT_PUBLIC_FUTURA=http://localhost:3001
NEXT_PUBLIC_REFACTOR_RESALE_API=http://localhost:3001
```

**Access App** (`.env.local`):
```env
NEXT_PUBLIC_FUTURA=http://localhost:3007
NEXT_PUBLIC_FUTURA_API=http://localhost:3001
```

---

## 🚀 COMANDOS PARA REINICIAR SERVICIOS

Si necesitas reiniciar algún servicio:

### Backend API:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev
```

### Admin Panel:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
npm run dev
```

### Marketplace:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2
npm run dev
```

### Access App:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-web-access-app
npm run dev
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Si el login no funciona en el frontend:

1. **Verifica que el API backend está corriendo:**
```bash
curl http://localhost:3001/health
```

2. **Verifica que las credenciales funcionan en la API:**
```bash
curl -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.local@futuratickets.com","password":"AdminLocal2025"}'
```

3. **Verifica la consola del navegador** (F12) para ver errores

4. **Verifica que las variables de entorno están correctas:**
   - Abre DevTools → Network → Ve la URL de las peticiones
   - Deberían ir a `http://localhost:3001`

5. **Reinicia la aplicación frontend** si cambias el `.env.local`

---

### Error: "Failed to fetch"

Esto generalmente significa:
- El backend no está corriendo
- Hay un error de CORS
- La URL en `.env.local` es incorrecta

**Solución:**
1. Verifica que el backend está en puerto 3001
2. Verifica el archivo `.env.local` de la app
3. Reinicia el frontend

---

### Error: "Invalid credentials"

- Verifica que estás copiando las credenciales exactas (sin espacios)
- Verifica que estás usando el email correcto para cada app:
  - Admin Panel/Access App: `admin.local@futuratickets.com`
  - Marketplace: `usuario.demo@futuratickets.com`

---

## 📝 NOTAS IMPORTANTES

1. ✅ Las credenciales están creadas en la base de datos
2. ✅ Las passwords están hasheadas con bcrypt
3. ✅ Los tokens JWT funcionan correctamente
4. ✅ Todas las aplicaciones están configuradas para usar puerto 3001
5. ✅ El CORS está configurado en el backend

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Backend API corriendo en puerto 3001
- [ ] Admin Panel corriendo en puerto 3003
- [ ] Marketplace corriendo en puerto 3000
- [ ] Access App corriendo en puerto 3007
- [ ] Login ADMIN funciona en Admin Panel
- [ ] Login ADMIN funciona en Access App
- [ ] Login USER funciona en Marketplace
- [ ] Tokens JWT se generan correctamente
- [ ] Las aplicaciones se conectan al backend correcto

---

## 🎯 PRÓXIMOS PASOS

Una vez que verifiques que todo funciona:

1. Crea eventos de prueba desde el Admin Panel
2. Prueba la compra de tickets en el Marketplace
3. Verifica el control de acceso en Access App
4. Explora las funcionalidades de analytics

---

**¿Necesitas ayuda?** Revisa los logs de los servidores o contacta al equipo de desarrollo.
