# ACCESO COMPLETO A SERVICIOS - FUTURA TICKETS

> **Fecha:** 2025-10-15
> **Estado:** ✅ Todos los servicios activos y funcionando

---

## 📋 SERVICIOS ACTIVOS

| Servicio | URL | Puerto | Estado |
|----------|-----|--------|--------|
| **Marketplace** | http://localhost:3000 | 3000 | ✅ ACTIVO |
| **Admin API** | http://localhost:3001 | 3001 | ✅ ACTIVO |
| **Admin Panel** | http://localhost:3003 | 3003 | ✅ ACTIVO |
| **Access API** | http://localhost:3004 | 3004 | ✅ ACTIVO |
| **Access App** | http://localhost:3007 | 3007 | ✅ ACTIVO |

---

## 🌐 FRONTEND - URLS DE ACCESO

### 1. Marketplace (Compra de Tickets)
```
URL:      http://localhost:3000
Puerto:   3000
Login:    http://localhost:3000/login
```

**Credenciales de prueba:**
```
📧 Email:    admin@futuratickets.com
🔑 Password: Admin123456
👤 Role:     ADMIN
```

**Funcionalidades:**
- Ver eventos disponibles
- Comprar tickets
- Gestión de tickets (transferencias, reventa)
- Panel de administración (`/admin`)
- Gestión de promotores, eventos y órdenes

---

### 2. Admin Panel (Panel de Administración de Promotores)
```
URL:      http://localhost:3003
Puerto:   3003
Login:    http://localhost:3003/login
```

**Credenciales Promotor:**
```
📧 Email:    promoter@futuratickets.com
🔑 Password: Promoter123456
👤 Role:     PROMOTER
```

**Credenciales Admin:**
```
📧 Email:    admin@futuratickets.com
🔑 Password: Admin123456
👤 Role:     ADMIN
```

**Funcionalidades:**
- Gestión de eventos propios
- Visualización de ventas
- Analytics de eventos
- Gestión de códigos promocionales
- Control de invitaciones
- Configuración de pagos

---

### 3. Access App (Control de Acceso a Eventos)
```
URL:      http://localhost:3007
Puerto:   3007
Login:    http://localhost:3007/login
```

**Credenciales Personal de Acceso:**
```
📧 Email:    access@futuratickets.com
🔑 Password: Access123456
👤 Role:     ACCESS
```

**Funcionalidades:**
- Escaneo de códigos QR
- Validación de tickets
- Lista de asistentes
- Control de entradas (check-in)

---

## 🔌 BACKEND - ENDPOINTS DE API

### 1. Admin API (Backend del Admin Panel)
```
Base URL:  http://localhost:3001
Puerto:    3001
```

**Endpoints principales:**
```bash
# Autenticación
POST   /accounts/login
POST   /accounts/validate
POST   /accounts/create-promoter

# Eventos
GET    /events
POST   /events
GET    /events/:id
PUT    /events/:id
DELETE /events/:id
POST   /events/:id/launch

# Ventas
GET    /sales/:event
PUT    /sales/:id/status
POST   /sales/:id/transfer

# Órdenes
GET    /orders
GET    /orders/:id
POST   /orders/:id/resend

# Promocodes
GET    /promocodes/:eventId
POST   /promocodes/create
DELETE /promocodes/:eventId/:id

# Pagos
GET    /payments/methods
POST   /payments/methods
GET    /payments/requests
POST   /payments/requests
```

**Ejemplo de llamada:**
```bash
# Login
curl -X POST http://localhost:3001/api/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginAccount": {
      "email": "admin@futuratickets.com",
      "password": "Admin123456"
    }
  }'

# Obtener eventos (con token)
curl http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. Access API (Backend del Access App)
```
Base URL:  http://localhost:3004
Puerto:    3004
```

**Endpoints principales:**
```bash
# Autenticación
POST   /accounts/login
POST   /accounts/validate

# Validación de Acceso
PATCH  /events/access
GET    /events/attendants/:eventId

# Promocodes
GET    /events/promocodes/:eventId
POST   /events/promocodes/create
DELETE /events/promocodes/:eventId/:code
```

**Ejemplo de validación de ticket:**
```bash
# Login personal de acceso
curl -X POST http://localhost:3004/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginAccount": {
      "email": "access@futuratickets.com",
      "password": "Access123456"
    }
  }'

# Validar ticket
curl -X PATCH http://localhost:3004/events/access \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sale": "TICKET_ID_FROM_QR"
  }'

# Respuesta exitosa (Acceso Concedido)
{
  "access": "GRANTED",
  "reason": "Access granted",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "type": "VIP",
  "price": 150.00
}

# Respuesta denegada (Ticket ya usado)
{
  "access": "DENIED",
  "reason": "Ticket already used.",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "type": "VIP",
  "price": 150.00
}
```

---

## 🔐 CREDENCIALES COMPLETAS

### Cuenta Admin (Super Admin)
```
📧 Email:    admin@futuratickets.com
🔑 Password: Admin123456
👤 Role:     ADMIN

Acceso a:
  ✅ Marketplace (http://localhost:3000)
  ✅ Admin Panel (http://localhost:3003)
  ✅ Todos los endpoints de Admin API
  ✅ Panel /admin en Marketplace
```

### Cuenta Promotor
```
📧 Email:    promoter@futuratickets.com
🔑 Password: Promoter123456
👤 Role:     PROMOTER

Acceso a:
  ✅ Admin Panel (http://localhost:3003)
  ✅ Gestión de eventos propios
  ✅ Analytics y ventas de sus eventos
  ✅ Códigos promocionales
```

### Cuenta Personal de Acceso
```
📧 Email:    access@futuratickets.com
🔑 Password: Access123456
👤 Role:     ACCESS

Acceso a:
  ✅ Access App (http://localhost:3007)
  ✅ Validación de tickets
  ✅ Control de asistentes
  ✅ Evento asignado
```

### Cuenta de Prueba (Usuario Normal)
```
📧 Email:    marketplace-test@futuratickets.com
🔑 Password: Test123456
👤 Role:     USER
🆔 ID:       68ee6e9f88dc62e2cded1a7d

Acceso a:
  ✅ Marketplace (http://localhost:3000)
  ✅ Compra de tickets
  ✅ Transferencias y reventa
```

---

## 🧪 TESTING DE SERVICIOS

### Test 1: Marketplace Frontend
```bash
# Abrir navegador
open http://localhost:3000

# Login
1. Ir a http://localhost:3000/login
2. Email: admin@futuratickets.com
3. Password: Admin123456
4. Click "Login"

# Verificar acceso
✅ Debe redireccionar a /
✅ Ver eventos disponibles
✅ Menú superior con "Admin" si es admin
✅ Ir a /admin para panel de administración
```

### Test 2: Admin Panel
```bash
# Abrir navegador
open http://localhost:3003

# Login
1. Ir a http://localhost:3003/login
2. Email: admin@futuratickets.com
3. Password: Admin123456
4. Click "Iniciar Sesión"

# Verificar acceso
✅ Debe mostrar dashboard con eventos
✅ Tabs: Eventos, Clientes, Analytics, Pagos
✅ Poder crear nuevo evento
✅ Ver ventas de eventos
```

### Test 3: Access App
```bash
# Abrir navegador
open http://localhost:3007

# Login
1. Ir a http://localhost:3007/login
2. Email: access@futuratickets.com
3. Password: Access123456
4. Click "Login"

# Verificar acceso
✅ Debe mostrar escáner QR
✅ Tabs: QR Scanner, Asistentes, Cuenta
✅ Poder ver lista de asistentes
✅ Escanear QR (o ingresar ID manual)
```

### Test 4: Admin API
```bash
# Test de health
curl http://localhost:3001/

# Test de login
curl -X POST http://localhost:3001/api/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginAccount": {
      "email": "admin@futuratickets.com",
      "password": "Admin123456"
    }
  }'

# Debe retornar:
✅ Status 200
✅ JSON con token JWT
✅ Datos del usuario
```

### Test 5: Access API
```bash
# Test de health
curl http://localhost:3004/

# Test de login
curl -X POST http://localhost:3004/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "loginAccount": {
      "email": "access@futuratickets.com",
      "password": "Access123456"
    }
  }'

# Debe retornar:
✅ Status 200
✅ JSON con token JWT
✅ Datos del usuario ACCESS
✅ Evento asignado
```

---

## 📊 VERIFICACIÓN DE SERVICIOS

### Comando rápido para verificar todos los servicios
```bash
# Verificar puertos activos
lsof -i :3000 -i :3001 -i :3003 -i :3004 -i :3007 | grep LISTEN

# Debe mostrar 5 procesos Node.js
```

### Ver logs de servicios
```bash
# Marketplace
tail -f /tmp/marketplace.log

# Admin API
tail -f /tmp/admin-api.log

# Admin Panel
tail -f /tmp/admin-panel.log

# Access API
tail -f /tmp/access-api.log

# Access App
tail -f /tmp/access-app.log
```

---

## 🚀 INICIAR TODOS LOS SERVICIOS

### Opción 1: Script Automatizado (Recomendado)
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./start-all-services.sh
```

### Opción 2: Detener todos los servicios
```bash
./start-all-services.sh stop
```

### Opción 3: Manual (individual)
```bash
# Marketplace
cd futura-market-place-v2
npm run dev

# Admin API
cd futura-tickets-admin-api
npm run start:dev

# Admin Panel
cd futura-tickets-admin
npm run dev

# Access API
cd futura-access-api
npm run start:dev

# Access App
cd futura-tickets-web-access-app
npm run dev
```

---

## 🔍 TROUBLESHOOTING

### Problema: "Cannot connect to server"
**Solución:**
```bash
# Verificar que el servicio está corriendo
lsof -i :PUERTO

# Si no está corriendo, iniciar con el script
./start-all-services.sh
```

### Problema: "Invalid credentials"
**Solución:**
```bash
# Verificar que la base de datos MongoDB está accesible
# Verificar que las credenciales coinciden con las de este documento
# Si persiste, revisar logs del backend
```

### Problema: "Token expired"
**Solución:**
```bash
# Hacer logout en el frontend
# Hacer login nuevamente
# Se generará un nuevo token JWT
```

### Problema: Puerto ya en uso
**Solución:**
```bash
# Detener todos los servicios
./start-all-services.sh stop

# Reiniciar
./start-all-services.sh
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Arquitectura completa:** `ARQUITECTURA_SISTEMA_COMPLETO.md`
- **Guía de despliegue:** `GUIA_DESPLIEGUE_COMPLETA.md`
- **Estado del deployment:** `DEPLOYMENT_STATUS.md`
- **Credenciales unificadas:** `CREDENCIALES_ACCESO_UNIFICADO.md`

---

## ✅ CHECKLIST DE VERIFICACIÓN

Usa este checklist para verificar que todo funciona:

- [ ] Marketplace carga en http://localhost:3000
- [ ] Admin Panel carga en http://localhost:3003
- [ ] Access App carga en http://localhost:3007
- [ ] Admin API responde en http://localhost:3001
- [ ] Access API responde en http://localhost:3004
- [ ] Login funciona con admin@futuratickets.com
- [ ] Puedo ver eventos en Marketplace
- [ ] Puedo acceder a /admin en Marketplace
- [ ] Admin Panel muestra dashboard de eventos
- [ ] Access App permite escanear QR
- [ ] Logs se generan en /tmp/*.log
- [ ] Script start-all-services.sh funciona correctamente

---

**¡LISTO PARA USAR!** 🎉

Todos los servicios están configurados y funcionando correctamente.
