# 🔐 CREDENCIALES DE ACCESO - FUTURA ACCESS APP

> **Fecha de creación:** 2025-10-14
> **Última actualización:** 2025-10-14
> **Estado:** Verificado

---

## 📱 APLICACIÓN: FUTURA TICKETS WEB ACCESS APP

### URL de Acceso Local

```
🌐 Localhost:     http://localhost:3007
🌐 Red local:     http://172.31.52.148:3007
```

**Nota:** Para acceder desde otros dispositivos en la misma red, usa la URL de red local.

---

## 1. CREDENCIALES DE PERSONAL DE ACCESO

### 👤 Cuenta de Acceso Principal (Rol ACCESS)

```
📧 Email:    admin@futuratickets.com
🔑 Password: Admin123456
👤 Rol:      ADMIN (con permisos de ACCESS)
```

**Funcionalidades disponibles:**
- ✅ Escaneo de códigos QR
- ✅ Validación de tickets en tiempo real
- ✅ Vista de asistentes del evento
- ✅ Exportación CSV de asistentes
- ✅ Feedback visual y háptico
- ✅ Historial de escaneos
- ✅ Estadísticas de sesión

---

## 2. ARQUITECTURA DEL SISTEMA

### Flujo de Autenticación

```
┌─────────────────┐           ┌─────────────────┐           ┌──────────────┐
│  Access App     │   HTTPS   │   Access API    │   Query   │   MongoDB    │
│  (Frontend)     │──────────►│   (Backend)     │──────────►│   Database   │
│  localhost:3007 │           │  localhost:3005 │           │   Atlas      │
└─────────────────┘           └─────────────────┘           └──────────────┘
```

### APIs Involucradas

| Servicio | URL Local | Puerto | Estado |
|----------|-----------|--------|--------|
| **Access App** | http://localhost:3007 | 3007 | ✅ Activo |
| **Access API** | http://localhost:3005 | 3005 | ✅ Activo |
| **MongoDB** | mongodb+srv://cluster.mongodb.net | 27017 | ✅ Activo |

---

## 3. PROCESO DE LOGIN

### Paso a Paso

1. **Abrir la aplicación**
   ```
   http://localhost:3007
   ```

2. **Ingresar credenciales en el formulario**
   - Email: `admin@futuratickets.com`
   - Password: `Admin123456`
   - Opcional: Marcar "Recordarme" para guardar el email

3. **El sistema valida las credenciales**
   - Frontend envía petición a `/api/accounts/login`
   - API Route proxy redirige a Access API (puerto 3005)
   - Access API valida contra MongoDB
   - Genera token JWT firmado

4. **Si las credenciales son válidas**
   - Se guarda el token en `localStorage`
   - Se guarda timestamp de última actividad
   - Se redirige automáticamente a `/qrcode`

5. **El usuario puede comenzar a escanear tickets**

### Flujo Técnico

```typescript
// 1. Usuario ingresa credenciales
POST /api/accounts/login
Body: {
  "loginAccount": {
    "email": "admin@futuratickets.com",
    "password": "Admin123456"
  }
}

// 2. Respuesta exitosa
Response 200: {
  "_id": "507f1f77bcf86cd799439011",
  "name": "Admin",
  "lastName": "FuturaTickets",
  "email": "admin@futuratickets.com",
  "role": "ADMIN",
  "accessEvent": {
    "_id": "event_id",
    "name": "Nombre del Evento"
  },
  "promoter": {
    "_id": "promoter_id",
    "name": "Promotora"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// 3. Token guardado en localStorage
localStorage.setItem('token', response.token);
localStorage.setItem('lastActivity', Date.now().toString());

// 4. Si "Recordarme" está marcado
localStorage.setItem('rememberMe', 'true');
localStorage.setItem('userEmail', 'admin@futuratickets.com');
```

---

## 4. CARACTERÍSTICAS DE SEGURIDAD

### Session Management

**Timeout de Sesión:** 30 minutos de inactividad
- El sistema monitorea la actividad del usuario
- Eventos monitoreados: `mousedown`, `keydown`, `scroll`, `touchstart`, `click`
- Cada minuto se verifica si han pasado 30 minutos sin actividad
- Si el timeout se cumple, se hace logout automático

**Token JWT:**
- Firmado con secret key
- Incluye información del usuario y permisos
- Se envía en header `Authorization: Bearer {token}`
- Se valida en cada petición al backend

### Funcionalidad "Recordarme"

Cuando el usuario marca "Recordarme":
- ✅ El email se guarda en `localStorage`
- ✅ Al volver a cargar la app, el email se pre-rellena
- ✅ Solo se guarda el email, NUNCA la contraseña
- ❌ Si desmarca, se borran los datos guardados

---

## 5. ROLES Y PERMISOS

### Jerarquía de Roles en Access App

```
ADMIN (Super Admin)
  ├─> Acceso completo a todas las funciones
  ├─> Puede validar tickets de cualquier evento
  └─> Permisos de ACCESS + permisos administrativos

ACCESS (Personal de Control)
  ├─> Validación de tickets (escaneo QR)
  ├─> Vista de asistentes del evento asignado
  ├─> Exportación de lista de asistentes
  └─> Solo puede acceder a su evento asignado
```

### Funcionalidades por Rol

| Funcionalidad | ADMIN | ACCESS |
|---------------|-------|--------|
| Login en Access App | ✅ | ✅ |
| Escanear QR | ✅ | ✅ |
| Validar tickets | ✅ | ✅ |
| Ver asistentes | ✅ | ⚠️ Solo su evento |
| Exportar CSV | ✅ | ✅ |
| Cambiar de evento | ✅ | ❌ |
| Ver estadísticas | ✅ | ✅ |

---

## 6. FUNCIONALIDADES DE LA APP

### 6.1 Página de Login (`/login`)

**Características:**
- ✅ Input de email con autocompletado
- ✅ Input de password con enmascaramiento
- ✅ Checkbox "Recordarme"
- ✅ Validación en tiempo real
- ✅ Botón deshabilitado hasta completar campos
- ✅ Loading state durante autenticación
- ✅ Responsive design para móviles

**Atajos de Teclado:**
- `Enter` en cualquier campo → Intenta hacer login

### 6.2 Página de Escaneo QR (`/qrcode`)

**Características implementadas:**
- ✅ **Escáner QR en tiempo real** usando cámara del dispositivo
- ✅ **Feedback audio** al escanear (beep de éxito/error)
- ✅ **Feedback háptico** (vibración en móviles)
- ✅ **Historial de escaneos** (últimos 10 con timestamp)
- ✅ **Estadísticas de sesión** (granted/denied/total)
- ✅ **Flash/Linterna** con toggle on/off
- ✅ **Cambio de cámara** (frontal/trasera)
- ✅ **Estados visuales**: PROCESSING, GRANTED, DENIED
- ✅ **Información del ticket**: nombre, tipo, precio

**Flujo de escaneo:**
```
1. Usuario apunta cámara a QR del ticket
2. Sistema detecta QR automáticamente
3. Muestra estado PROCESSING (color amarillo)
4. Reproduce sonido de procesamiento
5. Envía validación al backend
6. Backend verifica estado del ticket:
   - OPEN → Cambia a CLOSED → Retorna GRANTED
   - CLOSED → Retorna DENIED (ya usado)
   - SALE → Retorna DENIED (en venta)
7. Muestra resultado:
   - GRANTED → Pantalla verde + beep éxito + vibración
   - DENIED → Pantalla roja + beep error + vibración larga
8. Agrega al historial de escaneos
9. Actualiza contador de estadísticas
10. Usuario cierra resultado → Vuelve al escáner
```

### 6.3 Página de Asistentes (`/attendants`)

**Características:**
- ✅ **Lista completa** de todos los tickets del evento
- ✅ **Búsqueda en tiempo real** por nombre, email, tipo o estado
- ✅ **Estados visuales**: OPEN (verde), CLOSED (rojo)
- ✅ **Exportación CSV** con un click
- ✅ **Scroll infinito** para listas largas
- ✅ **Responsive** con diseño optimizado para móviles

**Información mostrada:**
- Nombre completo del asistente
- Tipo de ticket (VIP, General, etc.)
- Estado (OPEN/CLOSED)

**Formato CSV exportado:**
```csv
Nombre,Apellido,Email,Tipo de Ticket,Precio,Estado,Fecha de Creación
María,González,maria@example.com,VIP,150,OPEN,14/10/2025 20:30:45
Pedro,Martínez,pedro@example.com,General,50,CLOSED,14/10/2025 21:15:20
```

### 6.4 Página de Cuenta (`/account`)

**Características:**
- ✅ **Información del usuario** logueado
- ✅ **Evento asignado** (para personal ACCESS)
- ✅ **Botón de logout** con confirmación
- ✅ **Limpieza de sesión** al cerrar sesión

---

## 7. ACCESO DESDE MÓVILES

### iOS (iPhone/iPad)

#### Safari (Recomendado)
1. Abrir Safari
2. Ir a: `http://172.31.52.148:3007`
3. Al solicitar permisos de cámara, seleccionar "Permitir"
4. Login con credenciales
5. Opcional: Agregar a pantalla de inicio como PWA

#### Chrome iOS
- Funciona pero Safari tiene mejor compatibilidad con cámara

### Android

#### Chrome (Recomendado)
1. Abrir Chrome
2. Ir a: `http://172.31.52.148:3007`
3. Permitir permisos de cámara
4. Login con credenciales
5. Opcional: "Agregar a pantalla de inicio"

#### Firefox Android
- Compatible, pero Chrome tiene mejor rendimiento

### Permisos Requeridos

**Cámara:**
- Requerido para escaneo QR
- Se solicita al entrar a `/qrcode`
- Si se deniega, la app continúa funcionando (sin escaneo)

**Vibración:**
- Opcional, mejora UX con feedback háptico
- Se activa automáticamente si está disponible

**Notificaciones:**
- No requerido actualmente
- Futuro: para notificaciones push de eventos

---

## 8. INSTALACIÓN COMO PWA

### ¿Qué es PWA?
Una Progressive Web App permite instalar la aplicación web como si fuera una app nativa, con icono en el home screen y funcionamiento offline parcial.

### Instalar en iOS
1. Abrir Safari y navegar a la app
2. Tocar botón "Compartir" (icono de cuadrado con flecha)
3. Scroll down y seleccionar "Agregar a la pantalla de inicio"
4. Escribir nombre: "Futura Access"
5. Tocar "Agregar"
6. El icono aparece en home screen

### Instalar en Android
1. Abrir Chrome y navegar a la app
2. Tocar menú (3 puntos verticales)
3. Seleccionar "Agregar a pantalla de inicio"
4. Confirmar nombre de la app
5. El icono aparece en app drawer

### Beneficios de PWA
- ✅ Acceso rápido desde home screen
- ✅ Pantalla completa (sin barra del navegador)
- ✅ Funciona offline (parcial, futuro)
- ✅ Actualizaciones automáticas

---

## 9. TROUBLESHOOTING

### Problema: No puedo hacer login

**Síntomas:**
- Botón de login no funciona
- Error 401 Unauthorized
- Pantalla se queda en loading

**Soluciones:**
1. Verificar que las credenciales son correctas:
   - Email: `admin@futuratickets.com`
   - Password: `Admin123456` (case-sensitive)
2. Verificar que Access API está ejecutándose (puerto 3005)
3. Abrir DevTools → Console para ver errores
4. Verificar conexión a red local

### Problema: Cámara no funciona

**Síntomas:**
- Pantalla negra en `/qrcode`
- Error "Camera not accessible"
- No se solicitan permisos

**Soluciones:**
1. **En iOS:**
   - Ir a Ajustes → Safari → Cámara → Permitir
   - Recargar la página
2. **En Android:**
   - Ir a Ajustes → Apps → Chrome → Permisos → Cámara → Permitir
3. **Verificar HTTPS:**
   - La cámara solo funciona con HTTPS o localhost
   - Si usas IP (172.31.52.148), algunos navegadores pueden bloquear
4. **Usar Safari en iOS** (mejor compatibilidad)

### Problema: QR no se detecta

**Síntomas:**
- La cámara funciona pero no reconoce el QR
- QR se detecta muy lento

**Soluciones:**
1. Asegurar buena iluminación
2. Activar linterna (botón de flash)
3. Mantener el QR a 15-30cm de la cámara
4. Asegurar que el QR no está dañado o borroso
5. Limpiar lente de la cámara

### Problema: Sesión expira constantemente

**Síntomas:**
- Se desloguea automáticamente
- Mensaje "Session timeout - logging out"

**Causas:**
- 30 minutos de inactividad
- Token JWT expirado
- Problemas con localStorage

**Soluciones:**
1. Mantener actividad en la app (tocar pantalla cada 20 min)
2. Habilitar "Recordarme" para login más rápido
3. Verificar que el navegador permite localStorage
4. Contactar administrador si el problema persiste

### Problema: Historial de escaneos desaparece

**Causa:**
- El historial se almacena en memoria (no persistente)
- Se borra al recargar la página

**Solución:**
- Normal por diseño
- Futuro: implementar persistencia con localStorage

### Problema: No puedo acceder desde móvil

**Síntomas:**
- La URL no carga
- Error "No se puede conectar"
- Timeout

**Soluciones:**
1. Verificar que estás en la misma red WiFi
2. Verificar IP del servidor:
   ```bash
   # En el servidor
   ifconfig | grep inet
   ```
3. Verificar firewall no bloquea puerto 3007
4. Ping a la IP:
   ```bash
   ping 172.31.52.148
   ```
5. Probar con `http://` (no `https://`)

---

## 10. FEATURES PRÓXIMAS

### Sprint 2 (Prioridad Alta) 🔴
- [ ] Dashboard de estadísticas en tiempo real
- [ ] Gráfico de entradas por hora
- [ ] Ratio de asistencia
- [ ] Escaneo continuo (batch mode)
- [ ] Modo offline con sincronización

### Sprint 3 (Prioridad Media) 🟡
- [ ] Modo oscuro
- [ ] Toast notifications mejoradas
- [ ] Push notifications
- [ ] Recuperar contraseña
- [ ] Filtros avanzados en asistentes

### Futuro (Prioridad Baja) 🟢
- [ ] Reconocimiento facial
- [ ] Realidad aumentada
- [ ] Gamificación (leaderboard)
- [ ] Multi-idioma (español/inglés)

Ver backlog completo en: `BACKLOG_COMPLETO.md`

---

## 11. DATOS TÉCNICOS

### Variables de Entorno (`.env.local`)

```bash
# URL de la aplicación
NEXT_PUBLIC_FUTURA=http://localhost:3007

# URL del backend API
NEXT_PUBLIC_FUTURA_API=http://localhost:3005
```

### Puertos Utilizados

| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| Access App | 3007 | HTTP |
| Access API | 3005 | HTTP |
| Marketplace | 3001 | HTTP |
| Admin Panel | 3000 | HTTP |

### Tecnologías

**Frontend:**
- Next.js 15.5.5
- React 19
- TypeScript 5.9
- Ant Design 5.22.5
- SASS
- qr-scanner 1.4.2

**Backend:**
- NestJS 11
- MongoDB (Mongoose)
- Socket.IO (WebSockets)
- JWT (Passport)

---

## 12. CONTACTO Y SOPORTE

**Para problemas técnicos:**
- Revisar logs del servidor: `/tmp/nextjs.log`
- Revisar DevTools del navegador (F12)
- Consultar `BACKLOG_COMPLETO.md` para features pendientes

**Para reset de contraseñas:**
- Consultar `CREDENCIALES_ACCESO_UNIFICADO.md`
- Ejecutar script de reset si es necesario

**Documentación relacionada:**
- `README.md` - Guía general del proyecto
- `BACKLOG_COMPLETO.md` - Lista completa de tareas
- `ACCESO_MOBILE.md` - Instrucciones de acceso móvil
- `ROADMAP.md` - Plan de desarrollo

---

## RESUMEN EJECUTIVO

### ✅ Para empezar a usar la app HOY:

1. **Abrir navegador** (Safari en iOS, Chrome en Android)
2. **Ir a:** `http://172.31.52.148:3007` (o `localhost:3007` en el mismo equipo)
3. **Login con:**
   - Email: `admin@futuratickets.com`
   - Password: `Admin123456`
4. **Permitir** acceso a la cámara cuando se solicite
5. **Escanear** tickets en `/qrcode`
6. **Exportar** lista de asistentes en `/attendants`

### ✅ Credenciales verificadas:
- Email: `admin@futuratickets.com`
- Password: `Admin123456`
- Rol: ADMIN (acceso completo)
- Estado: ✅ Verificado y funcionando

### ✅ URLs de acceso:
- Localhost: `http://localhost:3007`
- Red local: `http://172.31.52.148:3007`
- Estado: ✅ App ejecutándose

---

**Última verificación:** 2025-10-14
**Estado del sistema:** ✅ Completamente operativo
**Credenciales:** ✅ Verificadas

---

**FIN DEL DOCUMENTO**
