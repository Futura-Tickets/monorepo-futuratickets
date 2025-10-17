# FUTURA-TICKETS-WEB-ACCESS-APP

## RESUMEN

**Propósito**: Aplicación web de control de acceso para validadores de eventos (versión web de futura-access-app-main).

**Stack**: Next.js 15.5.5 (App Router) + TypeScript + Ant Design + SASS

**Puerto**: 3003

## FUNCIONALIDAD PRINCIPAL

### Autenticación
- Login seguro con JWT tokens
- Validación automática de tokens en cada carga
- Redirect a login si token expirado o inválido
- Almacenamiento de token en localStorage

### Escaneo QR
- Escáner de códigos QR en tiempo real usando qr-scanner
- Validación instantánea de tickets
- Feedback visual (GRANTED/DENIED/PROCESSING)
- Muestra información del ticket: nombre, tipo, precio
- Manejo de errores robusto

### Gestión de Asistentes
- Lista completa de asistentes del evento
- Búsqueda en tiempo real por nombre, email, tipo o estado
- Filtros dinámicos
- Estados de tickets: OPEN, CLOSED

### Perfil de Usuario
- Información del validador logueado
- Evento asignado
- Opción de desconexión

### Navegación
- Menú inferior con 3 secciones:
  - QR Scanner
  - Lista de Asistentes
  - Cuenta de Usuario

## ARQUITECTURA

### Frontend
- **Framework**: Next.js 15.5.5 con App Router
- **State Management**: React Context API (GlobalStateProvider)
- **Routing**: Next.js App Router
- **UI Components**: Ant Design 5.22.5
- **Estilos**: SASS modules
- **TypeScript**: Strict mode habilitado

### API Routes (Proxy Layer)
La app usa Next.js API Routes como proxy al backend:

```
/api/accounts/login → Backend: /accounts/login
/api/accounts/validate → Backend: /accounts/validate
/api/access → Backend: /events/access
/api/attendants/[event] → Backend: /events/attendants/:event
```

**Beneficios del proxy**:
- CORS handling
- Oculta URLs del backend
- Centraliza manejo de errores
- Permite middleware adicional

### Backend Dependencies
- **futura-access-api** (puerto 5001): API backend principal

## ESTRUCTURA DE ARCHIVOS

```
futura-tickets-web-access-app/
├── app/
│   ├── api/                  # Next.js API Routes (proxy)
│   │   ├── access/route.ts
│   │   ├── accounts/login/route.ts
│   │   ├── accounts/validate/route.ts
│   │   └── attendants/[event]/route.ts
│   ├── account/page.tsx      # Página de perfil
│   ├── attendants/page.tsx   # Lista de asistentes
│   ├── login/page.tsx        # Login
│   ├── qrcode/page.tsx       # Escáner QR
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.scss
├── components/
│   ├── Account/Account.tsx
│   ├── Attendants/
│   │   ├── Attendants.tsx
│   │   └── AttendantsList/AttendantsList.tsx
│   ├── Login/Login.tsx
│   ├── QrCode/QrCode.tsx
│   ├── GlobalStateProvider/
│   │   ├── GlobalStateProvider.tsx
│   │   └── GlobalStateConstants.tsx
│   ├── FuturaAdminProvider.tsx    # Auth provider
│   └── RootProvider.tsx
├── shared/
│   ├── Menu/Menu.tsx
│   ├── services.tsx          # API calls
│   └── interfaces.tsx        # TypeScript types
└── public/assets/
```

## CONFIGURACIÓN

### Variables de Entorno
```env
NEXT_PUBLIC_FUTURA=http://localhost:3003          # App URL
NEXT_PUBLIC_FUTURA_API=http://localhost:5001      # Backend API
```

### Scripts NPM
```json
{
  "dev": "next dev -p 3003",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## FLUJO DE DATOS

### 1. Autenticación
```
Usuario → Login Form → /api/accounts/login → Backend
Backend → Token JWT → localStorage
App verifica token → /api/accounts/validate → Backend
Token válido → Redirect a /qrcode
Token inválido → Redirect a /login
```

### 2. Escaneo QR
```
QR Scanner → Detecta código → Extrae ticket ID
checkAccess(ticketId) → /api/access → Backend
Backend valida ticket → Response (GRANTED/DENIED)
UI muestra resultado con animación
Usuario cierra resultado → Scanner reactiva
```

### 3. Lista de Asistentes
```
Carga página → getAttendants(eventId) → Backend
Backend → Array de asistentes → Estado local
Usuario busca → Filtro local en memoria
```

## ESTADO GLOBAL

### GlobalState Interface
```typescript
{
  isConnected: boolean;
  address: string | undefined;
  menuState: boolean;
  account: Account | undefined;
  events: Event[];
}
```

### Account Interface
```typescript
{
  _id: string;
  name: string;
  lastName: string;
  email: string;
  accessEvent: {
    _id: string;
    name: string;
  };
  promoter: Promoter;
  role: Roles;
  token: string;
}
```

## BUGS CORREGIDOS (Revisión 2025)

### 1. QrCode.tsx - Estado PROCESSING duplicado
**Línea 48**: Se establecía estado PROCESSING dos veces
**Fix**: Primera vez mostrar PROCESSING, segunda vez mostrar resultado real

### 2. FuturaAdminProvider.tsx - Lógica invertida
**Línea 28**: `!isExpired` causaba redirect incorrecto
**Fix**: Cambiar a `tokenCheck.expired` y usar objeto completo

### 3. Attendants.tsx - Error state incorrecto
**Línea 46**: `setError(false)` en catch block
**Fix**: Cambiar a `setError(true)`

### 4. Menu.tsx - Rutas sin slash inicial
**Líneas 21,24,27**: `navigateTo('qrcode')` sin '/'
**Fix**: Agregar '/' inicial: `navigateTo('/qrcode')`

### 5. services.tsx - Manejo de errores deficiente
**Problema**: `.catch(async (err) => await err.json())` falla porque err no es Response
**Fix**: Implementar try-catch apropiado con validación de response.ok

### 6. Login.scss - Autoprefixer warning
**Línea 41**: `justify-content: end` deprecado
**Fix**: Cambiar a `justify-content: flex-end`

## MEJORAS IMPLEMENTADAS

- ✅ Actualización Next.js 15.1.0 → 15.5.5 (vulnerabilidades críticas)
- ✅ Actualización @babel/runtime (vulnerabilidad moderada)
- ✅ Corrección de bugs críticos en autenticación
- ✅ Mejora de manejo de errores en servicios
- ✅ Corrección de navegación
- ✅ Documentación completa (README.md)
- ✅ Variables de entorno documentadas (.env.example)
- ✅ Corrección de warnings de build

## DEPLOYMENT

### Docker
```bash
docker build -t futura-access-web-app .
docker run -p 3003:3000 futura-access-web-app
```

### Variables de Entorno Producción
```env
NEXT_PUBLIC_FUTURA=https://access.futuratickets.com
NEXT_PUBLIC_FUTURA_API=https://api.futuratickets.com
```

## TESTING

**Estado actual**: Sin tests implementados

**Recomendaciones**:
- Jest + React Testing Library para componentes
- Cypress/Playwright para E2E
- Tests de integración para API routes
- Tests unitarios para servicios

## SEGURIDAD

- ✅ JWT tokens para autenticación
- ✅ Tokens en Authorization header
- ✅ Validación automática de tokens
- ✅ Redirect automático si no autenticado
- ⚠️ localStorage (considerar cookies httpOnly para mayor seguridad)
- ⚠️ Faltan rate limits
- ⚠️ Faltan CSP headers

## DEPENDENCIAS CLAVE

```json
{
  "@ant-design/icons": "^5.6.1",
  "antd": "^5.22.5",
  "next": "^15.5.5",
  "qr-scanner": "^1.4.2",
  "react": "^19.0.0",
  "sass": "^1.83.0",
  "typescript": "5.9.3"
}
```

## RELACIÓN CON OTROS SISTEMAS

- **Backend**: futura-access-api (puerto 5001)
- **Base de datos**: MongoDB (via backend)
- **Contrato Web3**: No usa (a diferencia de futura-access-app-main)

## NOTAS IMPORTANTES

1. **No confundir con futura-access-app-main**: Esta es la versión WEB, la otra es mobile con Capacitor
2. **QR Format**: Espera QR en formato URL con ticket ID en posición [4] del split por '/'
3. **Proxy Pattern**: Todas las llamadas van a través de /api routes, no directamente al backend
4. **Estado Sincronizado**: GlobalState mantiene account info sincronizado en toda la app

## ESTADO FINAL

**Estado**: ✅ **COMPLETAMENTE REVISADO Y CORREGIDO**
**Build**: ✅ Exitoso
**Vulnerabilidades**: ✅ Ninguna
**Bugs conocidos**: ✅ Todos corregidos
**Documentación**: ✅ Completa

**Última revisión**: 2025-10-14
