# FuturaTickets Web Access App

Aplicación web de control de acceso para validadores de eventos (versión web de futura-access-app-main).

## Tecnologías

- **Framework**: Next.js 15.5.5 (App Router)
- **Lenguaje**: TypeScript
- **UI Library**: Ant Design 5.22.5
- **Estilos**: SASS/SCSS
- **QR Scanner**: qr-scanner 1.4.2
- **Puerto de desarrollo**: 3003

## Funcionalidades

- **Autenticación**: Login seguro para validadores con JWT tokens
- **Escaneo QR**: Validación de tickets mediante escaneo de códigos QR
- **Check-in/Check-out**: Control de acceso en tiempo real de asistentes
- **Lista de Asistentes**: Visualización y búsqueda de todos los asistentes del evento
- **Cuenta de Usuario**: Gestión del perfil y desconexión
- **Responsive**: Diseño adaptable para dispositivos móviles y tablets

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Backend API (futura-access-api) ejecutándose

## Instalación

1. Clonar el repositorio (si no está clonado)

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

Editar `.env.local` con las URLs correctas:
```env
NEXT_PUBLIC_FUTURA=http://localhost:3003
NEXT_PUBLIC_FUTURA_API=http://localhost:5001
```

## Desarrollo

Ejecutar servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3003](http://localhost:3003)

## Build

Crear build de producción:

```bash
npm run build
npm run start
```

## Estructura del Proyecto

```
futura-tickets-web-access-app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes (proxy al backend)
│   │   ├── access/           # Validación de tickets
│   │   ├── accounts/         # Login y validación de tokens
│   │   └── attendants/       # Lista de asistentes
│   ├── account/              # Página de perfil de usuario
│   ├── attendants/           # Página de lista de asistentes
│   ├── login/                # Página de login
│   ├── qrcode/               # Página de escaneo QR
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Página inicial (redirect a login)
│   └── globals.scss          # Estilos globales
├── components/               # Componentes React
│   ├── Account/              # Componente de cuenta de usuario
│   ├── Attendants/           # Componente de lista de asistentes
│   ├── Login/                # Componente de login
│   ├── QrCode/               # Componente de escáner QR
│   ├── GlobalStateProvider/  # Context API para estado global
│   ├── FuturaAdminProvider.tsx # Provider de autenticación
│   └── RootProvider.tsx      # Provider raíz
├── shared/                   # Utilidades compartidas
│   ├── Menu/                 # Menú de navegación inferior
│   ├── services.tsx          # Llamadas a la API
│   └── interfaces.tsx        # Tipos TypeScript
└── public/                   # Archivos estáticos
    └── assets/               # Imágenes y logos
```

## API Endpoints (Proxy)

La app utiliza Next.js API Routes como proxy al backend:

- `POST /api/accounts/login` - Login de usuarios
- `POST /api/accounts/validate` - Validación de token
- `PATCH /api/access` - Validar acceso de ticket
- `GET /api/attendants/[event]` - Obtener asistentes del evento

## Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Se valida contra el backend mediante `/api/accounts/login`
3. Token JWT se almacena en localStorage
4. Token se valida en cada carga mediante `/api/accounts/validate`
5. Token se envía en Authorization header para peticiones protegidas

## Estado Global

La aplicación utiliza React Context API para manejar:
- Estado de autenticación
- Información del usuario logueado
- Evento asignado al validador
- Estado del menú

## Seguridad

- Tokens JWT para autenticación
- Validación de tokens en cada carga de página
- Redirect automático a login si token expirado
- HTTPS recomendado en producción

## Mejoras Recientes

- ✅ Actualización a Next.js 15.5.5 (vulnerabilidades corregidas)
- ✅ Corrección de bugs críticos en validación de tokens
- ✅ Mejora del manejo de errores en servicios API
- ✅ Corrección de rutas de navegación
- ✅ Documentación de variables de entorno
- ✅ Corrección de warnings de build

## Docker

El proyecto incluye un Dockerfile para deployment:

```bash
docker build -t futura-access-web-app .
docker run -p 3003:3000 futura-access-web-app
```

## Troubleshooting

**Error de conexión a API**: Verificar que las variables de entorno estén correctamente configuradas y que el backend esté ejecutándose.

**Error de autenticación**: Limpiar localStorage y volver a hacer login.

**Problemas con QR Scanner**: Verificar permisos de cámara en el navegador.

## Licencia

Propiedad de FuturaTickets
