# Claude.md - Futura Tickets Access App

## 📋 ÍNDICE

1. [Información General del Proyecto](#1-información-general-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Proyecto](#3-arquitectura-del-proyecto)
4. [Estructura de Directorios](#4-estructura-de-directorios)
5. [Configuración y Entorno](#5-configuración-y-entorno)
6. [Guía de Desarrollo](#6-guía-de-desarrollo)
7. [Componentes del Sistema](#7-componentes-del-sistema)
8. [Rutas y Navegación](#8-rutas-y-navegación)
9. [Estilos y Temas](#9-estilos-y-temas)
10. [Testing](#10-testing)
11. [Scripts Disponibles](#11-scripts-disponibles)
12. [Convenciones de Código](#12-convenciones-de-código)
13. [Gestión de Estado](#13-gestión-de-estado)
14. [Integración con APIs](#14-integración-con-apis)
15. [Despliegue](#15-despliegue)
16. [Troubleshooting](#16-troubleshooting)
17. [Roadmap y TODOs](#17-roadmap-y-todos)

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### 1.1 Descripción
**Futura Tickets Access App** es una aplicación móvil multiplataforma construida con Expo y React Native, diseñada para gestionar el control de acceso a eventos mediante tickets digitales.

### 1.2 Metadatos del Proyecto
```json
{
  "nombre": "futura-access-app",
  "versión": "1.0.0",
  "tipo": "Aplicación móvil cross-platform",
  "plataformas": ["iOS", "Android", "Web"],
  "scheme": "myapp",
  "orientación": "portrait"
}
```

### 1.3 Características Principales
- ✅ Control de acceso mediante tickets digitales
- ✅ Soporte para modo claro/oscuro automático
- ✅ Navegación por pestañas (tabs)
- ✅ Interfaz responsive para múltiples dispositivos
- ✅ Soporte para iOS, Android y Web
- ✅ Nueva arquitectura de React Native habilitada
- ✅ Enrutamiento tipado con Expo Router

### 1.4 Estado Actual
- **Fase**: Desarrollo inicial / Plantilla base configurada
- **Nueva Arquitectura**: ✅ Habilitada (`newArchEnabled: true`)
- **TypeScript**: ✅ Modo estricto activado
- **Typed Routes**: ✅ Experimental activado

---

## 2. STACK TECNOLÓGICO

### 2.1 Framework Principal
```typescript
{
  "framework": "Expo SDK 52",
  "runtime": "React Native 0.76.5",
  "react": "18.3.1",
  "lenguaje": "TypeScript 5.3.3"
}
```

### 2.2 Dependencias Core
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `expo` | ~52.0.18 | Framework base |
| `expo-router` | 4.0.11 | Sistema de navegación file-based |
| `react-native` | 0.76.5 | Runtime nativo |
| `typescript` | ^5.3.3 | Tipado estático |

### 2.3 Navegación
| Paquete | Versión | Uso |
|---------|---------|-----|
| `@react-navigation/native` | ^7.0.0 | Sistema de navegación |
| `@react-navigation/bottom-tabs` | ^7.0.0 | Navegación por pestañas |
| `expo-router` | 4.0.11 | Enrutamiento file-based |
| `react-native-screens` | ~4.1.0 | Optimización de pantallas |
| `react-native-safe-area-context` | 4.12.0 | Gestión de áreas seguras |

### 2.4 UI y Experiencia de Usuario
| Paquete | Versión | Funcionalidad |
|---------|---------|---------------|
| `@expo/vector-icons` | ^14.0.2 | Iconografía |
| `expo-symbols` | ~0.2.0 | Símbolos SF (iOS) |
| `expo-haptics` | ~14.0.0 | Feedback háptico |
| `expo-blur` | ~14.0.1 | Efectos de desenfoque |
| `react-native-reanimated` | ~3.16.1 | Animaciones de alto rendimiento |
| `react-native-gesture-handler` | ~2.20.2 | Gestos nativos |

### 2.5 Funcionalidades Expo
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `expo-font` | ~13.0.1 | Carga de fuentes personalizadas |
| `expo-splash-screen` | ~0.29.18 | Pantalla de carga |
| `expo-status-bar` | ~2.0.0 | Control de barra de estado |
| `expo-system-ui` | ~4.0.6 | Configuración UI del sistema |
| `expo-constants` | ~17.0.3 | Constantes del sistema |
| `expo-linking` | ~7.0.3 | Deep linking |
| `expo-web-browser` | ~14.0.1 | Navegador in-app |
| `react-native-webview` | 13.12.5 | WebView embebido |

### 2.6 Testing
| Paquete | Versión | Función |
|---------|---------|---------|
| `jest` | ^29.2.1 | Framework de testing |
| `jest-expo` | ~52.0.2 | Preset Expo para Jest |
| `react-test-renderer` | 18.3.1 | Renderizado para tests |
| `@types/jest` | ^29.5.12 | Tipos TypeScript para Jest |

### 2.7 Plataformas Web
| Paquete | Versión | Uso |
|---------|---------|-----|
| `react-dom` | 18.3.1 | Renderizado web |
| `react-native-web` | ~0.19.13 | Adaptador RN para web |

---

## 3. ARQUITECTURA DEL PROYECTO

### 3.1 Patrón Arquitectónico
```
┌─────────────────────────────────────────┐
│         PRESENTACIÓN (UI Layer)         │
│  ┌─────────────────────────────────┐   │
│  │   Components + Screens (TSX)    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      LÓGICA DE NEGOCIO (Hooks)          │
│  ┌─────────────────────────────────┐   │
│  │  Custom Hooks (useThemeColor,   │   │
│  │  useColorScheme)                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       NAVEGACIÓN (Expo Router)          │
│  ┌─────────────────────────────────┐   │
│  │   File-based Routing System     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         CONSTANTES Y CONFIGURACIÓN      │
│  ┌─────────────────────────────────┐   │
│  │   Colors, Themes, Constants     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 3.2 Sistema de Enrutamiento (File-based)
```
app/
├── _layout.tsx                 # Root layout (Stack Navigator)
│   ├── Gestiona ThemeProvider
│   ├── Carga fuentes
│   ├── Controla SplashScreen
│   └── Renderiza Stack principal
│
├── (tabs)/                     # Tab Navigator Group
│   ├── _layout.tsx            # Tabs configuration
│   ├── index.tsx              # Home Tab (/)
│   └── explore.tsx            # Explore Tab (/explore)
│
└── +not-found.tsx             # 404 Screen
```

### 3.3 Flujo de Datos
```typescript
// Flujo de datos de tema
Usuario → Sistema Operativo → useColorScheme() → ThemeProvider → Componentes → Colors
```

### 3.4 Nueva Arquitectura de React Native
```typescript
// Estado: HABILITADA en app.json
{
  "newArchEnabled": true  // Fabric + TurboModules
}
```

**Beneficios de la Nueva Arquitectura:**
- ✅ **Fabric Renderer**: Renderizado más rápido y consistente
- ✅ **TurboModules**: Módulos nativos con carga lazy
- ✅ **JSI (JavaScript Interface)**: Comunicación síncrona JS ↔ Native
- ✅ **Concurrent Rendering**: Soporte para React 18 features

---

## 4. ESTRUCTURA DE DIRECTORIOS

### 4.1 Árbol Completo
```
futura-tickets-access-app-main/
│
├── 📁 app/                          # Directorio principal de pantallas (Expo Router)
│   ├── _layout.tsx                 # Layout raíz con Stack Navigator
│   ├── +not-found.tsx              # Pantalla 404
│   │
│   └── 📁 (tabs)/                   # Grupo de navegación por pestañas
│       ├── _layout.tsx             # Configuración del Tab Navigator
│       ├── index.tsx               # Pantalla Home (ruta: /)
│       └── explore.tsx             # Pantalla Explore (ruta: /explore)
│
├── 📁 components/                   # Componentes reutilizables
│   ├── Collapsible.tsx             # Componente acordeón/colapsable
│   ├── ExternalLink.tsx            # Componente para enlaces externos
│   ├── HapticTab.tsx               # Tab con feedback háptico
│   ├── HelloWave.tsx               # Animación de saludo
│   ├── ParallaxScrollView.tsx      # ScrollView con efecto parallax
│   ├── ThemedText.tsx              # Texto con soporte de temas
│   ├── ThemedView.tsx              # View con soporte de temas
│   │
│   ├── 📁 ui/                       # Componentes UI especializados
│   │   ├── IconSymbol.tsx          # Sistema de iconos multiplataforma
│   │   ├── IconSymbol.ios.tsx      # Iconos SF Symbols (iOS)
│   │   ├── TabBarBackground.tsx    # Fondo de la TabBar (general)
│   │   └── TabBarBackground.ios.tsx # Fondo TabBar con blur (iOS)
│   │
│   └── 📁 __tests__/                # Tests de componentes
│       └── ThemedText-test.tsx     # Test unitario de ThemedText
│
├── 📁 constants/                    # Constantes de la aplicación
│   └── Colors.ts                   # Paleta de colores (light/dark)
│
├── 📁 hooks/                        # Custom React Hooks
│   ├── useColorScheme.ts           # Hook para detectar tema del sistema
│   ├── useColorScheme.web.ts       # Versión web del hook de tema
│   └── useThemeColor.ts            # Hook para obtener colores del tema
│
├── 📁 assets/                       # Recursos estáticos
│   ├── 📁 fonts/                    # Fuentes personalizadas
│   │   └── SpaceMono-Regular.ttf   # Fuente SpaceMono
│   │
│   └── 📁 images/                   # Imágenes y recursos visuales
│       ├── icon.png                # Icono de la app
│       ├── favicon.png             # Favicon (web)
│       ├── splash-icon.png         # Icono de splash screen
│       ├── adaptive-icon.png       # Icono adaptativo (Android)
│       └── partial-react-logo.png  # Logo de React (ejemplo)
│
├── 📁 scripts/                      # Scripts de automatización
│   └── reset-project.js            # Script para resetear proyecto
│
├── 📄 app.json                      # Configuración de Expo
├── 📄 package.json                  # Dependencias y scripts npm
├── 📄 package-lock.json             # Lock file de dependencias
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 .gitignore                    # Archivos ignorados por Git
└── 📄 README.md                     # Documentación básica
```

### 4.2 Descripción de Directorios Clave

#### 📁 `app/`
**Propósito**: Sistema de enrutamiento file-based de Expo Router.
- **Convención**: Cada archivo `.tsx` se convierte automáticamente en una ruta
- **Layouts**: Archivos `_layout.tsx` definen la estructura de navegación
- **Grupos**: Carpetas con `(parentesis)` son grupos de rutas que no aparecen en la URL

#### 📁 `components/`
**Propósito**: Componentes React reutilizables.
- **Componentes Temáticos**: `ThemedText.tsx`, `ThemedView.tsx` → adaptan automáticamente al tema
- **UI Components**: En subcarpeta `ui/` → componentes de interfaz especializados
- **Platform Specific**: Archivos con `.ios.tsx` o `.android.tsx` → código específico de plataforma

#### 📁 `constants/`
**Propósito**: Valores constantes compartidos.
- **Colors.ts**: Define paletas de colores para modo claro y oscuro

#### 📁 `hooks/`
**Propósito**: Custom React Hooks para lógica reutilizable.
- **useColorScheme**: Detecta el esquema de color del sistema (light/dark)
- **useThemeColor**: Obtiene colores basados en el tema actual

#### 📁 `assets/`
**Propósito**: Archivos estáticos (imágenes, fuentes, etc.).
- **Optimización**: Expo optimiza automáticamente estos recursos en build time

---

## 5. CONFIGURACIÓN Y ENTORNO

### 5.1 Archivo `app.json` (Configuración Expo)
```json
{
  "expo": {
    "name": "futura-access-app",           // Nombre visible de la app
    "slug": "futura-access-app",           // Identificador único en Expo
    "version": "1.0.0",                    // Versión de la app
    "orientation": "portrait",             // Orientación forzada
    "icon": "./assets/images/icon.png",    // Icono principal
    "scheme": "myapp",                     // Deep linking scheme
    "userInterfaceStyle": "automatic",     // Tema automático (light/dark)
    "newArchEnabled": true,                // Nueva arquitectura RN

    "ios": {
      "supportsTablet": true               // Soporte para iPad
    },

    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },

    "web": {
      "bundler": "metro",                  // Metro bundler para web
      "output": "static",                  // Output estático para deploy
      "favicon": "./assets/images/favicon.png"
    },

    "plugins": [
      "expo-router",                       // Plugin de Expo Router
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],

    "experiments": {
      "typedRoutes": true                  // Rutas tipadas con TypeScript
    }
  }
}
```

### 5.2 Archivo `tsconfig.json` (TypeScript)
```json
{
  "extends": "expo/tsconfig.base",         // Hereda configuración base de Expo
  "compilerOptions": {
    "strict": true,                        // ✅ Modo estricto activado
    "paths": {
      "@/*": ["./*"]                       // Alias @ para imports absolutos
    }
  },
  "include": [
    "**/*.ts",                             // Todos los archivos .ts
    "**/*.tsx",                            // Todos los archivos .tsx
    ".expo/types/**/*.ts",                 // Tipos generados por Expo
    "expo-env.d.ts"                        // Definiciones de tipos Expo
  ]
}
```

**Características TypeScript**:
- ✅ **Strict Mode**: Máxima seguridad de tipos
- ✅ **Absolute Imports**: Uso de `@/` en lugar de rutas relativas
- ✅ **Type Safety**: Validación en tiempo de compilación

### 5.3 Variables de Entorno
```bash
# Archivo: .env (CREAR SI NO EXISTE)

# Entorno
NODE_ENV=development

# API Configuration
API_BASE_URL=https://api.futuratickets.com
API_VERSION=v1
API_TIMEOUT=30000

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
ENABLE_PERFORMANCE_MONITORING=true

# Expo Configuration
EXPO_PUBLIC_API_KEY=your_expo_public_api_key
```

**⚠️ IMPORTANTE**:
- Variables con prefijo `EXPO_PUBLIC_` son públicas (incluidas en el bundle)
- Variables sin prefijo solo están disponibles en build time

### 5.4 Configuración de Git (`.gitignore`)
```bash
# Archivos principales a ignorar:
node_modules/              # Dependencias npm
.expo/                     # Caché de Expo
dist/                      # Build output
npm-debug.*               # Logs de npm
*.jks                      # Keystores Android
*.p8                       # Certificados iOS
*.p12                      # Certificados iOS
*.key                      # Claves privadas
*.mobileprovision         # Perfiles de provisión iOS
.env                       # Variables de entorno locales
.env.local                # Variables de entorno locales
```

---

## 6. GUÍA DE DESARROLLO

### 6.1 Instalación Inicial
```bash
# 1. Clonar repositorio (si aplica)
git clone <repository-url>
cd futura-tickets-access-app-main

# 2. Instalar dependencias
npm install

# 3. Verificar instalación
npx expo-doctor

# 4. Iniciar servidor de desarrollo
npm start
```

### 6.2 Comandos de Desarrollo
```bash
# Iniciar servidor de desarrollo (modo interactivo)
npm start
# o
npx expo start

# Opciones del servidor:
# - Presiona 'i' para abrir en iOS Simulator
# - Presiona 'a' para abrir en Android Emulator
# - Presiona 'w' para abrir en navegador web
# - Presiona 'r' para recargar la app
# - Presiona 'j' para abrir DevTools

# Iniciar directamente en plataforma específica
npm run ios          # Abre en iOS Simulator
npm run android      # Abre en Android Emulator
npm run web          # Abre en navegador

# Modo desarrollo con opciones
npx expo start --clear          # Limpiar caché
npx expo start --dev-client     # Usar development build
npx expo start --tunnel         # Exponer servidor vía tunnel
npx expo start --localhost      # Solo acceso local
npx expo start --offline        # Modo offline
```

### 6.3 Testing
```bash
# Ejecutar tests en modo watch
npm test

# Ejecutar tests una vez
npx jest

# Ejecutar tests con coverage
npx jest --coverage

# Ejecutar test específico
npx jest ThemedText-test

# Debug de tests
npx jest --debug
```

### 6.4 Linting y Formateo
```bash
# Ejecutar linter
npm run lint

# Verificar código TypeScript
npx tsc --noEmit

# Formatear código (si se configura Prettier)
npx prettier --write "**/*.{js,jsx,ts,tsx,json}"
```

### 6.5 Limpieza y Reset
```bash
# Resetear proyecto a estado limpio
npm run reset-project

# Limpiar caché de Expo
npx expo start --clear

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar build de watchman (si hay problemas)
watchman watch-del-all
```

### 6.6 Flujo de Trabajo Recomendado

#### 6.6.1 Desarrollo de Nueva Funcionalidad
```bash
# 1. Crear nueva rama
git checkout -b feature/nombre-funcionalidad

# 2. Desarrollar con hot reload activo
npm start

# 3. Escribir tests
npx jest --watch

# 4. Verificar tipos
npx tsc --noEmit

# 5. Lint del código
npm run lint

# 6. Commit cambios
git add .
git commit -m "feat: descripción de la funcionalidad"

# 7. Push y crear PR
git push origin feature/nombre-funcionalidad
```

#### 6.6.2 Debugging
```bash
# Debug en iOS
npx expo start --ios

# En el simulador:
# - Cmd+D (iOS) / Cmd+M (Android) → Menú de desarrollo
# - Seleccionar "Debug Remote JS"
# - Abrir Chrome DevTools en chrome://inspect

# React Native Debugger (alternativa)
# Instalar: https://github.com/jhen0409/react-native-debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# Logging
console.log("Debug message")      # Aparece en terminal
console.warn("Warning message")   # Aparece como warning en app
console.error("Error message")    # Aparece como error en app

# Herramientas de desarrollo
# - React DevTools
# - Network Inspector
# - Performance Monitor
# - Element Inspector
```

---

## 7. COMPONENTES DEL SISTEMA

### 7.1 Componentes Core

#### 7.1.1 `ThemedText.tsx`
**Ubicación**: `components/ThemedText.tsx`

**Propósito**: Componente de texto que adapta su color automáticamente al tema (light/dark).

**Props**:
```typescript
interface ThemedTextProps {
  lightColor?: string;           // Color para modo claro (opcional)
  darkColor?: string;            // Color para modo oscuro (opcional)
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  style?: StyleProp<TextStyle>;  // Estilos adicionales
  children: React.ReactNode;     // Contenido del texto
}
```

**Tipos de Texto**:
- `default`: Texto normal (16px)
- `defaultSemiBold`: Texto semi-bold (16px, peso 600)
- `title`: Título grande (32px, bold)
- `subtitle`: Subtítulo (20px, bold)
- `link`: Enlace (16px, con color tint)

**Uso**:
```tsx
import { ThemedText } from '@/components/ThemedText';

// Uso básico
<ThemedText>Texto normal</ThemedText>

// Con tipo
<ThemedText type="title">Título Principal</ThemedText>

// Con colores personalizados
<ThemedText
  lightColor="#000000"
  darkColor="#FFFFFF"
>
  Texto con colores custom
</ThemedText>

// Combinando con estilos
<ThemedText
  type="subtitle"
  style={{ marginBottom: 16 }}
>
  Subtítulo con margen
</ThemedText>
```

#### 7.1.2 `ThemedView.tsx`
**Ubicación**: `components/ThemedView.tsx`

**Propósito**: Contenedor View que adapta su color de fondo al tema.

**Props**:
```typescript
interface ThemedViewProps {
  lightColor?: string;           // Color de fondo para modo claro
  darkColor?: string;            // Color de fondo para modo oscuro
  style?: StyleProp<ViewStyle>;  // Estilos adicionales
  children: React.ReactNode;     // Contenido del view
}
```

**Uso**:
```tsx
import { ThemedView } from '@/components/ThemedView';

// View básico con tema
<ThemedView>
  <ThemedText>Contenido dentro del view</ThemedText>
</ThemedView>

// Con colores personalizados
<ThemedView
  lightColor="#F5F5F5"
  darkColor="#1A1A1A"
>
  <ThemedText>View con fondo custom</ThemedText>
</ThemedView>

// Con estilos adicionales
<ThemedView style={styles.container}>
  <ThemedText>View con estilos personalizados</ThemedText>
</ThemedView>
```

#### 7.1.3 `ParallaxScrollView.tsx`
**Ubicación**: `components/ParallaxScrollView.tsx`

**Propósito**: ScrollView con efecto parallax en el header, ideal para pantallas de inicio o detalle.

**Props**:
```typescript
interface ParallaxScrollViewProps {
  headerImage: React.ReactNode;              // Imagen del header
  headerBackgroundColor: {
    light: string;                           // Color de fondo header (light)
    dark: string;                            // Color de fondo header (dark)
  };
  children: React.ReactNode;                 // Contenido scrollable
}
```

**Características**:
- ✅ Header con efecto parallax al hacer scroll
- ✅ Transición suave de opacidad
- ✅ Soporte para áreas seguras (iOS)
- ✅ Adaptable a diferentes tamaños de pantalla

**Uso**:
```tsx
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'react-native';

<ParallaxScrollView
  headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
  headerImage={
    <Image
      source={require('@/assets/images/header-image.png')}
      style={styles.headerImage}
    />
  }
>
  <ThemedView style={styles.content}>
    <ThemedText type="title">Contenido Principal</ThemedText>
    <ThemedText>Más contenido scrollable aquí...</ThemedText>
  </ThemedView>
</ParallaxScrollView>
```

#### 7.1.4 `Collapsible.tsx`
**Ubicación**: `components/Collapsible.tsx`

**Propósito**: Componente acordeón/colapsable con animación.

**Props**:
```typescript
interface CollapsibleProps {
  title: string;                      // Título visible siempre
  children: React.ReactNode;          // Contenido colapsable
}
```

**Características**:
- ✅ Animación suave de apertura/cierre
- ✅ Icono de chevron que rota al expandir
- ✅ Soporte de temas automático
- ✅ Feedback háptico al tocar (iOS)

**Uso**:
```tsx
import { Collapsible } from '@/components/Collapsible';

<Collapsible title="Información Adicional">
  <ThemedText>
    Contenido que se puede expandir y colapsar.
    Este contenido está oculto hasta que el usuario
    hace clic en el título.
  </ThemedText>
</Collapsible>
```

#### 7.1.5 `ExternalLink.tsx`
**Ubicación**: `components/ExternalLink.tsx`

**Propósito**: Enlace que abre URLs externas en el navegador del sistema.

**Props**:
```typescript
interface ExternalLinkProps {
  href: string;                       // URL a abrir
  children: React.ReactNode;          // Contenido del enlace
  style?: StyleProp<TextStyle>;       // Estilos adicionales
}
```

**Comportamiento**:
- 📱 iOS/Android: Abre en navegador in-app
- 💻 Web: Abre en nueva pestaña

**Uso**:
```tsx
import { ExternalLink } from '@/components/ExternalLink';

<ExternalLink href="https://futuratickets.com">
  <ThemedText type="link">Visitar Futura Tickets</ThemedText>
</ExternalLink>
```

#### 7.1.6 `HapticTab.tsx`
**Ubicación**: `components/HapticTab.tsx`

**Propósito**: Botón de tab con feedback háptico al presionar.

**Características**:
- ✅ Feedback háptico ligero en iOS
- ✅ Sin feedback en Android (por diseño)
- ✅ Integrado automáticamente en `TabBarButton`

**Uso**:
```tsx
// Ya está integrado en (tabs)/_layout.tsx
<Tabs
  screenOptions={{
    tabBarButton: HapticTab,  // ← Aquí se usa
  }}
>
  {/* Tabs */}
</Tabs>
```

#### 7.1.7 `HelloWave.tsx`
**Ubicación**: `components/HelloWave.tsx`

**Propósito**: Emoji animado de saludo con rotación.

**Características**:
- ✅ Animación de rotación suave
- ✅ Loop infinito con pausa
- ✅ Usa `react-native-reanimated`

**Uso**:
```tsx
import { HelloWave } from '@/components/HelloWave';

<ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
  <ThemedText type="title">Bienvenido</ThemedText>
  <HelloWave />
</ThemedView>
```

### 7.2 Componentes UI Especializados

#### 7.2.1 `IconSymbol.tsx` y `IconSymbol.ios.tsx`
**Ubicación**: `components/ui/IconSymbol.tsx` | `components/ui/IconSymbol.ios.tsx`

**Propósito**: Sistema de iconos multiplataforma con soporte para SF Symbols en iOS.

**Props**:
```typescript
interface IconSymbolProps {
  name: string;                       // Nombre del icono/SF Symbol
  size?: number;                      // Tamaño (default: 24)
  color?: string;                     // Color del icono
  style?: StyleProp<ViewStyle>;       // Estilos adicionales
}
```

**Comportamiento**:
- 🍎 **iOS**: Usa SF Symbols nativos (`expo-symbols`)
- 🤖 **Android/Web**: Fallback a iconos alternativos o SVG

**SF Symbols Disponibles** (iOS):
```typescript
// Ejemplos de SF Symbols comunes
'house.fill'           // Icono de casa
'paperplane.fill'      // Icono de avión de papel
'gear'                 // Icono de engranaje
'person.circle.fill'   // Icono de persona
'bell.fill'            // Icono de campana
'magnifyingglass'      // Icono de lupa
// Ver más en: https://developer.apple.com/sf-symbols/
```

**Uso**:
```tsx
import { IconSymbol } from '@/components/ui/IconSymbol';

// Icono básico
<IconSymbol name="house.fill" size={28} color="#007AFF" />

// En TabBar (ya configurado)
<Tabs.Screen
  name="index"
  options={{
    tabBarIcon: ({ color }) => (
      <IconSymbol size={28} name="house.fill" color={color} />
    ),
  }}
/>
```

#### 7.2.2 `TabBarBackground.tsx` y `TabBarBackground.ios.tsx`
**Ubicación**: `components/ui/TabBarBackground.tsx` | `components/ui/TabBarBackground.ios.tsx`

**Propósito**: Fondo personalizado para la TabBar con efecto blur en iOS.

**Comportamiento**:
- 🍎 **iOS**: Usa `BlurView` de `expo-blur` para efecto glassmorphism
- 🤖 **Android/Web**: Fondo sólido simple

**Configuración iOS**:
```typescript
// En TabBarBackground.ios.tsx
<BlurView
  tint={colorScheme === 'dark' ? 'dark' : 'light'}
  intensity={100}           // Intensidad del blur
  style={StyleSheet.absoluteFill}
/>
```

**Uso**:
```tsx
// Ya está integrado en (tabs)/_layout.tsx
<Tabs
  screenOptions={{
    tabBarBackground: TabBarBackground,  // ← Aquí se usa
    tabBarStyle: Platform.select({
      ios: {
        position: 'absolute',  // Necesario para blur effect
      },
    }),
  }}
/>
```

### 7.3 Crear Componentes Nuevos

#### 7.3.1 Template de Componente Básico
```tsx
// components/MiComponente.tsx
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface MiComponenteProps {
  titulo: string;
  descripcion?: string;
  onPress?: () => void;
}

export function MiComponente({ titulo, descripcion, onPress }: MiComponenteProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{titulo}</ThemedText>
      {descripcion && (
        <ThemedText style={styles.descripcion}>{descripcion}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  descripcion: {
    marginTop: 8,
    opacity: 0.7,
  },
});
```

#### 7.3.2 Template de Componente con Hooks
```tsx
// components/MiComponenteConEstado.tsx
import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface MiComponenteConEstadoProps {
  initialCount?: number;
}

export function MiComponenteConEstado({ initialCount = 0 }: MiComponenteConEstadoProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);

  const handlePress = () => {
    setCount(prev => prev + 1);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Contador: {count}</ThemedText>
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <ThemedText type="link">Incrementar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
});
```

#### 7.3.3 Template de Componente Platform-Specific
```tsx
// components/MiComponente.tsx (default)
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export function MiComponente() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Versión Android/Web</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

```tsx
// components/MiComponente.ios.tsx (iOS specific)
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/ThemedText';

export function MiComponente() {
  return (
    <BlurView intensity={100} style={styles.container}>
      <ThemedText>Versión iOS con Blur</ThemedText>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

---

## 8. RUTAS Y NAVEGACIÓN

### 8.1 Sistema de Enrutamiento (Expo Router)

#### 8.1.1 Concepto de File-based Routing
```
Cada archivo en /app/ se convierte en una ruta:

app/index.tsx              →  /
app/about.tsx              →  /about
app/profile.tsx            →  /profile
app/settings/index.tsx     →  /settings
app/settings/privacy.tsx   →  /settings/privacy
```

#### 8.1.2 Grupos de Rutas
```
Carpetas con (paréntesis) son grupos que NO aparecen en la URL:

app/(tabs)/index.tsx       →  /           (no /tabs/)
app/(tabs)/explore.tsx     →  /explore    (no /tabs/explore)
app/(auth)/login.tsx       →  /login      (no /auth/login)
```

**Propósito de los grupos**:
- 🎯 Organizar rutas lógicamente sin afectar URLs
- 🎯 Compartir layouts entre rutas relacionadas
- 🎯 Aplicar navegación específica a un grupo de pantallas

### 8.2 Layouts

#### 8.2.1 Root Layout (`app/_layout.tsx`)
**Responsabilidades**:
- ✅ Configurar ThemeProvider
- ✅ Cargar fuentes personalizadas
- ✅ Gestionar SplashScreen
- ✅ Definir Stack Navigator principal

**Código**:
```tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

#### 8.2.2 Tabs Layout (`app/(tabs)/_layout.tsx`)
**Responsabilidades**:
- ✅ Configurar Tab Navigator
- ✅ Definir pestañas y sus iconos
- ✅ Aplicar estilos personalizados a TabBar
- ✅ Integrar HapticTab y TabBarBackground

**Código Actual**:
```tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

**Agregar Nueva Pestaña**:
```tsx
// En app/(tabs)/_layout.tsx, agregar dentro de <Tabs>:
<Tabs.Screen
  name="tickets"                    // ← Nombre del archivo: app/(tabs)/tickets.tsx
  options={{
    title: 'Mis Tickets',           // ← Texto visible en la pestaña
    tabBarIcon: ({ color }) => (
      <IconSymbol
        size={28}
        name="ticket.fill"          // ← SF Symbol (iOS) o fallback
        color={color}
      />
    ),
  }}
/>
```

### 8.3 Navegación Programática

#### 8.3.1 Hooks de Navegación
```tsx
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';

function MiComponente() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  // Navegar a una ruta
  const goToProfile = () => {
    router.push('/profile');
  };

  // Navegar con parámetros
  const goToTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  // Navegar reemplazando la ruta actual
  const goToLogin = () => {
    router.replace('/login');
  };

  // Volver atrás
  const goBack = () => {
    router.back();
  };

  // Navegar a ruta específica y limpiar historial
  const goToHome = () => {
    router.dismissAll();
    router.push('/');
  };

  return (
    <View>
      {/* Componente */}
    </View>
  );
}
```

#### 8.3.2 Componente Link
```tsx
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

function MiComponente() {
  return (
    <View>
      {/* Link básico */}
      <Link href="/profile">
        <ThemedText type="link">Ver Perfil</ThemedText>
      </Link>

      {/* Link con parámetros */}
      <Link href={{ pathname: '/tickets/[id]', params: { id: '123' } }}>
        <ThemedText type="link">Ver Ticket #123</ThemedText>
      </Link>

      {/* Link con replace (sin agregar al historial) */}
      <Link href="/login" replace>
        <ThemedText type="link">Iniciar Sesión</ThemedText>
      </Link>
    </View>
  );
}
```

### 8.4 Rutas Dinámicas

#### 8.4.1 Parámetros de Ruta
```
Crear rutas dinámicas con [corchetes]:

app/tickets/[id].tsx       →  /tickets/123
app/users/[userId]/posts/[postId].tsx  →  /users/5/posts/42
```

**Ejemplo de Ruta Dinámica**:
```tsx
// app/tickets/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView>
      <ThemedText type="title">Ticket #{id}</ThemedText>
      <ThemedText>Detalles del ticket...</ThemedText>
    </ThemedView>
  );
}
```

**Navegar a Ruta Dinámica**:
```tsx
import { useRouter } from 'expo-router';

function TicketList() {
  const router = useRouter();

  const handleTicketPress = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <TouchableOpacity onPress={() => handleTicketPress('123')}>
      <ThemedText>Ticket #123</ThemedText>
    </TouchableOpacity>
  );
}
```

### 8.5 Typed Routes (Experimental)

#### 8.5.1 Configuración
```json
// En app.json
{
  "experiments": {
    "typedRoutes": true
  }
}
```

#### 8.5.2 Uso
```tsx
import { Href } from 'expo-router';

// TypeScript autocompletará rutas válidas
const validRoute: Href = '/tickets/123';

// ❌ Error en tiempo de compilación
const invalidRoute: Href = '/ruta-inexistente';
```

### 8.6 Pantalla 404

**Ubicación**: `app/+not-found.tsx`

```tsx
import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '¡Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Esta pantalla no existe.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Ir a la pantalla principal</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
```

### 8.7 Deep Linking

#### 8.7.1 Configuración
```json
// En app.json
{
  "scheme": "myapp"
}
```

#### 8.7.2 URLs Soportadas
```bash
# Abrir app desde enlaces externos
myapp://                           # Abre app en pantalla principal
myapp://profile                    # Abre pantalla de perfil
myapp://tickets/123                # Abre ticket específico

# Desde web
https://futuratickets.com/app/tickets/123
```

#### 8.7.3 Manejar Deep Links
```tsx
// app/_layout.tsx o en componente específico
import * as Linking from 'expo-linking';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      console.log('Deep link:', path, queryParams);
      // Navegar a la ruta correspondiente
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    // Obtener URL inicial (si la app fue abierta por un link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        const { path, queryParams } = Linking.parse(url);
        console.log('Initial URL:', path, queryParams);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ... resto del layout
}
```

---

## 9. ESTILOS Y TEMAS

### 9.1 Sistema de Colores

#### 9.1.1 Archivo `constants/Colors.ts`
```typescript
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
```

#### 9.1.2 Paleta de Colores Recomendada para Futura Tickets
```typescript
// constants/Colors.ts (PROPUESTA DE MEJORA)
export const Colors = {
  light: {
    // Textos
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9BA1A6',

    // Fondos
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#E8E8E8',

    // Brand colors
    primary: '#0066CC',              // Azul principal
    primaryDark: '#004C99',          // Azul oscuro
    primaryLight: '#3385DB',         // Azul claro

    secondary: '#00C851',            // Verde (success)
    warning: '#FFB300',              // Amarillo (warning)
    error: '#FF3547',                // Rojo (error)

    // UI Elements
    tint: '#0066CC',
    border: '#E0E0E0',
    divider: '#F0F0F0',

    // Tab Bar
    tabIconDefault: '#687076',
    tabIconSelected: '#0066CC',

    // Status colors
    success: '#00C851',
    info: '#33B5E5',
    warningBg: '#FFF8E1',
    errorBg: '#FFEBEE',
  },

  dark: {
    // Textos
    text: '#ECEDEE',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',

    // Fondos
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2C2C2C',

    // Brand colors
    primary: '#4DA6FF',              // Azul principal (más claro para dark mode)
    primaryDark: '#3385DB',
    primaryLight: '#80BFFF',

    secondary: '#26E07F',            // Verde (success)
    warning: '#FFD54F',              // Amarillo (warning)
    error: '#FF6B7A',                // Rojo (error)

    // UI Elements
    tint: '#4DA6FF',
    border: '#3C3C3C',
    divider: '#2C2C2C',

    // Tab Bar
    tabIconDefault: '#B0B0B0',
    tabIconSelected: '#4DA6FF',

    // Status colors
    success: '#26E07F',
    info: '#5DADE2',
    warningBg: '#3E3824',
    errorBg: '#4A2424',
  },
};
```

### 9.2 Hooks de Temas

#### 9.2.1 `useColorScheme()` Hook
**Ubicación**: `hooks/useColorScheme.ts` | `hooks/useColorScheme.web.ts`

**Propósito**: Detectar el esquema de color del sistema (light/dark).

```typescript
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  return useSystemColorScheme() as 'light' | 'dark';
}
```

**Uso**:
```tsx
import { useColorScheme } from '@/hooks/useColorScheme';

function MiComponente() {
  const colorScheme = useColorScheme();

  return (
    <View style={{
      backgroundColor: colorScheme === 'dark' ? '#000' : '#FFF'
    }}>
      <Text>Modo: {colorScheme}</Text>
    </View>
  );
}
```

#### 9.2.2 `useThemeColor()` Hook
**Ubicación**: `hooks/useThemeColor.ts`

**Propósito**: Obtener colores específicos del tema actual.

```typescript
import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
```

**Uso**:
```tsx
import { useThemeColor } from '@/hooks/useThemeColor';

function MiComponente() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={{ backgroundColor }}>
      <Text style={{ color: textColor }}>Texto con color de tema</Text>
      <View style={{ borderColor: tintColor, borderWidth: 2 }}>
        <Text>Borde con tint color</Text>
      </View>
    </View>
  );
}

// Uso con colores personalizados (override)
function ComponenteConOverride() {
  const backgroundColor = useThemeColor(
    { light: '#F0F0F0', dark: '#1A1A1A' },  // ← Colores custom
    'background'                             // ← Fallback
  );

  return (
    <View style={{ backgroundColor }}>
      <Text>View con colores custom</Text>
    </View>
  );
}
```

### 9.3 StyleSheet y Responsive Design

#### 9.3.1 Estructura Básica de Estilos
```tsx
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Android shadow
  },
});
```

#### 9.3.2 Responsive Design
```tsx
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isLargeDevice = width >= 768;
const isTablet = width >= 768 && height >= 1024;

const styles = StyleSheet.create({
  container: {
    padding: isSmallDevice ? 12 : 16,
  },
  title: {
    fontSize: isSmallDevice ? 20 : isTablet ? 32 : 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: isTablet ? '31%' : isMediumDevice ? '48%' : '100%',
    marginBottom: 16,
  },
});
```

#### 9.3.3 Platform-Specific Styles
```tsx
import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 44,        // Status bar height iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        paddingTop: 24,        // Status bar height Android
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
      },
    }),
  },
  text: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
});
```

### 9.4 Sistema de Espaciado (Spacing System)

#### 9.4.1 Propuesta de Spacing Constants
```typescript
// constants/Spacing.ts (CREAR ESTE ARCHIVO)
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
```

#### 9.4.2 Uso del Spacing System
```tsx
import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, FontSize } from '@/constants/Spacing';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    marginBottom: Spacing.sm,
  },
  text: {
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.5,
  },
});
```

### 9.5 Animaciones

#### 9.5.1 Animaciones con Reanimated
```tsx
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

function AnimatedComponent() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 500 });

    // Scale up with spring
    scale.value = withSpring(1);

    // Rotate continuously
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,  // Infinite loop
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText>Componente animado</ThemedText>
    </Animated.View>
  );
}
```

#### 9.5.2 Animaciones con Gesture Handler
```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableComponent() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd(() => {
      // Volver a posición original con spring
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <ThemedText>Arrástra me</ThemedText>
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 10. TESTING

### 10.1 Configuración de Jest

**Archivo**: `package.json`
```json
{
  "jest": {
    "preset": "jest-expo"
  }
}
```

### 10.2 Tests Existentes

#### 10.2.1 Test de `ThemedText`
**Ubicación**: `components/__tests__/ThemedText-test.tsx`

```tsx
import * as React from 'react';
import renderer from 'react-test-renderer';
import { ThemedText } from '../ThemedText';

it('renders correctly', () => {
  const tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### 10.3 Crear Tests Nuevos

#### 10.3.1 Test de Componente Simple
```tsx
// components/__tests__/MiComponente-test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { MiComponente } from '../MiComponente';

describe('MiComponente', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<MiComponente />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with custom props', () => {
    const tree = renderer.create(
      <MiComponente titulo="Test Title" descripcion="Test Description" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const component = renderer.create(
      <MiComponente onPress={mockOnPress} />
    );

    const button = component.root.findByType('TouchableOpacity');
    button.props.onPress();

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

#### 10.3.2 Test de Hook
```tsx
// hooks/__tests__/useColorScheme-test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useColorScheme } from '../useColorScheme';

describe('useColorScheme', () => {
  it('returns light or dark', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(['light', 'dark']).toContain(result.current);
  });
});
```

#### 10.3.3 Test de Navegación
```tsx
// app/__tests__/navigation-test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import MiPantalla from '../MiPantalla';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Navigation Tests', () => {
  it('navigates to detail screen on button press', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    const { getByText } = render(<MiPantalla />);
    const button = getByText('Ver Detalles');

    fireEvent.press(button);

    expect(mockPush).toHaveBeenCalledWith('/details');
  });
});
```

### 10.4 Comandos de Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ThemedText-test

# Run tests matching pattern
npm test -- --testNamePattern="renders correctly"

# Update snapshots
npm test -- -u

# Verbose output
npm test -- --verbose
```

### 10.5 Cobertura de Tests (Coverage)

```bash
# Generar reporte de cobertura
npm test -- --coverage

# Ver reporte en navegador
npx jest --coverage --coverageReporters=html
open coverage/lcov-report/index.html
```

**Meta de Cobertura Recomendada**:
```json
// En package.json (opcional)
{
  "jest": {
    "preset": "jest-expo",
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

---

## 11. SCRIPTS DISPONIBLES

### 11.1 Scripts de Desarrollo
```json
{
  "start": "expo start",              // Servidor de desarrollo interactivo
  "android": "expo start --android",  // Abrir en Android
  "ios": "expo start --ios",          // Abrir en iOS
  "web": "expo start --web",          // Abrir en navegador
}
```

### 11.2 Scripts de Testing
```json
{
  "test": "jest --watchAll"           // Ejecutar tests en modo watch
}
```

### 11.3 Scripts de Calidad de Código
```json
{
  "lint": "expo lint"                 // Ejecutar linter
}
```

### 11.4 Scripts de Utilidad
```json
{
  "reset-project": "node ./scripts/reset-project.js"  // Resetear proyecto
}
```

### 11.5 Scripts Adicionales Recomendados

**Agregar a `package.json`**:
```json
{
  "scripts": {
    // ... scripts existentes

    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:update": "jest -u",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "clean": "rm -rf node_modules .expo dist",
    "clean:cache": "expo start --clear",
    "prebuild": "expo prebuild",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "build:all": "eas build --platform all",
    "preview:ios": "expo run:ios",
    "preview:android": "expo run:android"
  }
}
```

---

## 12. CONVENCIONES DE CÓDIGO

### 12.1 Nomenclatura

#### 12.1.1 Archivos
```
✅ CORRECTO:
- MiComponente.tsx
- useMyHook.ts
- apiService.ts
- constants.ts
- Colors.ts

❌ INCORRECTO:
- miComponente.tsx
- my_hook.ts
- api-service.ts
```

**Reglas**:
- **Componentes**: PascalCase (ej: `TicketCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useTickets.ts`)
- **Utilidades**: camelCase (ej: `formatDate.ts`)
- **Constantes**: PascalCase (ej: `Colors.ts`, `Spacing.ts`)
- **Types**: PascalCase (ej: `types.ts`, `TicketTypes.ts`)

#### 12.1.2 Variables y Funciones
```typescript
// ✅ Componentes: PascalCase
function TicketCard() {}
const UserProfile = () => {};

// ✅ Variables: camelCase
const ticketCount = 10;
const userName = "John";

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com";
const MAX_TICKETS = 100;

// ✅ Funciones: camelCase
function fetchTickets() {}
const handleTicketPress = () => {};

// ✅ Hooks: camelCase con prefijo 'use'
function useTickets() {}
const useUserProfile = () => {};

// ✅ Tipos/Interfaces: PascalCase
interface TicketData {}
type UserRole = 'admin' | 'user';

// ✅ Enums: PascalCase
enum TicketStatus {
  Active = 'active',
  Expired = 'expired',
  Used = 'used',
}
```

### 12.2 Estructura de Componentes

#### 12.2.1 Template de Componente Funcional
```tsx
// components/TicketCard.tsx
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

// 1. Props Interface
interface TicketCardProps {
  id: string;
  title: string;
  date: string;
  status: 'active' | 'expired' | 'used';
  onPress?: (id: string) => void;
}

// 2. Componente
export function TicketCard({ id, title, date, status, onPress }: TicketCardProps) {
  // 3. Handlers
  const handlePress = () => {
    onPress?.(id);
  };

  // 4. Render
  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText style={styles.date}>{date}</ThemedText>
        <ThemedText style={styles.status}>{status}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

// 5. Styles
const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  date: {
    marginTop: 8,
    opacity: 0.7,
  },
  status: {
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
```

#### 12.2.2 Orden de Imports
```typescript
// 1. React y React Native core
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';

// 3. Componentes locales
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

// 4. Hooks personalizados
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTickets } from '@/hooks/useTickets';

// 5. Constantes y utilidades
import { Colors } from '@/constants/Colors';
import { formatDate } from '@/utils/formatDate';

// 6. Tipos
import type { Ticket } from '@/types/ticket';
```

### 12.3 TypeScript

#### 12.3.1 Definición de Tipos
```typescript
// types/ticket.ts

// Tipos básicos
export type TicketStatus = 'active' | 'expired' | 'used';
export type UserRole = 'admin' | 'user' | 'scanner';

// Interfaces
export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  code: string;
  status: TicketStatus;
  purchaseDate: Date;
  validUntil: Date;
  price: number;
  seat?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Props types
export interface TicketListProps {
  tickets: Ticket[];
  onTicketPress: (ticketId: string) => void;
  loading?: boolean;
}

// Utility types
export type PartialTicket = Partial<Ticket>;
export type RequiredTicket = Required<Ticket>;
export type PickedTicket = Pick<Ticket, 'id' | 'code' | 'status'>;
```

#### 12.3.2 Uso de Generics
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Uso
const { data, loading, error } = useApi<Ticket[]>('/api/tickets');
```

### 12.4 Comentarios y Documentación

#### 12.4.1 JSDoc para Funciones
```typescript
/**
 * Valida un código de ticket y verifica su estado
 *
 * @param code - Código del ticket a validar
 * @param eventId - ID del evento asociado
 * @returns Objeto con resultado de validación y mensaje
 * @throws {Error} Si el código es inválido o el evento no existe
 *
 * @example
 * ```ts
 * const result = validateTicketCode('ABC123', 'event-456');
 * if (result.valid) {
 *   console.log('Ticket válido');
 * }
 * ```
 */
export function validateTicketCode(
  code: string,
  eventId: string
): { valid: boolean; message: string } {
  // Implementación...
}
```

#### 12.4.2 Comentarios en Componentes
```tsx
/**
 * Tarjeta de visualización de ticket con información básica
 *
 * Este componente muestra los datos principales de un ticket
 * y permite navegar a su vista detallada mediante un toque.
 *
 * @component
 */
export function TicketCard({ id, title, date, status, onPress }: TicketCardProps) {
  // Handlers
  const handlePress = () => {
    // Trigger haptic feedback on iOS
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(id);
  };

  // TODO: Agregar soporte para códigos QR
  // FIXME: El status no se actualiza en tiempo real

  return (
    // JSX...
  );
}
```

### 12.5 Manejo de Errores

#### 12.5.1 Try-Catch en Funciones Asíncronas
```typescript
async function fetchTickets(userId: string): Promise<Ticket[]> {
  try {
    const response = await fetch(`/api/users/${userId}/tickets`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching tickets:', error);

    if (error instanceof TypeError) {
      // Network error
      throw new Error('Error de conexión. Verifica tu internet.');
    }

    throw error;
  }
}
```

#### 12.5.2 Error Boundaries
```tsx
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Aquí podrías enviar el error a un servicio de logging
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          <ThemedText type="title">Algo salió mal</ThemedText>
          <ThemedText style={{ marginTop: 12 }}>
            {this.state.error?.message || 'Error desconocido'}
          </ThemedText>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

// Uso en app/_layout.tsx
<ErrorBoundary>
  <Stack>
    {/* Screens */}
  </Stack>
</ErrorBoundary>
```

---

## 13. GESTIÓN DE ESTADO

### 13.1 Estado Local (useState)

#### 13.1.1 Uso Básico
```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <ThemedView>
      <ThemedText type="title">{count}</ThemedText>
      <TouchableOpacity onPress={increment}>
        <ThemedText>Incrementar</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
```

#### 13.1.2 Estado Complejo
```tsx
interface FormState {
  email: string;
  password: string;
  remember: boolean;
}

function LoginForm() {
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    remember: false,
  });

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ThemedView>
      <TextInput
        value={form.email}
        onChangeText={(text) => updateField('email', text)}
      />
      <TextInput
        value={form.password}
        onChangeText={(text) => updateField('password', text)}
        secureTextEntry
      />
    </ThemedView>
  );
}
```

### 13.2 Context API (Recomendado para Estado Global)

#### 13.2.1 Crear Context
```tsx
// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      // API call to login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 13.2.2 Usar Context
```tsx
// app/_layout.tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack>
          {/* Screens */}
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

// En cualquier componente
import { useAuth } from '@/context/AuthContext';

function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ThemedView>
      <ThemedText>Hola, {user?.name}</ThemedText>
      <TouchableOpacity onPress={logout}>
        <ThemedText>Cerrar Sesión</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
```

### 13.3 Recomendaciones de Estado

#### 13.3.1 Cuándo Usar Cada Solución
```
📍 useState
├─ Estado local del componente
├─ Formularios simples
├─ Toggles, contadores
└─ No necesita compartirse

📍 Context API
├─ Autenticación
├─ Tema/preferencias de usuario
├─ Idioma/localización
├─ Datos compartidos entre muchos componentes
└─ Estado que cambia con poca frecuencia

📍 Zustand/Redux (si se necesita en el futuro)
├─ Estado global complejo
├─ Estado que cambia frecuentemente
├─ Lógica de estado compleja
├─ Time-travel debugging
└─ Persistencia de estado
```

---

## 14. INTEGRACIÓN CON APIs

### 14.1 Configuración de API

#### 14.1.1 API Client Base
```typescript
// services/api/client.ts

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.futuratickets.com/v1';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

#### 14.1.2 API Services
```typescript
// services/api/tickets.ts
import { apiClient } from './client';
import type { Ticket } from '@/types/ticket';

export const ticketsApi = {
  // Get all tickets for a user
  getTickets: (userId: string, token: string) => {
    return apiClient.get<Ticket[]>(`/users/${userId}/tickets`, { token });
  },

  // Get single ticket
  getTicket: (ticketId: string, token: string) => {
    return apiClient.get<Ticket>(`/tickets/${ticketId}`, { token });
  },

  // Validate ticket
  validateTicket: (ticketCode: string, token: string) => {
    return apiClient.post<{ valid: boolean; message: string }>(
      '/tickets/validate',
      { code: ticketCode },
      { token }
    );
  },

  // Cancel ticket
  cancelTicket: (ticketId: string, token: string) => {
    return apiClient.delete<void>(`/tickets/${ticketId}`, { token });
  },
};
```

### 14.2 Custom Hooks para APIs

#### 14.2.1 useTickets Hook
```typescript
// hooks/useTickets.ts
import { useState, useEffect } from 'react';
import { ticketsApi } from '@/services/api/tickets';
import { useAuth } from '@/context/AuthContext';
import type { Ticket } from '@/types/ticket';

export function useTickets() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await ticketsApi.getTickets(user.id, token);
        setTickets(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, token]);

  const refetch = async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const data = await ticketsApi.getTickets(user.id, token);
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { tickets, loading, error, refetch };
}
```

#### 14.2.2 Uso en Componentes
```tsx
import { useTickets } from '@/hooks/useTickets';

function TicketsListScreen() {
  const { tickets, loading, error, refetch } = useTickets();

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <ThemedText type="title">Error</ThemedText>
        <ThemedText>{error.message}</ThemedText>
        <TouchableOpacity onPress={refetch}>
          <ThemedText type="link">Reintentar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={tickets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TicketCard {...item} />}
      refreshing={loading}
      onRefresh={refetch}
    />
  );
}
```

---

## 15. DESPLIEGUE

### 15.1 Expo Application Services (EAS)

#### 15.1.1 Instalación de EAS CLI
```bash
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure
```

#### 15.1.2 Configuración `eas.json`
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      }
    }
  }
}
```

#### 15.1.3 Builds
```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Ver builds
eas build:list

# Descargar build
eas build:download --platform ios --latest
```

### 15.2 Despliegue Web

#### 15.2.1 Build Web
```bash
# Exportar proyecto web
npx expo export --platform web

# Output en: dist/
```

#### 15.2.2 Despliegue en Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Configuración vercel.json
{
  "buildCommand": "expo export --platform web",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

#### 15.2.3 Despliegue en Netlify
```bash
# netlify.toml
[build]
  command = "expo export --platform web"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 15.3 Over-the-Air Updates (OTA)

#### 15.3.1 Configuración de Updates
```bash
# Publicar update
eas update --branch production --message "Fix bug X"

# Ver updates
eas update:list

# Configurar canal
eas channel:create production
eas channel:create staging
```

#### 15.3.2 Configuración en App
```typescript
// app/_layout.tsx
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  // ... resto del layout
}
```

---

## 16. TROUBLESHOOTING

### 16.1 Problemas Comunes

#### 16.1.1 Error de Caché
```bash
# Síntoma: Cambios no se reflejan, errores extraños

# Solución:
npx expo start --clear
# o
rm -rf node_modules .expo .expo-shared
npm install
```

#### 16.1.2 Error de Metro Bundler
```bash
# Síntoma: "Metro bundler has encountered an error"

# Solución:
watchman watch-del-all
rm -rf $TMPDIR/metro-*
npx expo start --clear
```

#### 16.1.3 Error de TypeScript
```bash
# Síntoma: Tipos no reconocidos, errores de importación

# Solución:
npx tsc --noEmit  # Ver errores específicos
rm -rf node_modules/@types
npm install
```

#### 16.1.4 Error de Pods (iOS)
```bash
# Síntoma: CocoaPods errors en iOS

# Solución:
cd ios
pod deintegrate
pod install
cd ..
```

#### 16.1.5 Error de Gradle (Android)
```bash
# Síntoma: Build errors en Android

# Solución:
cd android
./gradlew clean
cd ..
```

### 16.2 Logs y Debugging

#### 16.2.1 Ver Logs
```bash
# Logs de Expo
npx expo start

# Logs de iOS
npx react-native log-ios

# Logs de Android
npx react-native log-android

# Logs del sistema
adb logcat  # Android
xcrun simctl spawn booted log stream  # iOS
```

#### 16.2.2 React DevTools
```bash
# Instalar React DevTools
npm install -g react-devtools

# Ejecutar
react-devtools

# En la app:
# - Shake device
# - Seleccionar "Toggle Element Inspector"
```

---

## 17. ROADMAP Y TODOS

### 17.1 Funcionalidades Pendientes

#### 17.1.1 Fase 1: Core Features (MVP)
- [ ] Sistema de autenticación (login/registro)
- [ ] Pantalla de lista de tickets
- [ ] Pantalla de detalle de ticket con QR
- [ ] Escáner de QR para validación
- [ ] Perfil de usuario básico
- [ ] Notificaciones push
- [ ] Sincronización offline

#### 17.1.2 Fase 2: Funcionalidades Avanzadas
- [ ] Búsqueda y filtros de tickets
- [ ] Historial de eventos asistidos
- [ ] Sistema de favoritos
- [ ] Compartir tickets
- [ ] Wallet integration (Apple Wallet, Google Pay)
- [ ] Mapa de ubicación del evento
- [ ] Chat de soporte

#### 17.1.3 Fase 3: Optimizaciones
- [ ] Implementar caché de imágenes
- [ ] Optimizar bundle size
- [ ] Implementar lazy loading
- [ ] Mejorar performance de listas
- [ ] Agregar analytics
- [ ] Implementar crash reporting
- [ ] A/B testing

### 17.2 Mejoras Técnicas Pendientes

#### 17.2.1 Código
- [ ] Migrar a Zustand/Redux para estado global
- [ ] Implementar i18n (internacionalización)
- [ ] Agregar más tests unitarios (coverage >80%)
- [ ] Implementar tests E2E con Detox
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Agregar pre-commit hooks (Husky + lint-staged)
- [ ] Implementar ESLint + Prettier

#### 17.2.2 Documentación
- [x] Crear `claude.md` completo
- [ ] Agregar Storybook para componentes
- [ ] Documentar API endpoints
- [ ] Crear guía de contribución
- [ ] Agregar changelog

#### 17.2.3 DevOps
- [ ] Configurar entornos (dev/staging/prod)
- [ ] Implementar feature flags
- [ ] Configurar monitoring (Sentry)
- [ ] Implementar analytics (Firebase/Mixpanel)
- [ ] Configurar logging centralizado

---

## 📝 NOTAS FINALES

Este documento es una guía completa y exhaustiva del proyecto **Futura Tickets Access App**. Debe ser actualizado constantemente a medida que el proyecto evoluciona.

### Mantenimiento de este documento:
- ✅ Actualizar cuando se agreguen nuevas funcionalidades
- ✅ Revisar y actualizar dependencias periódicamente
- ✅ Documentar decisiones arquitectónicas importantes
- ✅ Mantener los ejemplos de código actualizados

### Contacto y Recursos:
- **Documentación Expo**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Expo Router Docs**: https://expo.github.io/router
- **TypeScript Docs**: https://www.typescriptlang.org

---

**Última actualización**: 2025-10-08
**Versión del documento**: 1.0.0
**Mantenido por**: Equipo de desarrollo Futura Tickets
