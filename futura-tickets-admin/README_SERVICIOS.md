# 🎫 Futura Tickets - Acceso a Servicios

**Última actualización:** 2025-10-14 15:40

---

## 🚀 Enlaces Rápidos - Servicios Activos

### Admin Panel
- 🎯 **Frontend:** http://localhost:3001
- 🔧 **API:** http://localhost:3000
- 📖 **API Docs (Swagger):** http://localhost:3000/api-docs
- ❤️ **Health Check:** http://localhost:3000/health

### Marketplace (Opcional - No necesario para desarrollo básico)
- 🛒 **Frontend:** http://localhost:3003
- 🔧 **API:** http://localhost:3002

---

## 📊 Estado Actual de Servicios

| Servicio | Puerto | Estado | URL |
|----------|--------|--------|-----|
| Admin Frontend | 3001 | ✅ Corriendo | http://localhost:3001 |
| Admin API | 3000 | ✅ Corriendo | http://localhost:3000 |
| Redis | 6379 | ✅ Corriendo | localhost:6379 |
| MongoDB | 27017 | ✅ Corriendo | mongodb://localhost:27017 |
| Marketplace Frontend | 3003 | ⚠️ Opcional | http://localhost:3003 |
| Marketplace API | 3002 | ⚠️ Opcional | http://localhost:3002 |
| Access API | 3004 | ⚠️ Opcional | http://localhost:3004 |

---

## 🎯 Páginas del Admin Panel

### Autenticación
- **Login:** http://localhost:3001/login
- **Registro:** http://localhost:3001/register

### Dashboard y Eventos
- **Dashboard Principal:** http://localhost:3001/events
- **Crear Evento:** http://localhost:3001/events/create
- **Detalle de Evento:** http://localhost:3001/events/[eventId]
- **Editar Evento:** http://localhost:3001/events/[eventId]/edit

### Gestión
- **Clientes:** http://localhost:3001/clients
- **Cliente Detalle:** http://localhost:3001/clients/[clientId]
- **Pagos:** http://localhost:3001/payments
- **Analytics:** http://localhost:3001/analytics
- **Campañas:** http://localhost:3001/campaigns
- **Configuración:** http://localhost:3001/settings
- **Mi Cuenta:** http://localhost:3001/account

---

## 🔌 API Endpoints Principales

### Admin API (http://localhost:3000)

#### Autenticación
```bash
POST   /api/auth/login              # Login de promotor
POST   /api/auth/register           # Registro de promotor
POST   /api/auth/google             # Login con Google
GET    /api/auth/check              # Verificar token
```

#### Eventos
```bash
GET    /api/events                  # Listar eventos del promotor
POST   /api/events                  # Crear evento
GET    /api/events/:id              # Obtener evento por ID
PATCH  /api/events/:id              # Editar evento
DELETE /api/events/:id              # Eliminar evento
PATCH  /api/launch/:eventId         # Lanzar evento (hacerlo público)
POST   /api/events/:id/image        # Subir imagen de evento
```

#### Ventas y Tickets
```bash
GET    /api/sales/:eventId          # Ventas de un evento
GET    /api/sales/account/:accountId # Ventas de un cliente
PATCH  /api/sales/:saleId/status    # Actualizar estado de ticket
PATCH  /api/sales/:saleId/transfer  # Transferir ticket
POST   /api/sales/:saleId/resend    # Reenviar email de orden
```

#### Clientes
```bash
GET    /api/clients                 # Listar clientes
GET    /api/clients/:id             # Detalle de cliente
```

#### Pagos
```bash
GET    /api/payment-methods         # Métodos de pago del promotor
POST   /api/payment-methods         # Agregar método de pago
PATCH  /api/payment-methods/:id     # Actualizar método
DELETE /api/payment-methods/:id     # Eliminar método
GET    /api/payment-requests        # Solicitudes de pago
POST   /api/payment-requests        # Solicitar pago
```

#### Promo Codes y Cupones
```bash
GET    /api/promocodes/:eventId     # Códigos promocionales
POST   /api/promocodes/:eventId     # Crear código promocional
DELETE /api/promocodes/:eventId/:id # Eliminar código
GET    /api/coupons/:eventId        # Cupones de descuento
POST   /api/coupons/:eventId        # Crear cupón
DELETE /api/coupons/:eventId/:id    # Eliminar cupón
```

#### Invitaciones
```bash
GET    /api/invitations/:eventId    # Listar invitaciones
POST   /api/invitations             # Crear invitación
```

#### Control de Acceso
```bash
GET    /api/access/:eventId         # Cuentas con acceso al evento
POST   /api/access                  # Dar acceso a cuenta
```

#### Analytics
```bash
GET    /api/analytics/event/:eventId  # Analytics de evento específico
GET    /api/analytics/promoter        # Analytics del promotor
```

---

## 🛠️ Comandos Útiles

### Iniciar Servicios

```bash
# Admin API
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm run start:dev

# Admin Frontend
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
npm run dev
```

### Verificar Estado

```bash
# Ver puertos activos
lsof -i :3000,3001,3002,3003,3004

# Ver procesos Node.js
ps aux | grep -E "node.*start:dev|node.*next" | grep -v grep

# Health check
curl http://localhost:3000/health

# Verificar Redis
redis-cli ping

# Verificar MongoDB
mongosh --eval "db.adminCommand('ping')"
```

### Ver Logs

```bash
# Frontend
tail -f /tmp/admin-frontend-fixed.log

# Backend
tail -f /tmp/admin-api-final.log

# Filtrar errores
tail -f /tmp/admin-frontend-fixed.log | grep -i error
```

### Detener Servicios

```bash
# Detener frontend
lsof -ti:3001 | xargs kill -9

# Detener backend
lsof -ti:3000 | xargs kill -9

# Detener todo
lsof -ti:3000,3001,3002,3003,3004 | xargs kill -9
```

---

## ✅ Estado Actual del Sistema

### ✅ Funcionando Correctamente

1. **Admin Frontend** - Puerto 3001
   - ✅ Sin errores "xhr poll error"
   - ✅ Todas las páginas cargando
   - ✅ UI responsiva
   - ⚠️ Socket.IO deshabilitado temporalmente (sin notificaciones en tiempo real)

2. **Admin API** - Puerto 3000
   - ✅ Todos los endpoints REST funcionando
   - ✅ Swagger docs disponible
   - ✅ Health check: OK
   - ✅ Conexión a MongoDB: OK
   - ✅ Conexión a Redis: OK
   - ⚠️ Socket.IO endpoint no configurado (404 en `/socket.io/`)

3. **Redis** - Puerto 6379
   - ✅ Operativo
   - ✅ Usado para colas (Bull)
   - ✅ Listo para Socket.IO cuando se configure

4. **MongoDB** - Puerto 27017
   - ✅ Operativo
   - ✅ Base de datos: `futura-tickets-admin`
   - ✅ Todas las colecciones disponibles

### ⚠️ Funcionalidades Limitadas

- ❌ **Notificaciones en tiempo real:** Socket.IO deshabilitado
- ❌ **Auto-refresh de dashboard:** Requiere recarga manual (F5)
- ❌ **Push notifications:** Sin Socket.IO no hay eventos en tiempo real

**Workaround:** Los usuarios pueden recargar la página (F5) para ver actualizaciones.

### ✅ Funcionalidades Completas

TODO lo demás funciona perfectamente:
- ✅ Login/Registro/Autenticación
- ✅ CRUD de eventos (crear, editar, eliminar, listar)
- ✅ Gestión de ventas y tickets
- ✅ Gestión de clientes
- ✅ Pagos y withdrawals
- ✅ Promo codes y cupones
- ✅ Invitaciones
- ✅ Control de accesos
- ✅ Analytics y reportes
- ✅ Campañas de marketing
- ✅ Configuración

---

## 📚 Documentación Adicional

Para más información técnica, consultar:

1. **SOCKET_FIX_FINAL.md** - Solución completa del error "xhr poll error"
2. **SERVICIOS_Y_PUERTOS.md** - Guía detallada de todos los servicios
3. **REFACTORING_PLAN.md** - Plan de refactoring de `admin-event.service.ts`
4. **CORS_SECURITY.md** - Configuración de seguridad CORS
5. **SWAGGER_GUIDE.md** - Uso de Swagger/OpenAPI docs

---

## 🐛 Problemas Conocidos

### Socket.IO Deshabilitado

**Problema:** Backend Admin API no tiene configurado el endpoint Socket.IO.

**Impacto:** Sin notificaciones en tiempo real.

**Solución Temporal:** Socket.IO deshabilitado en frontend para evitar errores.

**Solución Permanente:** Configurar `@WebSocketGateway()` en Admin API. Ver `SOCKET_FIX_FINAL.md` para instrucciones completas.

### Marketplace y Access APIs Opcionales

**Estado:** No están corriendo por defecto.

**Razón:** No son necesarios para desarrollo básico del admin panel.

**Cuándo iniciarlos:**
- **Marketplace:** Para testing de compras end-to-end
- **Access:** Para testing de control de accesos y check-in

---

## 🔐 Credenciales de Prueba

### Admin Login
```
Email: promotor@test.com
Password: (configurar en base de datos)
```

### Base de Datos
```
MongoDB URI: mongodb://localhost:27017/futura-tickets-admin
Redis URI: redis://localhost:6379
```

---

## 📞 Soporte

Para problemas técnicos:

1. Verificar logs en `/tmp/*.log`
2. Consultar documentación en archivos `.md`
3. Verificar health checks: http://localhost:3000/health
4. Revisar Swagger docs: http://localhost:3000/api-docs

---

**Estado del sistema:** ✅ **OPERATIVO** (sin errores)
**Última verificación:** 2025-10-14 15:40
**Admin Panel URL:** http://localhost:3001
