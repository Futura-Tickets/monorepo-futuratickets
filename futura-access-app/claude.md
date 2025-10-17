# FUTURA ACCESS APP - Documentación Técnica Completa

> **Repositorio:** `futura-access-app-main`
> **Tipo:** Mobile Application (React Native + Expo)
> **Propósito:** Aplicación móvil para control de acceso con escáner QR de tickets
> **Versión:** 1.0.0
> **Estado:** En desarrollo

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Pantallas y Componentes](#4-pantallas-y-componentes)
5. [Gestión de Estado](#5-gestión-de-estado)
6. [Servicios e Integraciones](#6-servicios-e-integraciones)
7. [Navegación](#7-navegación)
8. [Permisos y Configuración Nativa](#8-permisos-y-configuración-nativa)
9. [Autenticación y Seguridad](#9-autenticación-y-seguridad)
10. [Configuración y Variables de Entorno](#10-configuración-y-variables-de-entorno)
11. [Build y Deployment](#11-build-y-deployment)
12. [Dependencias con Otros Repositorios](#12-dependencias-con-otros-repositorios)
13. [Estado Actual del Proyecto](#13-estado-actual-del-proyecto)
14. [Tareas Pendientes y Próximos Pasos](#14-tareas-pendientes-y-próximos-pasos)
15. [Diagramas y Visualizaciones](#15-diagramas-y-visualizaciones)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito
**Futura Access App** es una aplicación móvil nativa desarrollada con **React Native + Expo** que permite al personal de control de acceso (rol ACCESS) validar tickets de eventos mediante **escaneo de códigos QR**. La app se conecta a `futura-access-api` para verificar la validez de los tickets en tiempo real.

### 1.2 Funcionalidades Principales
- ✅ **Login de personal ACCESS** con email y contraseña
- ✅ **Escaneo de códigos QR** con cámara del dispositivo
- ✅ **Validación en tiempo real** de tickets
- ✅ **Feedback visual** de acceso concedido/denegado
- ✅ **Persistencia de sesión** con AsyncStorage
- ✅ **Auto-login** al iniciar la app si hay token válido

### 1.3 Usuarios del Sistema
| Rol | Descripción | Funcionalidad |
|-----|-------------|---------------|
| **ACCESS** | Personal de control de acceso en eventos | Escanear QR, validar tickets, ver resultado |

### 1.4 Plataformas Soportadas
- ✅ **iOS** (iPhone/iPad)
- ✅ **Android** (smartphones/tablets)
- ⚠️ **Web** (configurado pero no optimizado)

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Stack Tecnológico

#### Framework Principal
- **Expo 52.0.27** - Framework para React Native
- **React Native 0.76.6** - Framework móvil multiplataforma
- **React 18.3.1** - Librería UI
- **TypeScript 5.3.3** - Lenguaje tipado

#### Navegación
- **React Navigation 7.x** - Sistema de navegación
  - `@react-navigation/native` 7.0.14
  - `@react-navigation/native-stack` 7.2.0

#### Cámara y QR
- **expo-camera 16.0.14** - Acceso a cámara del dispositivo
- **react-native-qrcode-scanner** - Escaneo de códigos QR (legacy, no usado actualmente)

#### Almacenamiento Local
- **@react-native-async-storage/async-storage 1.17.10** - Almacenamiento persistente

#### UI/UX
- **@ant-design/icons 5.6.0** - Iconos
- **React Native built-in components** - TextInput, TouchableOpacity, etc.

#### Build Tools
- **Babel** - Transpilador
- **Metro** - Bundler de React Native

### 2.2 Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                 │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Login   │  │  Events  │  │ Scanner  │      │
│  │  Screen  │  │  Screen  │  │  Screen  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
└───────┼─────────────┼─────────────┼────────────┘
        │             │             │
┌───────▼─────────────▼─────────────▼────────────┐
│              STATE MANAGEMENT                   │
│         (React Context + useReducer)            │
│  ┌──────────────────────────────────────┐      │
│  │     GlobalStateProvider              │      │
│  │  - connected: boolean                │      │
│  │  - account: Account                  │      │
│  │  - token: string                     │      │
│  │  - role: string                      │      │
│  └──────────────────────────────────────┘      │
└───────┬─────────────┬─────────────┬────────────┘
        │             │             │
┌───────▼─────────────▼─────────────▼────────────┐
│              SERVICE LAYER                      │
│  ┌──────────────────────────────────────┐      │
│  │  - loginAccount()                    │      │
│  │  - checkExpiration()                 │      │
│  │  - checkAccess()                     │      │
│  │  - getEvents()                       │      │
│  └──────────────┬───────────────────────┘      │
└─────────────────┼──────────────────────────────┘
                  │
        ┌─────────▼─────────┐
        │  futura-access-api │
        │  (Backend REST API)│
        └────────────────────┘
```

### 2.3 Patrones de Diseño

#### Patrones Implementados
- **Container/Presentational Pattern** - Separación de lógica y UI
- **Context API Pattern** - Estado global con React Context
- **Custom Hooks Pattern** - `useGlobalState()` para acceso al estado
- **Service Layer Pattern** - Abstracción de llamadas API

### 2.4 Flujo de Datos

```
User Action → Component → Service → API → Response
                ↓                            ↓
         Global State ← Update State ←───────┘
                ↓
          Re-render UI
```

---

## 3. ESTRUCTURA DEL PROYECTO

### 3.1 Árbol de Directorios

```
futura-access-app-main/
├── assets/                          # Recursos estáticos
│   ├── adaptive-icon.png           # Icono adaptativo Android
│   ├── favicon.png                 # Favicon web
│   ├── futura-tickets.png          # Logo de Futura Tickets
│   ├── icon.png                    # Icono de la app
│   ├── scan-white.png              # Icono de escaneo
│   └── splash-icon.png             # Splash screen
├── components/                      # Componentes React
│   ├── Events/                     # Pantalla de eventos (no usada)
│   │   └── index.tsx
│   ├── Login/                      # Pantalla de login
│   │   └── index.tsx
│   ├── Scanner/                    # Pantalla de escáner QR
│   │   └── index.tsx
│   ├── shared/                     # Código compartido
│   │   ├── interfaces.tsx          # Tipos e interfaces TypeScript
│   │   └── services.tsx            # Servicios de API
│   └── state.tsx                   # Gestión de estado global
├── ios/                            # Configuración nativa iOS
│   └── [archivos de Xcode]
├── .env                            # Variables de entorno
├── .gitignore                      # Archivos ignorados por git
├── App.tsx                         # Componente raíz - configuración de navegación
├── FuturaAccess.tsx                # Wrapper de la app - lógica de auth
├── app.json                        # Configuración de Expo
├── index.ts                        # Punto de entrada de la app
├── package.json                    # Dependencias del proyecto
├── tsconfig.json                   # Configuración TypeScript
└── README.md                       # Documentación básica
```

### 3.2 Descripción de Carpetas Principales

| Carpeta | Propósito | Archivos Clave |
|---------|-----------|----------------|
| `assets/` | Recursos estáticos (imágenes, iconos) | futura-tickets.png, scan-white.png |
| `components/` | Componentes React de la app | Login, Scanner, Events |
| `components/shared/` | Código compartido | services.tsx, interfaces.tsx |
| `ios/` | Configuración nativa iOS | Info.plist, Podfile |

---

## 4. PANTALLAS Y COMPONENTES

### 4.1 App.tsx - Raíz de la Aplicación

**Responsabilidad:** Configuración del sistema de navegación y estructura de la app.

```typescript
<GlobalStateProvider>           // Estado global
  <NavigationContainer>         // Contenedor de navegación
    <FuturaAccess>              // Wrapper de autenticación
      <Stack.Navigator>         // Navegación stack
        <Stack.Screen name="Login" />
        <Stack.Screen name="Scanner" />
      </Stack.Navigator>
    </FuturaAccess>
  </NavigationContainer>
</GlobalStateProvider>
```

**Características:**
- ✅ Inicialización de estado global
- ✅ Configuración de navegación
- ✅ No muestra header en ninguna pantalla (`headerShown: false`)
- ✅ Ruta inicial: `Login`

---

### 4.2 FuturaAccess.tsx - Wrapper de Autenticación

**Responsabilidad:** Verificar sesión activa al iniciar la app y redirigir automáticamente.

#### Flujo de Auto-Login
```typescript
1. Lee token de AsyncStorage
2. Si hay token:
   - Valida con API (checkExpiration)
   - Si válido → Navigate('Scanner')
   - Si inválido → Elimina token → Navigate('Login')
3. Si no hay token:
   - Navigate('Login')
```

**Código Clave:**
```typescript
const initAccount = async () => {
  const token = await AsyncStorage.getItem('@token');

  if (token) {
    const decodedToken = await checkExpiration();

    if (decodedToken?.account) {
      dispatch({ isConnected: true, account: decodedToken });
      navigateTo('Scanner');
    } else {
      await AsyncStorage.removeItem('@token');
      navigateTo('Login');
    }
  } else {
    navigateTo('Login');
  }
};
```

**Se ejecuta en:** `useEffect(() => { initAccount(); }, [])`

---

### 4.3 Login Screen (`components/Login/index.tsx`)

**Responsabilidad:** Autenticación de personal ACCESS.

#### UI Components
```
┌─────────────────────────────────────┐
│                                     │
│        Access Control               │  ← Título
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Email                       │ │  ← Input email
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Password (oculto)           │ │  ← Input password
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │        LOG IN                 │ │  ← Botón login
│  └───────────────────────────────┘ │
│                                     │
│        [Logo Futura Tickets]        │
│                                     │
└─────────────────────────────────────┘
```

#### Estado Local
```typescript
interface LoginState {
  email: string;
  password: string;
}
```

#### Flujo de Login
```
1. Usuario ingresa email y password
2. Click en "Log In"
3. setLoadingState(true)
4. Llamada a loginAccount({ email, password })
5. Si success:
   - Guardar token, email, role en AsyncStorage
   - Actualizar estado global
   - Navigate('Scanner')
6. setLoadingState(false)
```

#### Almacenamiento de Datos
```typescript
AsyncStorage.setItem('@token', token);
AsyncStorage.setItem('@userId', email);
AsyncStorage.setItem('@userId', role);  // ⚠️ BUG: sobrescribe @userId
```

**⚠️ BUG DETECTADO:** El role sobrescribe el userId (línea 29 del código).

#### Estilos
- **Color principal:** `#00948a` (verde azulado)
- **Fondo:** Blanco
- **Inputs:** Borde gris claro, padding 12px, border-radius 8px
- **Botón:** Fondo verde, texto blanco, uppercase, italic

---

### 4.4 Scanner Screen (`components/Scanner/index.tsx`)

**Responsabilidad:** Escaneo de códigos QR y validación de tickets.

#### UI Components
```
┌─────────────────────────────────────┐
│                                     │
│     [Vista de Cámara en Vivo]       │
│                                     │
│         ┌───────────────┐           │
│         │               │           │
│         │  [QR Frame]   │  ← Icono scan
│         │               │           │
│         └───────────────┘           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ACCESS GRANTED/DENIED      │   │  ← Resultado
│  │  Reason...                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │         NEXT                │   │  ← Botón continuar
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

#### Estado Local
```typescript
const [scanResult, setScanResult] = useState<{
  access: string;
  reason: string;
}>();
const [cameraStatus, setCameraStatus] = useState<boolean>(true);
const [permission, requestPermission] = useCameraPermissions();
```

#### Flujo de Escaneo
```
1. Cámara activa esperando QR
2. Usuario escanea QR code
3. onBarcodeScanned → onSuccess()
4. Pausa preview de cámara
5. setCameraStatus(false)
6. ⚠️ HARDCODED:
   - const test = 'https://event.futuratickets.com/verify/675c45f89ecc7fdb2f6a7389'
   - const ticket = test.split('/')[4]
7. Llamada a checkAccess(ticket)
8. Muestra resultado (GRANTED/DENIED)
9. Usuario click "Next"
10. resumeCamera() → vuelve a paso 1
```

**⚠️ ISSUE CRÍTICO:**
- **Línea 39:** El código QR escaneado NO se usa, se usa un valor hardcoded
- **Línea 40:** Se extrae el ID del ticket del URL hardcoded

**Código Problemático:**
```typescript
const test = 'https://event.futuratickets.com/verify/675c45f89ecc7fdb2f6a7389'
const ticket = test.split('/')[4];  // Siempre el mismo ticket
const access = await checkAccess(ticket);
```

**Debería ser:**
```typescript
const ticket = scanningResult.data.split('/')[4];  // Usar datos escaneados
const access = await checkAccess(ticket);
```

#### Gestión de Escaneo
```typescript
let scanning = false;  // Variable global para evitar escaneos múltiples

if (!scanning) {
  scanning = true;
  // ... proceso de escaneo
  setTimeout(() => { scanning = false; }, 1000);
}
```

#### Permisos de Cámara
```typescript
const [permission, requestPermission] = useCameraPermissions();

if (!permission.granted) {
  return (
    <View>
      <Text>We need your permission to show the camera</Text>
      <Button onPress={requestPermission}>Grant Permission</Button>
    </View>
  );
}
```

#### Estilos de Resultado
- **ACCESS GRANTED:** Fondo verde `#00948a`, texto blanco
- **ACCESS DENIED:** Fondo rojo `#fe5456`, texto blanco
- **Reason:** Texto negro, font-size 21, bold

---

### 4.5 Events Screen (`components/Events/index.tsx`)

**Estado:** ⚠️ Comentado en la navegación (no se usa actualmente)

**Propósito Original:** Listar eventos disponibles antes de escanear

**Nota:** La app actualmente va directo de Login → Scanner sin selección de evento.

---

## 5. GESTIÓN DE ESTADO

### 5.1 GlobalStateProvider (`components/state.tsx`)

**Implementación:** React Context API + useReducer

#### Estado Global
```typescript
interface GlobalState {
  eventId: number | undefined;     // ID del evento activo
  token: string | undefined;       // JWT token
  role: string | undefined;        // Rol del usuario (ACCESS)
  connected: boolean;              // Estado de autenticación
  account: string | undefined;     // Email/ID de la cuenta
}
```

#### Valores por Defecto
```typescript
const defaultGlobalState: GlobalState = {
  eventId: undefined,
  token: undefined,
  role: undefined,
  connected: false,
  account: undefined,
};
```

#### Reducer
```typescript
const [state, dispatch] = React.useReducer(
  (state, newValue) => ({ ...state, ...newValue }),  // Merge state
  defaultGlobalState
);
```

#### Hook de Acceso
```typescript
export const useGlobalState = () => [
  React.useContext(GlobalStateContext),
  React.useContext(DispatchStateContext),
];
```

#### Uso en Componentes
```typescript
const [state, dispatch] = useGlobalState();

// Leer estado
console.log(state.connected);
console.log(state.account);

// Actualizar estado
dispatch({
  connected: true,
  account: 'user@example.com',
  token: 'jwt_token_here'
});
```

---

## 6. SERVICIOS E INTEGRACIONES

### 6.1 Services Layer (`components/shared/services.tsx`)

**Responsabilidad:** Abstracción de llamadas HTTP a la API backend.

#### Base URL
⚠️ **HARDCODED:** `http://192.168.1.135:3000`

**Debería usarse:** Variable de entorno desde `.env`

---

#### 6.1.1 loginAccount()

**Descripción:** Autenticación de personal ACCESS

**Endpoint:** `POST http://192.168.1.135:3000/accounts/login`

**Request:**
```typescript
{
  loginAccount: {
    email: string,
    password: string
  }
}
```

**Response:**
```typescript
interface Account {
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  promoter: Promoter;
  role?: Roles;
  token?: string;
  // ...
}
```

**Código:**
```typescript
export async function loginAccount(loginAccount: LoginAccount): Promise<Account> {
  return await fetch(`http://192.168.1.135:3000/accounts/login`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ loginAccount })
  }).then(async(response) => response.json())
    .catch((err) => console.log(err));
}
```

---

#### 6.1.2 checkExpiration()

**Descripción:** Validar si el token JWT es válido y no ha expirado

**Endpoint:** `POST http://192.168.1.135:3000/accounts/validate`

**Request:**
```typescript
{
  token: string  // JWT token desde AsyncStorage
}
```

**Response:**
```typescript
interface DecodedToken {
  _id: string;
  account: string;
  name: string;
  lastName: string;
  email: string;
  address: string;
  role: string;
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

**Uso:**
```typescript
const decodedToken = await checkExpiration();
if (decodedToken && decodedToken.account) {
  // Token válido
} else {
  // Token inválido o expirado
}
```

---

#### 6.1.3 checkAccess()

**Descripción:** Validar acceso de un ticket (check-in)

**Endpoint:** `PATCH http://192.168.1.135:3000/admin/events/access`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```typescript
{
  sale: string  // ID del ticket/sale
}
```

**Response:**
```typescript
{
  access: "ACCESS GRANTED" | "ACCESS DENIED",
  reason: string,
  name?: string,
  email?: string,
  type?: string,
  price?: number
}
```

**Código:**
```typescript
export async function checkAccess(sale: string): Promise<{ access: string; reason: string; }> {
  return await fetch(`http://192.168.1.135:3000/admin/events/access`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await AsyncStorage.getItem('@token')}`
    },
    body: JSON.stringify({ sale })
  }).then(async(response) => response.json())
    .catch(async (err) => await err.json());
}
```

---

#### 6.1.4 getEvents()

**Descripción:** Obtener lista de eventos (no se usa actualmente)

**Endpoint:** `GET http://192.168.1.135:3000/admin/events`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```typescript
interface Event {
  _id: string;
  name: string;
  status: string;
}[]
```

---

### 6.2 Almacenamiento Local (AsyncStorage)

#### Datos Almacenados
| Key | Valor | Uso |
|-----|-------|-----|
| `@token` | JWT token | Autenticación en requests |
| `@userId` | Email del usuario | Identificación (⚠️ sobrescrito por role) |

#### Operaciones
```typescript
// Guardar
await AsyncStorage.setItem('@token', token);

// Leer
const token = await AsyncStorage.getItem('@token');

// Eliminar
await AsyncStorage.removeItem('@token');
```

---

## 7. NAVEGACIÓN

### 7.1 Stack Navigator

**Librería:** `@react-navigation/native-stack`

#### Configuración
```typescript
const Stack = createNativeStackNavigator<RootParamList>();

<Stack.Navigator
  initialRouteName="Login"
  screenOptions={{ headerShown: false }}
>
  <Stack.Screen name="Login" component={Login} />
  <Stack.Screen name="Scanner" component={Scanner} />
</Stack.Navigator>
```

#### Rutas Disponibles
```typescript
type RootParamList = {
  Login: undefined;           // Sin parámetros
  Events: undefined;          // (comentado)
  Scanner: { event: string }; // Recibe ID de evento
};
```

### 7.2 Flujo de Navegación

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ FuturaAccess    │ ← Verifica token
│ initAccount()   │
└────┬────────────┘
     │
     ├─── Token válido ───────────────┐
     │                                │
     │                                ▼
     │                        ┌───────────────┐
     │                        │   Scanner     │
     ▼                        └───────────────┘
┌─────────────────┐
│     Login       │
└────┬────────────┘
     │
     │ Autenticación exitosa
     │
     ▼
┌─────────────────┐
│    Scanner      │
└─────────────────┘
```

### 7.3 Navegación Programática

```typescript
// En componentes con navigation prop
navigation.navigate('Scanner');

// Con NavigationContainerRef
navigatorRef.current?.navigate('Scanner');
```

---

## 8. PERMISOS Y CONFIGURACIÓN NATIVA

### 8.1 Configuración Expo (`app.json`)

```json
{
  "expo": {
    "name": "futura-access-app",
    "slug": "futura-access-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.anonymous.futura-access-app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ]
    ]
  }
}
```

### 8.2 Permisos Requeridos

#### iOS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your camera</string>
<key>NSMicrophoneUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your microphone</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### 8.3 Gestión de Permisos en Runtime

```typescript
import { useCameraPermissions } from 'expo-camera';

const [permission, requestPermission] = useCameraPermissions();

if (!permission) {
  return <View />; // Loading...
}

if (!permission.granted) {
  return (
    <Button onPress={requestPermission}>
      Grant Permission
    </Button>
  );
}

// Permiso concedido, mostrar cámara
```

---

## 9. AUTENTICACIÓN Y SEGURIDAD

### 9.1 Flujo de Autenticación Completo

```
┌────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                      │
└────────────────────────────────────────────────────────────┘

    Usuario                   App                    API
       │                       │                      │
       │  Abre app             │                      │
       ├──────────────────────►│                      │
       │                       │                      │
       │                       │ Lee @token           │
       │                       │ de AsyncStorage      │
       │                       ├──────────┐           │
       │                       │          │           │
       │                       │◄─────────┘           │
       │                       │                      │
       │             ┌─────────┴─────────┐            │
       │             │ ¿Token existe?    │            │
       │             └─────────┬─────────┘            │
       │                       │                      │
       │          ┌────────────┼────────────┐         │
       │          │ SÍ                      │ NO      │
       │          │                         │         │
       │          ▼                         ▼         │
       │    checkExpiration()          Navigate      │
       │          │                    to Login       │
       │          ├────────────────────────────────►  │
       │          │ POST /validate                │   │
       │          │ { token }                     │   │
       │          │                               │   │
       │          │ ◄─────────────────────────────┤   │
       │          │ DecodedToken                  │   │
       │          │                               │   │
       │    ┌─────▼─────┐                         │   │
       │    │¿Válido?   │                         │   │
       │    └─────┬─────┘                         │   │
       │      │       │                           │   │
       │    ┌─┘       └─┐                         │   │
       │   SÍ          NO                         │   │
       │    │            │                         │   │
       │    ▼            ▼                         │   │
       │ Scanner     Remove token                 │   │
       │             Navigate Login               │   │
       │                       │                   │   │
       │◄──────────────────────┘                   │   │
       │ Muestra Login                             │   │
       │                                           │   │
       │ Ingresa credenciales                      │   │
       │ email + password                          │   │
       ├──────────────────────►│                   │   │
       │                       │ loginAccount()    │   │
       │                       ├───────────────────┼──►│
       │                       │ POST /login       │   │
       │                       │ { email, password}│   │
       │                       │                   │   │
       │                       │◄──────────────────┼───┤
       │                       │ Account + token   │   │
       │                       │                   │   │
       │                       │ Store token       │   │
       │                       │ AsyncStorage      │   │
       │                       ├──────────┐        │   │
       │                       │          │        │   │
       │                       │◄─────────┘        │   │
       │                       │                   │   │
       │                       │ Update state      │   │
       │                       │ Navigate Scanner  │   │
       │                       │                   │   │
       │◄──────────────────────┤                   │   │
       │ Muestra Scanner       │                   │   │
       │                       │                   │   │
```

### 9.2 Almacenamiento de Token

**⚠️ SEGURIDAD:** AsyncStorage NO es encriptado en Android

**Recomendación:** Usar **expo-secure-store** para almacenamiento seguro

```typescript
// Actual (inseguro)
await AsyncStorage.setItem('@token', token);

// Recomendado (seguro)
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('token', token);
```

### 9.3 Headers de Autenticación

```typescript
headers: {
  'Authorization': `Bearer ${await AsyncStorage.getItem('@token')}`
}
```

### 9.4 Validación de Token

**Frecuencia:** Solo al iniciar la app

**Recomendación:** Validar también antes de operaciones críticas

---

## 10. CONFIGURACIÓN Y VARIABLES DE ENTORNO

### 10.1 Variables de Entorno (`.env`)

```bash
NEXT_PUBLIC_FUTURA_API=http://localhost:3000
NEXT_PUBLIC_FUTURA=http://localhost:3001
```

**⚠️ PROBLEMA:** Las variables NO se usan en el código

**Actual:**
```typescript
const url = 'http://192.168.1.135:3000/accounts/login';  // Hardcoded
```

**Debería ser:**
```typescript
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.API_URL;
const url = `${API_URL}/accounts/login`;
```

### 10.2 Configuración Recomendada

#### app.json
```json
{
  "expo": {
    "extra": {
      "API_URL": "http://192.168.1.135:3000",
      "ENV": "development"
    }
  }
}
```

#### Acceso en código
```typescript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3000';
```

---

## 11. BUILD Y DEPLOYMENT

### 11.1 Scripts npm

```json
{
  "start": "expo start",           // Desarrollo
  "android": "expo run:android",   // Build Android
  "ios": "expo run:ios",           // Build iOS
  "web": "expo start --web"        // Web (experimental)
}
```

### 11.2 Desarrollo Local

#### Iniciar servidor de desarrollo
```bash
npm start
```

**Opciones:**
- Presionar `i` → Abrir en simulador iOS
- Presionar `a` → Abrir en emulador Android
- Escanear QR con Expo Go app

### 11.3 Build para Producción

#### Android APK/AAB
```bash
# Usando EAS Build (Expo Application Services)
npm install -g eas-cli
eas login
eas build --platform android

# O build local
expo run:android --variant release
```

#### iOS IPA
```bash
# Requiere cuenta de Apple Developer
eas build --platform ios

# O build local (requiere Mac + Xcode)
expo run:ios --configuration Release
```

### 11.4 Deployment

#### Google Play Store
1. Build AAB con EAS
2. Subir a Google Play Console
3. Completar información de la app
4. Enviar a revisión

#### Apple App Store
1. Build IPA con EAS
2. Subir a App Store Connect
3. Completar información de la app
4. Enviar a revisión

### 11.5 Over-the-Air (OTA) Updates

**Con Expo Updates:**
```bash
expo publish
```

**Usuarios recibirán actualizaciones automáticamente sin reinstalar**

---

## 12. DEPENDENCIAS CON OTROS REPOSITORIOS

### 12.1 Diagrama de Dependencias

```
┌──────────────────────────────┐
│   futura-access-app-main     │
│   (Esta App Móvil)           │
└──────────────┬───────────────┘
               │
               │ Consume API
               │
               ▼
┌──────────────────────────────┐
│   futura-access-api-main     │
│   (Backend REST API)         │
└──────────────┬───────────────┘
               │
               │ Lee datos
               │
               ▼
┌──────────────────────────────┐
│      MongoDB Atlas           │
│   (Base de Datos)            │
└──────────────────────────────┘
```

### 12.2 Endpoints Consumidos

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/accounts/login` | POST | Autenticación |
| `/accounts/validate` | POST | Validación de token |
| `/admin/events/access` | PATCH | Check-in de ticket |
| `/admin/events` | GET | Listar eventos (no usado) |

### 12.3 Modelos Compartidos

#### Account
```typescript
interface Account {
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  promoter: Promoter;
  phone?: string;
  address?: string;
  role?: Roles;
  token?: string;
}
```

#### DecodedToken
```typescript
interface DecodedToken {
  _id: string;
  account: string;
  name: string;
  lastName: string;
  email: string;
  address: string;
  role: string;
  iat: number;
  exp: number;
}
```

---

## 13. ESTADO ACTUAL DEL PROYECTO

### 13.1 Funcionalidades Implementadas ✅

#### Autenticación
- ✅ Login con email y password
- ✅ Almacenamiento de token en AsyncStorage
- ✅ Auto-login al abrir app
- ✅ Validación de token en inicio

#### Escaneo QR
- ✅ Acceso a cámara del dispositivo
- ✅ Escaneo de códigos QR
- ✅ Permisos de cámara en runtime

#### Validación de Tickets
- ✅ Llamada a API de validación
- ✅ Feedback visual (GRANTED/DENIED)
- ✅ Botón "Next" para siguiente escaneo

#### UI/UX
- ✅ Diseño limpio y funcional
- ✅ Navegación fluida
- ✅ Loading states

### 13.2 Bugs Críticos 🐛

#### 1. QR Escaneado NO se Usa (Scanner.tsx:39-40)
```typescript
// ❌ ACTUAL
const test = 'https://event.futuratickets.com/verify/675c45f89ecc7fdb2f6a7389'
const ticket = test.split('/')[4];

// ✅ DEBERÍA SER
const ticket = scanningResult.data.split('/')[4];
```

**Impacto:** CRÍTICO - La app NO valida tickets reales, siempre valida el mismo ID hardcoded.

---

#### 2. URL de API Hardcoded (services.tsx)
```typescript
// ❌ ACTUAL
const url = 'http://192.168.1.135:3000/accounts/login';

// ✅ DEBERÍA SER
const url = `${API_URL}/accounts/login`;
```

**Impacto:** ALTO - No funciona fuera de la red local del desarrollador.

---

#### 3. Role Sobrescribe userId (Login/index.tsx:29)
```typescript
// ❌ ACTUAL
await AsyncStorage.setItem('@userId', email);
await AsyncStorage.setItem('@userId', role);  // Sobrescribe línea anterior

// ✅ DEBERÍA SER
await AsyncStorage.setItem('@userId', email);
await AsyncStorage.setItem('@userRole', role);
```

**Impacto:** MEDIO - Se pierde el userId en AsyncStorage.

---

#### 4. Variables .env NO se Usan
```bash
# Archivo .env existe pero no se consume
NEXT_PUBLIC_FUTURA_API=http://localhost:3000
```

**Impacto:** MEDIO - Configuración inútil, URLs hardcoded.

---

### 13.3 Funcionalidades Faltantes ❌

#### Gestión de Errores
- ❌ No hay manejo de errores de red
- ❌ No hay retry logic
- ❌ No hay mensajes de error al usuario
- ❌ No hay timeout en requests

#### Validación de Datos
- ❌ No valida formato de email
- ❌ No valida longitud de password
- ❌ No sanitiza inputs

#### UX
- ❌ No hay indicador de carga durante validación
- ❌ No hay sonido/vibración en escaneo
- ❌ No hay historial de escaneos
- ❌ No hay estadísticas (tickets validados hoy)

#### Seguridad
- ❌ Token NO encriptado (AsyncStorage plano)
- ❌ No hay refresh tokens
- ❌ No hay logout
- ❌ No hay timeout de sesión

#### Offline Support
- ❌ No funciona sin internet
- ❌ No hay queue de escaneos offline
- ❌ No hay sincronización posterior

---

## 14. TAREAS PENDIENTES Y PRÓXIMOS PASOS

### 14.1 Prioridad Crítica 🔴

#### BUG FIXES
- [ ] **FIX: Usar QR escaneado real** (Scanner.tsx:39-40)
  ```typescript
  - const test = 'https://event.futuratickets.com/verify/675c45f89ecc7fdb2f6a7389'
  - const ticket = test.split('/')[4];
  + const scannedUrl = scanningResult.data;
  + const ticket = scannedUrl.split('/').pop();
  ```

- [ ] **FIX: Implementar variables de entorno**
  ```typescript
  // services.tsx
  import Constants from 'expo-constants';
  const API_URL = Constants.expoConfig?.extra?.API_URL;
  ```

- [ ] **FIX: Corregir almacenamiento de role**
  ```typescript
  - await AsyncStorage.setItem('@userId', role);
  + await AsyncStorage.setItem('@userRole', role);
  ```

#### Seguridad
- [ ] **Migrar a expo-secure-store** para tokens
  ```bash
  npx expo install expo-secure-store
  ```

- [ ] **Implementar logout**
  - Botón de logout en Scanner
  - Limpiar AsyncStorage
  - Navigate a Login

---

### 14.2 Prioridad Alta 🟡

#### Manejo de Errores
- [ ] **Try-catch en todas las llamadas API**
  ```typescript
  try {
    const result = await checkAccess(ticket);
  } catch (error) {
    Alert.alert('Error', 'No se pudo validar el ticket');
  }
  ```

- [ ] **Timeout en requests HTTP**
  ```typescript
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  fetch(url, { signal: controller.signal });
  ```

#### UX Improvements
- [ ] **Loading indicator durante validación**
  ```typescript
  const [validating, setValidating] = useState(false);
  // Mostrar spinner mientras valida
  ```

- [ ] **Vibración al escanear**
  ```typescript
  import * as Haptics from 'expo-haptics';
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  ```

- [ ] **Sonido de escaneo**
  ```typescript
  import { Audio } from 'expo-av';
  const { sound } = await Audio.Sound.createAsync(require('./beep.mp3'));
  await sound.playAsync();
  ```

#### Validación de Inputs
- [ ] **Validar email en Login**
  ```typescript
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Alert.alert('Error', 'Email inválido');
    return;
  }
  ```

---

### 14.3 Prioridad Media 🟢

#### Features
- [ ] **Historial de escaneos**
  - Almacenar últimos 50 escaneos en AsyncStorage
  - Pantalla de historial con filtros

- [ ] **Estadísticas de sesión**
  - Tickets validados hoy
  - Ratio GRANTED/DENIED
  - Gráfico de escaneos por hora

- [ ] **Soporte offline**
  - Queue de escaneos cuando no hay internet
  - Sincronización automática al recuperar conexión
  - Modo offline con validación local (blockchain)

#### Testing
- [ ] **Tests unitarios** con Jest
  - Tests de componentes
  - Tests de servicios
  - Coverage mínimo 70%

- [ ] **Tests E2E** con Detox
  - Flujo de login
  - Flujo de escaneo
  - Manejo de errores

#### DevOps
- [ ] **CI/CD con GitHub Actions**
  - Build automático
  - Tests automáticos
  - Deploy a Expo

---

### 14.4 Roadmap por Fases

#### Fase 1: Fixes Críticos (1 semana)
1. Corregir bug de QR hardcoded
2. Implementar variables de entorno
3. Migrar a expo-secure-store
4. Añadir manejo de errores básico

#### Fase 2: UX (1 semana)
1. Loading indicators
2. Validación de inputs
3. Vibración y sonido
4. Logout

#### Fase 3: Features (2 semanas)
1. Historial de escaneos
2. Estadísticas
3. Modo offline básico

#### Fase 4: Testing y Deploy (1 semana)
1. Tests unitarios
2. Tests E2E
3. Build para stores
4. Documentación de usuario

---

## 15. DIAGRAMAS Y VISUALIZACIONES

### 15.1 Flujo Completo de Uso

```
┌────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                          │
└────────────────────────────────────────────────────────────┘

    Personal ACCESS              App                  API
         │                        │                    │
         │  Abre app              │                    │
         ├───────────────────────►│                    │
         │                        │                    │
         │                        │ ¿Token?            │
         │                        ├────────┐           │
         │                        │        │           │
         │                        │◄───────┘           │
         │                        │ NO                 │
         │                        │                    │
         │◄───────────────────────┤                    │
         │ Pantalla Login         │                    │
         │                        │                    │
         │ Ingresa email/password │                    │
         ├───────────────────────►│                    │
         │                        │ POST /login        │
         │                        ├────────────────────►│
         │                        │                    │
         │                        │◄───────────────────┤
         │                        │ token + account    │
         │                        │                    │
         │◄───────────────────────┤                    │
         │ Pantalla Scanner       │                    │
         │                        │                    │
         │ Apunta cámara a QR     │                    │
         ├───────────────────────►│                    │
         │                        │ Detecta QR         │
         │                        │                    │
         │                        │ ⚠️ HARDCODED       │
         │                        │ ticket_id          │
         │                        │                    │
         │                        │ PATCH /access      │
         │                        ├────────────────────►│
         │                        │ { sale: id }       │
         │                        │                    │
         │                        │◄───────────────────┤
         │                        │ { access, reason } │
         │                        │                    │
         │◄───────────────────────┤                    │
         │ Muestra resultado      │                    │
         │ GRANTED/DENIED         │                    │
         │                        │                    │
         │ Click "Next"           │                    │
         ├───────────────────────►│                    │
         │                        │ Resume cámara      │
         │◄───────────────────────┤                    │
         │ Listo para siguiente   │                    │
         │                        │                    │
```

### 15.2 Arquitectura de Componentes

```
┌───────────────────────────────────────────────────────────┐
│                       APP STRUCTURE                        │
└───────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   App.tsx    │
                    │  (Root)      │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │   Global    │  │ Navigation  │  │  Futura     │
   │   State     │  │ Container   │  │  Access     │
   │  Provider   │  │             │  │  (Auth)     │
   └─────────────┘  └──────┬──────┘  └──────┬──────┘
                           │                │
                           │   initAccount() │
                           │                │
                    ┌──────▼────────────────▼──────┐
                    │     Stack Navigator          │
                    └──────┬──────────────┬────────┘
                           │              │
                 ┌─────────┼──────────────┼─────────┐
                 │         │              │         │
                 ▼         ▼              ▼         ▼
           ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
           │  Login  │ │ Events  │ │ Scanner │ │ (más)   │
           │ Screen  │ │ (unused)│ │ Screen  │ │         │
           └────┬────┘ └─────────┘ └────┬────┘ └─────────┘
                │                       │
                │                       │
                ▼                       ▼
          ┌──────────┐           ┌──────────┐
          │ Login    │           │ Camera   │
          │ Service  │           │ Scanner  │
          └────┬─────┘           └────┬─────┘
               │                      │
               ▼                      ▼
         ┌──────────────────────────────┐
         │      Access API              │
         │  /login  /validate  /access  │
         └──────────────────────────────┘
```

### 15.3 Data Flow - Escaneo de Ticket

```
┌────────────────────────────────────────────────────────────┐
│                    QR SCAN DATA FLOW                        │
└────────────────────────────────────────────────────────────┘

  Camera                Scanner              Services         API
    │                     │                     │              │
    │  QR Detected        │                     │              │
    ├────────────────────►│                     │              │
    │  scanningResult     │                     │              │
    │                     │                     │              │
    │                     │ ⚠️ IGNORE QR DATA   │              │
    │                     │ Use hardcoded URL   │              │
    │                     ├──────────┐          │              │
    │                     │          │          │              │
    │                     │◄─────────┘          │              │
    │                     │                     │              │
    │                     │ pausePreview()      │              │
    │◄────────────────────┤                     │              │
    │                     │                     │              │
    │                     │ checkAccess(ticket) │              │
    │                     ├────────────────────►│              │
    │                     │                     │              │
    │                     │                     │ fetch()      │
    │                     │                     │ PATCH /access│
    │                     │                     ├─────────────►│
    │                     │                     │              │
    │                     │                     │◄─────────────┤
    │                     │                     │ Response     │
    │                     │◄────────────────────┤              │
    │                     │ { access, reason }  │              │
    │                     │                     │              │
    │                     │ setScanResult()     │              │
    │                     ├──────────┐          │              │
    │                     │          │          │              │
    │                     │◄─────────┘          │              │
    │                     │                     │              │
    │                     │ Re-render UI        │              │
    │                     │ Show result         │              │
    │                     │                     │              │
    │                     │ User clicks "Next"  │              │
    │  resumePreview()    │                     │              │
    │◄────────────────────┤                     │              │
    │                     │                     │              │
    │  Ready for next QR  │                     │              │
    │                     │                     │              │
```

---

## 16. CONCLUSIONES Y RECOMENDACIONES

### 16.1 Fortalezas del Proyecto ✅
1. **Tecnología moderna** - React Native + Expo = desarrollo rápido
2. **UI limpia** - Diseño simple y funcional
3. **Autenticación implementada** - Login y persistencia de sesión
4. **Cámara integrada** - Escaneo QR funcional a nivel técnico

### 16.2 Debilidades Críticas ⚠️
1. **Bug crítico:** QR escaneado NO se usa, se valida siempre el mismo ticket
2. **URLs hardcoded:** No funciona fuera de la red del desarrollador
3. **Sin manejo de errores:** App se rompe si falla la red
4. **Seguridad débil:** Token en AsyncStorage sin encriptar

### 16.3 Recomendaciones Inmediatas 🎯

#### Para Desarrollo
1. **Corregir bug de QR** URGENTE (1 hora)
2. **Implementar variables de entorno** (2 horas)
3. **Añadir manejo de errores** (1 día)
4. **Migrar a expo-secure-store** (2 horas)

#### Para Producción
1. **Testing exhaustivo** con tickets reales
2. **Build beta** y distribuir con TestFlight/Firebase
3. **Recoger feedback** de usuarios reales
4. **Monitoreo con Sentry** para errores en producción

#### Para UX
1. **Loading indicators** en todas las operaciones
2. **Feedback háptico** (vibración) al escanear
3. **Sonido** de confirmación
4. **Historial** de escaneos

---

## ANEXOS

### A. Comandos Útiles

```bash
# Desarrollo
npm start                # Iniciar Expo
npm run android          # Abrir en Android
npm run ios              # Abrir en iOS (requiere Mac)

# Build
eas build --platform android
eas build --platform ios

# Publicar actualizaciones OTA
expo publish
```

### B. Troubleshooting

#### Error: "No bundle URL present"
```bash
rm -rf node_modules
npm install
npm start -- --reset-cache
```

#### Error: "Camera permission denied"
```bash
# Eliminar app del dispositivo
# Reinstalar
# Aceptar permisos
```

#### Error: "Network request failed"
```bash
# Verificar que la API está corriendo
# Verificar URL en services.tsx
# Verificar que están en la misma red
```

---

**FIN DEL DOCUMENTO**
