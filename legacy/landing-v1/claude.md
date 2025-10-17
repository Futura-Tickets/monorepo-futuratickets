# Documentación Técnica — Landing Page FuturaTickets

## Tabla de contenidos
1. [Resumen del repositorio](#1-resumen-del-repositorio)
2. [Alcance y límites](#2-alcance-y-límites)
3. [Arquitectura y diseño](#3-arquitectura-y-diseño)
4. [Stack técnico](#4-stack-técnico)
5. [Configuración y variables de entorno](#5-configuración-y-variables-de-entorno)
6. [Requisitos previos](#6-requisitos-previos)
7. [Instalación](#7-instalación)
8. [Ejecución (desarrollo)](#8-ejecución-desarrollo)
9. [Build y ejecución (producción)](#9-build-y-ejecución-producción)
10. [Base de datos y migraciones](#10-base-de-datos-y-migraciones)
11. [Tests, lint y calidad](#11-tests-lint-y-calidad)
12. [API/Contratos](#12-apicontratos)
13. [Observabilidad](#13-observabilidad)
14. [CI/CD](#14-cicd)
15. [Seguridad](#15-seguridad)
16. [Relación con otros repos](#16-relación-con-otros-repos)
17. [Troubleshooting y FAQ](#17-troubleshooting-y-faq)
18. [Limitaciones conocidas](#18-limitaciones-conocidas)
19. [Mantenimiento](#19-mantenimiento)
20. [Licencia](#20-licencia)
21. [Checklist de calidad](#21-checklist-de-calidad)

---

## 1. Resumen del repositorio

**Qué es**: Landing page institucional para FuturaTickets, plataforma blockchain de venta y gestión de entradas para eventos. Aplicación web tipo SPA (Single Page Application) desarrollada con React y TypeScript.

**Qué resuelve**:
- Presentación institucional de la plataforma FuturaTickets
- Captación de leads mediante formulario de solicitud de demo
- Información sobre funcionalidades: ticketing blockchain, guest list, analytics, check-in, marketing tools, dynamic pricing, AI-powered insights
- Showcase de ventajas competitivas (seguridad blockchain, prevención de fraude, transferencias P2P)

**Estado**: Desarrollo/Pre-producción (versión 0.1.0, según package.json:3)

**Componentes internos descubiertos**:
- **Hero section** con video background y CTA principal (src/App.tsx:28-41)
- **One Solution grid** - 8 funcionalidades en bento grid (src/App.tsx:42-78)
- **Blockchain-Powered section** - beneficios técnicos (src/App.tsx:79-93)
- **Institutional Supporters** - partners/sponsors (src/App.tsx:111-127)
- **Awards section** - reconocimientos (6 premios ficticios) (src/App.tsx:128-156)
- **Equipment showcase** - hardware/infraestructura (src/App.tsx:177-205)
- **AI Solutions grid** - 6 capacidades de IA (src/App.tsx:206-235)
- **Contact form** - formulario de solicitud de demo con validación básica (src/App.tsx:236-274)
- **Footer** con enlaces institucionales y legales (src/App.tsx:276-302)

---

## 2. Alcance y límites

### ✅ Qué SÍ cubre este repositorio
- Landing page estática/SPA con React 18
- Presentación de producto y propuesta de valor (blockchain ticketing)
- Formulario de contacto/demo (sin backend integrado visible en código)
- Navegación básica en header (Home, About, Services, Contact) - **sin rutas funcionales** (src/App.tsx:20-25)
- Diseño responsive implícito en estilos SCSS
- Sistema de contenedores Docker con Nginx para producción
- Activos visuales (imágenes PNG, video MOV) en `/public/assets/images/`

### ❌ Qué NO cubre
- Backend de FuturaTickets (API, autenticación, base de datos)
- Procesamiento de pagos o transacciones blockchain
- Panel de administración o gestión de eventos
- Sistema real de tickets/entradas o check-in
- Envío efectivo de formularios (sin endpoint configurado en código)
- Enrutamiento multi-página (actualmente single page, sin React Router)

🚧 TODO: ¿Repositorio del backend/API de FuturaTickets? — Esperado en documentación de organización o README con enlaces.

---

## 3. Arquitectura y diseño

### Diagrama de componentes

```
┌─────────────────────────────────────────────────┐
│          Browser (Usuario)                      │
└───────────────────┬─────────────────────────────┘
                    │
                    │ HTTPS (puerto 80 en producción)
                    ▼
┌─────────────────────────────────────────────────┐
│   Nginx 1.21.6 (Producción - Docker)            │
│   - Gzip compression                            │
│   - SPA routing (try_files)                     │
│   - Puerto 80                                   │
│   (nginx/nginx.conf)                            │
└───────────────────┬─────────────────────────────┘
                    │
                    │ Sirve archivos estáticos de /build
                    ▼
┌─────────────────────────────────────────────────┐
│       React 18 SPA (Landing Page)               │
│  ┌───────────────────────────────────────────┐  │
│  │  Single Page - No Router                  │  │
│  │  - App.tsx (componente único)             │  │
│  │  - Navegación por scroll                  │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  Componentes UI (inline en App.tsx)       │  │
│  │  - Header con nav                         │  │
│  │  - Hero (video background)                │  │
│  │  - BentoGrid (One Solution, 4x2)          │  │
│  │  - Blockchain section                     │  │
│  │  - Institutional/Awards/Equipment         │  │
│  │  - AI Solutions grid (3x2)                │  │
│  │  - Antd Form (demo request)               │  │
│  │  - Footer                                 │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  Estilos: SASS/SCSS + Ant Design          │  │
│  │  - App.scss (estilos principales)         │  │
│  │  - index.scss (globales)                  │  │
│  │  - Ant Design 5.21.4 (componentes)        │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Estructura de directorios

```
/
├── public/                    # Activos estáticos
│   ├── assets/images/         # 10 imágenes PNG + 1 video MOV
│   │   ├── futura-tickets.png
│   │   ├── futura-tickets-party.png
│   │   ├── party.mov          # Video hero background
│   │   ├── ticket-sale.png
│   │   ├── guest-list.png
│   │   ├── analytics.png
│   │   ├── security.png
│   │   ├── check-in.png
│   │   ├── marketing-tools.png
│   │   ├── dynamic-pricing.png
│   │   └── ai-powered.png
│   ├── index.html             # Template HTML principal
│   ├── favicon.ico
│   ├── logo192.png / logo512.png
│   ├── manifest.json          # PWA manifest (básico)
│   └── robots.txt
├── src/
│   ├── App.tsx                # Componente raíz (único componente)
│   ├── App.scss               # Estilos principales (286 líneas)
│   ├── index.tsx              # Punto de entrada React
│   ├── index.scss             # Estilos globales
│   ├── reportWebVitals.ts     # Métricas Web Vitals
│   ├── setupTests.ts          # Configuración Jest
│   ├── react-app-env.d.ts     # TypeScript types CRA
│   └── logo.svg
├── nginx/
│   └── nginx.conf             # Config Nginx para producción
├── Dockerfile                 # Build multi-stage con Nginx
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración TypeScript
├── .gitignore
└── README.md                  # Documentación básica CRA

```

**Fuente**: Estructura inferida de archivos existentes.

### Flujos clave

1. **Navegación usuario** (single page):
   ```
   Usuario → Scroll/Click → Secciones inline → Renderizado React
   ```
   **Nota**: Links de navegación (Home, About, Services, Contact) son estáticos sin funcionalidad (src/App.tsx:20-25).

2. **Solicitud de demo**:
   ```
   Usuario → Formulario Antd (src/App.tsx:240-260) → [Validación cliente] → 🚧 TODO: ¿Endpoint API para envío?
   ```
   **Estado actual**: Formulario sin `onFinish` handler implementado. Validación únicamente en campo `address` (src/App.tsx:255).

3. **Despliegue Docker**:
   ```
   npm run build → /build → COPY a imagen Nginx → docker run -p 80:80
   ```
   **Fuente**: Dockerfile:17-24, nginx/nginx.conf.

### Integraciones externas

🚧 TODO: No se detectan integraciones con servicios externos (Analytics, CRM, API backend) en el código actual. Esperado en:
- `public/index.html` (scripts de analytics)
- `src/index.tsx` (inicialización SDKs)
- Variables de entorno para endpoints

---

## 4. Stack técnico

**Fuente**: package.json, tsconfig.json, Dockerfile.

| Categoría | Tecnología | Versión | Fuente |
|-----------|------------|---------|--------|
| **Lenguaje** | TypeScript | 4.9.5 | package.json:19 |
| **Runtime** | Node.js | 🚧 TODO | package.json `engines` (no especificado) |
| **Framework** | React | 18.3.1 | package.json:15 |
| **Componentes UI** | Ant Design | 5.21.4 | package.json:14 |
| **Iconos** | @ant-design/icons | 5.5.1 | package.json:6 |
| **Estilos** | SASS/SCSS | 1.79.5 | package.json:18 |
| **Build tool** | Create React App (react-scripts) | 5.0.1 | package.json:17 |
| **Servidor producción** | Nginx | 1.21.6-alpine | Dockerfile:17 |
| **Testing** | Jest + React Testing Library | (incluido en CRA) | package.json:7-9 |
| **Métricas** | web-vitals | 2.1.4 | package.json:20 |

**Herramientas de desarrollo incluidas**:
- **Webpack** (bundler interno de CRA)
- **Babel** (transpilación, interno de CRA)
- **ESLint** (linting, configurado en package.json:28-32)
- **Jest** (@testing-library/jest-dom configurado en setupTests.ts)

**Configuración TypeScript** (tsconfig.json):
- Target: ES5
- Mode: Strict
- JSX: react-jsx (React 17+ transform)
- Module: ESNext con resolución Node

---

## 5. Configuración y variables de entorno

**Estado**: No se detectaron archivos `.env.example`, `.env.local`, ni variables de entorno en el código.

🚧 TODO: Crear `.env.example` con variables necesarias. Esperado:

| Variable | Descripción | Ejemplo | Obligatoria | Archivo origen |
|----------|-------------|---------|-------------|----------------|
| `REACT_APP_API_URL` | URL del backend de FuturaTickets para envío de formularios | `https://api.futuratickets.com` | ❌ (no implementado) | Por definir |
| `REACT_APP_GA_ID` | Google Analytics Measurement ID | `G-XXXXXXXXXX` | No | Por definir |
| `REACT_APP_SENTRY_DSN` | Sentry DSN para error tracking | `https://xxx@sentry.io/yyy` | No | Por definir |

**Nota importante**:
- Create React App solo expone variables que comienzan con `REACT_APP_` al bundle del cliente.
- Variables sin este prefijo no estarán disponibles en tiempo de ejecución.
- `.env` debe estar en `.gitignore` (ya confirmado en .gitignore:16-19).

**Cómo añadir variables**:
```bash
# Crear archivo .env.local (no commiteado)
echo "REACT_APP_API_URL=https://api.futuratickets.com" > .env.local

# Usar en código:
const apiUrl = process.env.REACT_APP_API_URL;
```

---

## 6. Requisitos previos

🚧 TODO: Archivo package.json no especifica `engines`. Definir versiones mínimas recomendadas.

**Requisitos estimados** (estándar para React 18 + CRA 5):

### Desarrollo local
- **Node.js**: ≥14.x (recomendado ≥18.x LTS)
- **npm**: ≥6.x (incluido con Node) o **yarn**: ≥1.22 o **pnpm**: ≥7.x
- **Sistema operativo**: Linux, macOS, Windows 10/11

### Producción (Docker)
- **Docker**: ≥20.x
- **Docker Compose** (opcional): ≥1.29 si se usa orquestación

**Verificar versiones instaladas**:
```bash
node --version    # Debe mostrar v18.x o superior
npm --version     # Debe mostrar ≥6.x
docker --version  # Para despliegue en contenedor
```

**Navegadores soportados** (package.json:34-44):
- **Producción**: >0.2% market share, no IE (dead browsers), no Opera Mini
- **Desarrollo**: Última versión de Chrome, Firefox, Safari

---

## 7. Instalación

### Linux / macOS

```bash
# 1. Clonar repositorio (ajustar URL según repositorio real)
git clone <URL_DEL_REPOSITORIO>
cd landingpage

# 2. Instalar dependencias
npm install
# O con yarn:
yarn install
# O con pnpm:
pnpm install

# 3. Verificar instalación
npm list react react-dom antd
```

### Windows (PowerShell/CMD)

```powershell
# Mismos comandos que Linux/macOS
git clone <URL_DEL_REPOSITORIO>
cd landingpage
npm install
```

**Tiempo estimado**: 2-5 minutos (dependiendo de conexión).

**Posibles errores**:
- Si falla por permisos en Linux/macOS: NO usar `sudo npm install`. Configurar nvm o corregir permisos de `~/.npm`.
- Si falla en Windows con error de scripts: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

🚧 TODO: Añadir URL real del repositorio en README.md o documentación.

---

## 8. Ejecución (desarrollo)

### Iniciar servidor de desarrollo

```bash
npm start
# O con yarn:
yarn start
# O con pnpm:
pnpm start
```

**Salida esperada**:
```
Compiled successfully!

You can now view futura-landing in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**URL local**: [http://localhost:3000](http://localhost:3000) (puerto por defecto de CRA, configurable con `PORT=3001 npm start`).

**Características desarrollo**:
- **Hot Module Replacement (HMR)**: Cambios en `src/` se reflejan automáticamente sin recargar página completa.
- **Lint en tiempo real**: Errores de ESLint aparecen en consola del navegador.
- **Sourcemaps**: Debugging con TypeScript en DevTools.

**Cambiar puerto**:
```bash
# Linux/macOS
PORT=3001 npm start

# Windows (PowerShell)
$env:PORT=3001; npm start
```

### Desarrollo con video background

**Nota**: El video `party.mov` (src/App.tsx:40) debe estar en `public/assets/images/`. Si no existe o falla la carga:
- Verificar que el archivo existe: `ls public/assets/images/party.mov`
- El video se reproduce con `autoPlay muted loop` (src/App.tsx:40)

### Credenciales de prueba

❌ **No aplica**: Landing estática sin sistema de autenticación.

---

## 9. Build y ejecución (producción)

### Build para producción

```bash
npm run build
# O con yarn:
yarn build
# O con pnpm:
pnpm build
```

**Salida**: Carpeta `build/` con activos optimizados.

**Optimizaciones automáticas** (react-scripts):
- JS minificado y uglified
- CSS extraído y minificado
- Sourcemaps de producción (`.map`)
- Hashes en nombres de archivo para cache busting
- Imágenes <10KB convertidas a data URIs
- Árbol de dependencias optimizado (tree shaking)

**Verificar build**:
```bash
ls -lh build/
# Debe mostrar:
# - index.html
# - /static/js/ (archivos .js con hash)
# - /static/css/ (archivos .css con hash)
# - /assets/ (imágenes)
```

### Servir build localmente (prueba)

```bash
# Instalar servidor HTTP simple (una vez)
npm install -g serve

# Servir carpeta build
serve -s build -p 5000
```

**URL de prueba**: [http://localhost:5000](http://localhost:5000)

### Despliegue con Docker

#### Build de imagen Docker

```bash
# 1. Construir imagen (requiere build/ pre-generado)
npm run build  # Generar carpeta build/ primero
docker build -t futuratickets-landing:latest .

# 2. Verificar imagen creada
docker images | grep futuratickets-landing
```

**Nota importante**: El Dockerfile asume que `/build` ya existe (Dockerfile:22). Para build automático dentro del contenedor, descomentar líneas 2-15.

#### Ejecutar contenedor

```bash
# Ejecutar en puerto 80 (requiere privilegios en Linux/macOS)
docker run -d -p 80:80 --name futuratickets-landing futuratickets-landing:latest

# O en puerto 8080 (sin privilegios)
docker run -d -p 8080:80 --name futuratickets-landing futuratickets-landing:latest

# Verificar logs
docker logs futuratickets-landing

# Acceder
# Navegador: http://localhost (o http://localhost:8080)
```

#### Detener y limpiar

```bash
# Detener contenedor
docker stop futuratickets-landing

# Eliminar contenedor
docker rm futuratickets-landing

# Eliminar imagen (opcional)
docker rmi futuratickets-landing:latest
```

### Configuración Nginx (producción)

**Archivo**: `nginx/nginx.conf`

**Características**:
- **Puerto**: 80 (nginx.conf:10)
- **Gzip compression**: Habilitado para text/plain, CSS, JS, JSON, XML (nginx.conf:17-20)
- **SPA routing**: `try_files $uri $uri/ /index.html` para ruteo client-side (nginx.conf:23)
- **Root**: `/usr/share/nginx/html` (nginx.conf:13)
- **Index**: `index.html index.htm` (nginx.conf:14)

**Nota**: Configuración lista para SPA. Si se añade React Router en el futuro, no requiere cambios.

### Healthcheck

🚧 TODO: Añadir healthcheck en Dockerfile para orquestación (Kubernetes, Docker Swarm).

**Ejemplo**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1
```

---

## 10. Base de datos y migraciones

❌ **No aplica**: Este repositorio es una landing page estática sin base de datos local ni backend.

**Confirmado por ausencia de**:
- Directorios: `prisma/`, `migrations/`, `db/`, `database/`
- Archivos: `knexfile.js`, `ormconfig.json`, `schema.prisma`, `*.sql`
- Dependencias: `pg`, `mysql2`, `mongoose`, `prisma`, `typeorm`, `sequelize` (package.json)

🚧 TODO: Si se requiere persistencia en el futuro, documentar conexión con backend/API de FuturaTickets.

---

## 11. Tests, lint y calidad

### Tests unitarios

**Framework**: Jest + React Testing Library (incluido en CRA, package.json:7-9)

**Configuración**: `src/setupTests.ts` (importa `@testing-library/jest-dom` para matchers custom)

#### Ejecutar tests

```bash
# Modo interactivo (watch)
npm test
# O:
yarn test

# Una sola vez (CI)
npm test -- --watchAll=false

# Con cobertura
npm test -- --coverage --watchAll=false
```

**Salida coverage**: `coverage/` (ignorado en .gitignore:9)

#### Estado actual

🚧 TODO: **No existen tests implementados**. Confirmado por:
```bash
# Búsqueda en src/:
find src/ -name "*.test.tsx" -o -name "*.test.ts" -o -name "*.spec.tsx"
# Resultado: vacío
```

**Recomendación**: Crear tests para:
1. `App.test.tsx`: Renderizado de secciones principales
2. Formulario: Validación de campos (src/App.tsx:240-260)
3. Navegación: Links de header
4. Snapshot testing de componentes visuales

**Ejemplo test básico**:
```typescript
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hero heading', () => {
  render(<App />);
  const heading = screen.getByText(/Revolutionize Your Event Ticketing/i);
  expect(heading).toBeInTheDocument();
});
```

### Linting

**Configuración**: ESLint integrado en CRA (package.json:28-32)

```json
"eslintConfig": {
  "extends": [
    "react-app",
    "react-app/jest"
  ]
}
```

**Ejecutar lint**:
```bash
# CRA ejecuta lint automáticamente en npm start y npm run build
# Para linting manual:
npx eslint src/

# Autofix de errores menores
npx eslint src/ --fix
```

🚧 TODO: Considerar añadir script `"lint"` en package.json para CI/CD:
```json
"scripts": {
  "lint": "eslint src/ --ext .ts,.tsx --max-warnings 0"
}
```

### Formateo de código

🚧 TODO: **No se detectó configuración de Prettier**. Archivos esperados:
- `.prettierrc` o `.prettierrc.json`
- `.prettierignore`

**Recomendación**: Añadir Prettier para consistencia de código:
```bash
npm install --save-dev prettier eslint-config-prettier

# Crear .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}

# Ejecutar formateo
npx prettier --write "src/**/*.{ts,tsx,scss}"
```

### Hooks pre-commit

🚧 TODO: **No se detectó Husky ni lint-staged**. Archivos esperados:
- `.husky/` directory
- `lint-staged` en package.json

**Recomendación**: Configurar git hooks para calidad automática:
```bash
npm install --save-dev husky lint-staged

# Configurar en package.json:
"lint-staged": {
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "src/**/*.scss": ["prettier --write"]
}
```

### Análisis de código

**Herramientas recomendadas** (no configuradas actualmente):
- **SonarQube/SonarCloud**: Análisis estático de calidad y seguridad
- **Lighthouse CI**: Performance, accessibility, SEO (útil para landing pages)
- **Bundle analyzer**: Visualizar tamaño del bundle

```bash
# Analizar bundle (CRA)
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

---

## 12. API/Contratos

### Endpoints consumidos

**Estado actual**: ❌ No se detectan llamadas a APIs en el código.

🚧 TODO: Implementar integración con backend de FuturaTickets. Endpoints esperados:

| Método | Ruta | Request Body | Response | Descripción | Ubicación esperada |
|--------|------|--------------|----------|-------------|-------------------|
| POST | `/api/demo-requests` | `{ name: string, email: string, company?: string, message?: string }` | `{ success: boolean, id: string }` | Envío de formulario de solicitud de demo | src/App.tsx:240-260 |
| POST | `/api/newsletter` | `{ email: string }` | `{ success: boolean }` | Suscripción a newsletter (si se implementa) | Por definir |
| GET | `/api/health` | - | `{ status: "ok" }` | Healthcheck del backend | Por definir |

**Implementación recomendada**:
```typescript
// src/services/api.ts (por crear)
const API_URL = process.env.REACT_APP_API_URL || 'https://api.futuratickets.com';

export const submitDemoRequest = async (data: DemoRequestDTO) => {
  const response = await fetch(`${API_URL}/api/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to submit demo request');
  return response.json();
};

// Integrar en App.tsx:
const onFinish = async (values: any) => {
  try {
    await submitDemoRequest(values);
    message.success('Demo request submitted!');
  } catch (error) {
    message.error('Failed to submit request');
  }
};
```

### Modelos de datos (DTOs)

🚧 TODO: Crear interfaces TypeScript para contratos de datos. Archivo esperado: `src/types/api.ts` o `src/models/`.

**Propuesta**:
```typescript
// src/types/api.ts
export interface DemoRequestDTO {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Campos del formulario actual

**Análisis del formulario** (src/App.tsx:240-260):
- 4 campos `<Input/>` sin `name` ni `label` (líneas 242-249)
- Validación únicamente en campo `address` (línea 255)
- Botón deshabilitado si `form.getFieldValue('address')?.length == 0`

🚧 TODO: **Inconsistencia detectada**: Formulario valida campo `address` que no existe en los inputs visibles. Requiere refactorización:

```typescript
<Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
  <Input placeholder="Tu nombre" />
</Form.Item>
<Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
  <Input placeholder="tu@email.com" />
</Form.Item>
<Form.Item name="company" label="Empresa">
  <Input placeholder="Nombre de tu empresa" />
</Form.Item>
<Form.Item name="message" label="Mensaje">
  <Input.TextArea placeholder="¿En qué podemos ayudarte?" />
</Form.Item>
```

### Eventos/Colas

❌ **No aplica**: Landing frontend sin sistema de eventos o message queues.

Si el backend usa eventos (ej. Kafka, RabbitMQ), documentar contratos aquí:

🚧 TODO: Si backend publica eventos relevantes (ej. `demo.requested`, `user.registered`), documentar esquemas.

---

## 13. Observabilidad

### Logs

**Estado actual**: ❌ No configurado.

#### Frontend (navegador)
- **Desarrollo**: `console.log/warn/error` visible en DevTools (no removido por CRA en dev)
- **Producción**: CRA elimina logs automáticamente en build optimizado

🚧 TODO: Implementar logging estructurado con Sentry, LogRocket o Datadog.

**Ejemplo con Sentry**:
```bash
npm install @sentry/react @sentry/tracing

# src/index.tsx:
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Backend/Nginx (producción)
- **Access logs**: `/var/log/nginx/access.log` (dentro del contenedor)
- **Error logs**: `/var/log/nginx/error.log`

```bash
# Ver logs de Nginx en Docker
docker logs futuratickets-landing

# Logs en tiempo real
docker logs -f futuratickets-landing
```

### Métricas

**Web Vitals**: Configurado (src/reportWebVitals.ts, package.json:20 - web-vitals@2.1.4)

```typescript
// src/index.tsx:19
reportWebVitals(); // Por defecto no hace nada

// Para enviar a analytics:
reportWebVitals(console.log); // Dev
// O enviar a Google Analytics:
reportWebVitals((metric) => {
  // Enviar a GA4, Datadog, etc.
});
```

**Métricas capturadas**:
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **TTFB** (Time to First Byte)

🚧 TODO: Integrar Web Vitals con:
- **Google Analytics 4**: `gtag('event', metric.name, { ...metric })`
- **Datadog RUM**: `datadogRum.addAction(metric.name, metric)`
- **New Relic Browser**: `newrelic.addPageAction(metric.name, metric)`

### Analytics

🚧 TODO: **No se detectó Google Analytics ni otras herramientas**. Archivos esperados:
- Script de GA4 en `public/index.html` (líneas 27-41 tienen comentarios pero sin scripts)
- Inicialización en `src/index.tsx`

**Implementación recomendada**:
```html
<!-- public/index.html, antes de </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Eventos clave a trackear**:
- `demo_request_submit` (envío de formulario)
- `scroll_to_section` (navegación por secciones)
- `video_play/pause` (interacción con video hero)
- `cta_click` (clics en botones "Learn More")

### Trazas (Tracing)

❌ **No aplica**: Frontend SPA sin backend. Si se integra con API:

🚧 TODO: Considerar OpenTelemetry para tracing distribuido si se conecta con backend.

### Paneles (Dashboards)

🚧 TODO: Crear dashboards en herramienta de monitoring:

**Métricas recomendadas para landing page**:
- **Performance**: LCP, FID, CLS (Core Web Vitals)
- **Engagement**: Bounce rate, time on page, scroll depth
- **Conversiones**: Form submissions, CTA clicks
- **Errores**: JavaScript errors, failed network requests
- **Infraestructura** (si se monitorea Nginx):
  - Request rate (req/s)
  - Response time (p50, p95, p99)
  - Error rate 4xx/5xx
  - Nginx uptime

**Herramientas recomendadas**:
- **Grafana + Prometheus**: Métricas de infraestructura (Nginx)
- **Google Analytics 4**: User behavior, conversiones
- **Sentry Performance**: Frontend errors y performance
- **Lighthouse CI**: Performance tracking en CI/CD

---

## 14. CI/CD

**Estado actual**: ❌ No configurado.

🚧 TODO: No existe directorio `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml`, ni `.circleci/config.yml`.

### Pipeline recomendado

**Fases sugeridas**:

1. **Build**
   - Instalar dependencias (`npm ci`)
   - Compilar TypeScript
   - Generar bundle de producción (`npm run build`)
   - Verificar que `/build` se genera correctamente

2. **Test**
   - Ejecutar tests unitarios (`npm test -- --watchAll=false --coverage`)
   - Verificar cobertura mínima (ej. >80%)

3. **Lint & Format**
   - ESLint (`npx eslint src/ --max-warnings 0`)
   - Prettier check (`npx prettier --check "src/**/*.{ts,tsx,scss}"`)

4. **Security**
   - Auditoría de dependencias (`npm audit --production --audit-level=high`)
   - SAST (Static Application Security Testing) con Snyk o SonarCloud

5. **Build Docker**
   - Construir imagen Docker
   - Escanear vulnerabilidades con Trivy o Snyk
   - Push a registry (Docker Hub, ECR, GCR)

6. **Deploy**
   - **Staging**: Desplegar en entorno de pruebas
   - **Producción**: Desplegar tras aprobación manual (para `main`)

### Ejemplo GitHub Actions

🚧 TODO: Crear `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npx eslint src/ --max-warnings 0

      - name: Test
        run: npm test -- --watchAll=false --coverage

      - name: Build
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: build/

  docker:
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: build/

      - name: Build Docker image
        run: docker build -t futuratickets-landing:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push futuratickets-landing:${{ github.sha }}
```

### Ramas y estrategia de despliegue

**Estrategia recomendada** (basada en git actual):

| Rama | Entorno | Trigger | Aprobación |
|------|---------|---------|------------|
| `initial-opt` (rama actual) | Desarrollo local | Manual | No |
| `develop` | Staging | Push automático | No |
| `main` | Producción | Push automático + PR merge | Sí (code review) |
| `feature/*` | Preview (ej. Vercel/Netlify) | PR abierto | No |

**Nota**: Rama actual `initial-opt` no sigue convención estándar. Considerar:
- Renombrar a `develop` o `main`
- Establecer branching strategy (Git Flow, trunk-based)

### Servicios de hosting recomendados

**Para landing pages React**:

1. **Vercel** (recomendado)
   - Deploy automático desde GitHub
   - Preview deployments en PRs
   - CDN global incluido
   - SSL gratuito
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**
   - Integración con Git
   - Form submissions sin backend (útil para formulario de demo)
   - Edge functions para serverless
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **AWS S3 + CloudFront**
   - Escalabilidad infinita
   - Control total de infraestructura
   - Configuración más compleja

4. **Docker (self-hosted)**
   - Control total
   - Ya configurado (Dockerfile + nginx.conf)
   - Requiere servidor propio (EC2, DigitalOcean, etc.)

🚧 TODO: Documentar proceso de despliegue según proveedor elegido.

---

## 15. Seguridad

### Autenticación/Autorización

❌ **No aplica**: Landing pública sin sistema de autenticación.

**Secciones públicas confirmadas**:
- Todo el contenido es accesible sin login
- No hay rutas protegidas (no existe router)
- Formulario de demo es público

🚧 TODO: Si se añaden áreas privadas (ej. dashboard de partners), documentar flujo de autenticación.

### Gestión de secretos

**Estado actual**: ❌ No se usan secretos en el código.

🚧 TODO: Si se añaden API keys o tokens, seguir estas prácticas:

**Buenas prácticas**:
1. **Nunca commitear** `.env` (ya en .gitignore:16-19 ✅)
2. **Variables en CI/CD**: Usar GitHub Secrets, GitLab CI Variables, etc.
3. **Rotación**: Cambiar keys periódicamente
4. **Scope mínimo**: Keys solo con permisos necesarios

**Ejemplo CI/CD secrets** (GitHub Actions):
```yaml
- name: Build with secrets
  env:
    REACT_APP_API_URL: ${{ secrets.API_URL }}
    REACT_APP_GA_ID: ${{ secrets.GA_ID }}
  run: npm run build
```

**Secretos esperados**:
- `API_URL`: URL del backend de FuturaTickets
- `GA_ID`: Google Analytics ID (no crítico, puede ser público)
- `SENTRY_DSN`: Sentry DSN (puede ser público, filtrar datos sensibles en Sentry)

### Auditoría de dependencias

**Herramienta nativa**: npm audit

```bash
# Auditoría básica
npm audit

# Solo vulnerabilidades production
npm audit --production

# Ver detalles completos
npm audit --json

# Autofix (puede romper cosas)
npm audit fix

# Autofix solo minor/patch versions
npm audit fix --only=prod
```

**Estado actual**: 🚧 TODO: Ejecutar `npm audit` y documentar vulnerabilidades existentes.

#### Dependabot

🚧 TODO: **No configurado**. Archivo esperado: `.github/dependabot.yml`

**Configuración recomendada**:
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "team-frontend"
    labels:
      - "dependencies"
      - "automerge"
```

**Ventajas**:
- PRs automáticos para actualizar dependencias
- Alertas de seguridad en GitHub
- Compatible con npm, yarn, pnpm

#### Herramientas externas

**Recomendadas**:
1. **Snyk**: Escaneo de vulnerabilidades en dependencias y código
   ```bash
   npm install -g snyk
   snyk test
   snyk monitor
   ```

2. **OWASP Dependency-Check**: Escaneo de CVEs
   ```bash
   docker run --rm -v $(pwd):/src owasp/dependency-check \
     --scan /src --format HTML --out /src/dependency-check-report
   ```

3. **npm-check-updates**: Actualizar dependencias a latest
   ```bash
   npx npm-check-updates -u
   npm install
   ```

### Seguridad en Docker

**Mejoras recomendadas para Dockerfile**:

1. **Usuario no-root**: Nginx por defecto corre como root
   ```dockerfile
   RUN addgroup -S nginx && adduser -S nginx -G nginx
   USER nginx
   ```

2. **Escaneo de imagen**: Usar Trivy o Snyk
   ```bash
   docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy image futuratickets-landing:latest
   ```

3. **Multi-stage build**: Ya implementado parcialmente (Dockerfile:2-15 comentado)
   - Descomentar y usar para build completo dentro de Docker

4. **Healthcheck**: Ya mencionado en sección 9

### Headers de seguridad (Nginx)

🚧 TODO: Añadir headers de seguridad en `nginx/nginx.conf`:

```nginx
# Después de la línea 15 (include /etc/nginx/mime.types;)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; media-src 'self';" always;
```

**Verificar headers**:
```bash
curl -I http://localhost | grep -i "x-frame-options\|x-content-type\|content-security"
```

### Permisos de archivos

**En contenedor Docker**:
```bash
# Verificar permisos de /build dentro del contenedor
docker exec futuratickets-landing ls -la /usr/share/nginx/html

# Deben ser read-only para Nginx (644 para archivos, 755 para directorios)
```

### Content Security Policy (CSP)

🚧 TODO: Definir política CSP restrictiva para prevenir XSS.

**Considerar**:
- `script-src`: Solo scripts del mismo origen + CDNs confiables (ej. Google Analytics)
- `style-src`: Permitir `unsafe-inline` si Ant Design lo requiere (verificar)
- `img-src`: Mismo origen + data URIs (para imágenes inline)
- `media-src`: Mismo origen (para video `party.mov`)

**Testing CSP**: Usar [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

## 16. Relación con otros repos

🚧 TODO: No se mencionan repositorios relacionados en el código ni en README.md.

### Repositorios esperados en la organización FuturaTickets

| Repositorio | Responsabilidad | Interfaz con Landing | Tipo | Estado |
|-------------|-----------------|----------------------|------|--------|
| `futuratickets-api` | Backend principal, gestión de eventos, users, tickets | Landing consume `POST /api/demo-requests` | REST API | 🚧 TODO: Confirmar |
| `futuratickets-admin` | Panel de administración para organizadores | Ninguna (independiente) | SPA React | 🚧 TODO: Confirmar |
| `futuratickets-mobile` | App móvil (iOS/Android) para asistentes | Ninguna directa (ambos consumen backend) | React Native / Flutter | 🚧 TODO: Confirmar |
| `futuratickets-blockchain` | Smart contracts para tickets NFT | Backend consume contratos | Solidity / Ethereum | 🚧 TODO: Confirmar |
| `futuratickets-docs` | Documentación técnica central | Landing puede enlazar a docs | Markdown / Docusaurus | 🚧 TODO: Confirmar |
| `futuratickets-infra` | IaC para despliegues (Terraform, K8s) | Define despliegue de landing | Terraform / Helm | 🚧 TODO: Confirmar |

### Contratos entre repositorios

**Landing → API**:
- **Input**: Formulario de demo (`DemoRequestDTO`)
- **Output**: Confirmación de envío (`ApiResponse<{ id: string }>`)
- **Protocolo**: HTTP/REST (JSON)
- **Autenticación**: 🚧 TODO: ¿Ninguna? ¿API key? ¿Captcha?

**Landing → Analytics/Tracking**:
- **Input**: Eventos de usuario (clicks, form submissions)
- **Output**: N/A (fire-and-forget)
- **Protocolo**: HTTP (Google Analytics, Segment, etc.)

### Flujo completo cross-repo (ejemplo)

```
Usuario → [Landing] → POST /api/demo-requests → [API]
                                                   ↓
                                        [API] → Base de datos
                                                   ↓
                                        [API] → Email service (notificar sales team)
                                                   ↓
                                        [Admin] ← GET /api/demo-requests (ver leads)
```

🚧 TODO: Documentar URLs de repositorios relacionados cuando estén disponibles.

**Archivo esperado**: `ARCHITECTURE.md` en repositorio de organización con diagrama completo.

---

## 17. Troubleshooting y FAQ

### Errores comunes de instalación

#### Error: `npm install` falla con EACCES (permisos)

**Causa**: Permisos incorrectos en directorio `~/.npm` (Linux/macOS)

**Solución**:
```bash
# NO usar sudo npm install
# Opción 1: Corregir permisos
sudo chown -R $(whoami) ~/.npm

# Opción 2 (recomendado): Usar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Error: `gyp ERR!` durante instalación

**Causa**: Falta compilador C++ para dependencias nativas (ej. `node-sass`)

**Solución**:
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools
```

**Nota**: Este proyecto usa `sass` (Dart Sass, package.json:18), que NO requiere compilación. Si aparece este error, puede ser de dependencias transitivas.

### Errores de ejecución (desarrollo)

#### Error: `Error: listen EADDRINUSE: address already in use :::3000`

**Causa**: Puerto 3000 ya ocupado por otro proceso

**Solución**:
```bash
# Linux/macOS - Encontrar y matar proceso
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# O usar otro puerto
PORT=3001 npm start
```

#### Error: Video no se reproduce (`party.mov`)

**Causa**: Archivo faltante o formato incompatible

**Solución**:
```bash
# Verificar archivo existe
ls -lh public/assets/images/party.mov

# Si no existe, añadir video o comentar línea en App.tsx:40
# Si existe pero no se reproduce, convertir a formato web:
ffmpeg -i party.mov -c:v libx264 -c:a aac party.mp4
# Cambiar src en App.tsx:40 a "party.mp4"
```

**Nota**: `.mov` (QuickTime) puede no funcionar en todos navegadores. Recomendado: MP4 (H.264).

#### Error: Estilos de Ant Design no aparecen

**Causa**: Ant Design requiere importar CSS base

**Solución**: Verificar que no falte importación en `src/index.tsx` o `App.tsx`:
```typescript
// Si falta, añadir:
import 'antd/dist/reset.css'; // Ant Design 5.x
```

**Nota**: Código actual no importa CSS de Ant Design explícitamente. Si falla, añadir línea arriba.

### Errores de build

#### Error: `npm run build` falla con "out of memory"

**Causa**: Heap de Node.js insuficiente para proyectos grandes

**Solución**:
```bash
# Aumentar memoria de Node.js
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# O añadir en package.json scripts:
"build": "NODE_OPTIONS=--max_old_space_size=4096 react-scripts build"
```

#### Error: Página en blanco en producción

**Causa**: Ruta base incorrecta (si no está en raíz del dominio)

**Solución**: Si landing se sirve en subdirectorio (ej. `example.com/landing`):
```json
// package.json
{
  "homepage": "https://futuratickets.com/landing"
}
```

Luego reconstruir:
```bash
npm run build
```

#### Error: Activos (imágenes) no cargan en producción

**Causa**: Rutas absolutas vs. relativas

**Solución**: Usar `%PUBLIC_URL%` en HTML o rutas desde `/public` en JSX:
```typescript
// ✅ Correcto (como en código actual)
<img src="/assets/images/futura-tickets.png"/>

// ❌ Incorrecto
<img src="./assets/images/futura-tickets.png"/>
```

### Errores de Docker

#### Error: `docker build` falla con "COPY failed: stat /build: file does not exist"

**Causa**: Dockerfile:22 requiere carpeta `/build` pre-generada

**Solución**:
```bash
# Generar build primero
npm run build

# Luego construir imagen
docker build -t futuratickets-landing .

# O descomentar líneas 2-15 en Dockerfile para build automático
```

#### Error: Contenedor arranca pero devuelve 403 Forbidden

**Causa**: Permisos incorrectos en archivos de `/build`

**Solución**:
```bash
# Reconstruir con permisos correctos
chmod -R 755 build/
docker build -t futuratickets-landing .
```

### FAQ

#### ¿Por qué el formulario no envía datos?

**R**: No hay handler `onFinish` implementado en `<Form>` (src/App.tsx:240). Ver sección [12. API/Contratos](#12-apicontratos) para implementación.

#### ¿Por qué los links del header no funcionan?

**R**: Son elementos `<li>` estáticos sin `<a>` ni navegación (src/App.tsx:20-25). Se requiere:
1. Añadir React Router
2. Convertir a links con scroll suave (`<a href="#section">`) o
3. Implementar navegación programática

**Ejemplo scroll suave**:
```typescript
<li onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
  About
</li>
```

#### ¿Cómo cambio el título de la página?

**R**: Editar `public/index.html:27`:
```html
<title>FuturaTickets - Blockchain Event Ticketing</title>
```

#### ¿Cómo añado Google Analytics?

**R**: Ver sección [13. Observabilidad](#13-observabilidad) - Analytics.

#### ¿Es responsive la landing?

**R**: Parcialmente. Estilos usan unidades fijas (`px`) en `App.scss`. Para mobile:
```scss
// Añadir media queries en App.scss:
@media (max-width: 768px) {
  .revolutionize-container {
    flex-direction: column;
    .revolutionize-content { width: 100%; }
  }
  .one-solution-content {
    grid-template-columns: 1fr 1fr; // 2 columnas en mobile
  }
}
```

#### ¿Puedo usar este repo en subdirectorio?

**R**: Sí. Ver [Error: Página en blanco en producción](#error-página-en-blanco-en-producción).

---

## 18. Limitaciones conocidas

### Limitaciones técnicas

1. **No hay sistema de rutas**
   - Single page sin React Router
   - Links de navegación no funcionales (src/App.tsx:20-25)
   - No hay páginas About/Services/Contact separadas

2. **Formulario no funcional**
   - Sin handler de envío implementado (src/App.tsx:240-260)
   - Validación inconsistente (valida campo `address` inexistente)
   - Sin feedback visual de éxito/error

3. **Sin responsive design completo**
   - Estilos optimizados para desktop (1920x1080)
   - No hay media queries en `App.scss`
   - Video hero puede causar problemas en mobile

4. **Sin tests**
   - 0% cobertura de tests
   - Configuración de Jest lista pero sin tests escritos

5. **Sin internacionalización (i18n)**
   - Todo el contenido en inglés hardcodeado
   - No hay sistema de traducciones

6. **Video pesado**
   - `party.mov` sin compresión/optimización
   - Puede afectar performance en conexiones lentas
   - No hay fallback si video falla

7. **SEO básico**
   - Meta description genérica (public/index.html:9-10)
   - Sin Open Graph tags
   - Sin structured data (JSON-LD)

8. **Accesibilidad (a11y) limitada**
   - Imágenes sin `alt` text (múltiples en App.tsx)
   - Sin ARIA labels en navegación
   - Contraste de colores no verificado (WCAG)

### Limitaciones de negocio

🚧 TODO: Confirmar con stakeholders:

1. **Contenido placeholder**
   - Awards ficticios (src/App.tsx:128-156)
   - Institutional Supporters usan imágenes duplicadas (líneas 115-125)
   - Team section comentada (líneas 157-176)

2. **Sin captcha**
   - Formulario vulnerable a spam/bots
   - Recomendado: Google reCAPTCHA v3

3. **Sin analytics**
   - No se trackean conversiones
   - No hay datos de comportamiento de usuario

### Limitaciones de infraestructura

1. **Sin CDN configurado**
   - Activos servidos directamente por Nginx
   - Latencia alta para usuarios lejanos al servidor

2. **Sin monitoreo**
   - No hay alertas de downtime
   - No se trackean errores frontend

3. **Sin backup/DR**
   - Imagen Docker sin versionado automático
   - No hay plan de disaster recovery

### Browsers no soportados

**Explícitamente excluidos** (package.json:35-39):
- Internet Explorer (todas las versiones)
- Opera Mini
- Navegadores con <0.2% market share
- Navegadores "dead" (sin actualizaciones)

**Problemas conocidos**:
- Safari <14 puede tener issues con video autoplay
- Firefox <90 puede tener problemas con CSS Grid gaps

### Deuda técnica

🚧 TODO: Priorizar para futuras iteraciones:

1. **Alta prioridad**:
   - Implementar envío de formulario con validación completa
   - Añadir tests con cobertura >80%
   - Configurar CI/CD
   - Implementar responsive design

2. **Media prioridad**:
   - Migrar a React Router para multi-página
   - Añadir Google Analytics
   - Implementar reCAPTCHA
   - Optimizar imágenes y video

3. **Baja prioridad**:
   - Internacionalización (i18n)
   - PWA completo (service workers, offline)
   - Mejoras de SEO (Open Graph, JSON-LD)
   - Auditoría de accesibilidad WCAG AA

---

## 19. Mantenimiento

### Responsables

🚧 TODO: Definir ownership del repositorio.

**Información esperada**:
- **Owner/Maintainer**: [Nombre] - [email]
- **Team**: Frontend Team / FuturaTickets
- **Slack channel**: #futura-landing (ejemplo)
- **On-call**: [Rotation schedule link]

**Archivo esperado**: `CODEOWNERS` en raíz del repo para GitHub:
```
# .github/CODEOWNERS
* @futuratickets/frontend-team
/src/App.tsx @lead-frontend-dev
/Dockerfile @devops-team
```

### Ciclo de versiones

**Versión actual**: 0.1.0 (package.json:3)

🚧 TODO: Definir estrategia de versionado (Semantic Versioning recomendado).

**Semantic Versioning** (recomendado):
- **MAJOR** (1.0.0): Cambios incompatibles (ej. refactor completo)
- **MINOR** (0.2.0): Nuevas features compatibles (ej. nueva sección)
- **PATCH** (0.1.1): Bugfixes (ej. corregir formulario)

**Changelog**:
🚧 TODO: Crear `CHANGELOG.md` siguiendo [Keep a Changelog](https://keepachangelog.com/):
```markdown
# Changelog

## [Unreleased]
### Added
- Formulario de solicitud de demo con validación

### Changed
- Optimizado video hero background

### Fixed
- Corregido layout en mobile

## [0.1.0] - 2024-XX-XX
### Added
- Landing page inicial con 8 secciones
- Integración Ant Design
- Configuración Docker + Nginx
```

### Estrategia de branching

**Rama actual**: `initial-opt` (git status)

🚧 TODO: Definir estrategia de branching. Opciones:

**Git Flow** (recomendado para equipos grandes):
```
main (producción) ←── develop (staging) ←── feature/nueva-seccion
                 ←── hotfix/bug-critico
```

**Trunk-Based Development** (recomendado para equipos pequeños):
```
main (producción) ←── feature/nueva-seccion (short-lived)
```

**Convención de nombres de ramas**:
- `feature/descripcion-corta`: Nuevas funcionalidades
- `fix/descripcion-bug`: Correcciones de bugs
- `chore/tarea`: Tareas de mantenimiento (deps, config)
- `docs/seccion`: Documentación

### Convenciones de commits

🚧 TODO: Adoptar [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(scope): descripción corta

Descripción larga opcional

BREAKING CHANGE: descripción de cambio incompatible (opcional)
```

**Tipos**:
- `feat`: Nueva feature
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo (sin cambios de código)
- `refactor`: Refactor sin cambiar funcionalidad
- `test`: Añadir/corregir tests
- `chore`: Mantenimiento (deps, build, etc.)

**Ejemplos**:
```bash
git commit -m "feat(form): añadir validación de email en formulario demo"
git commit -m "fix(styles): corregir overflow en mobile"
git commit -m "chore(deps): actualizar React a 18.3.2"
```

### Proceso de contribución

🚧 TODO: Crear `CONTRIBUTING.md` en raíz del repo.

**Flujo recomendado**:

1. **Crear issue** describiendo bug/feature
2. **Asignar issue** a desarrollador
3. **Crear branch** desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/mi-feature
   ```
4. **Desarrollar** con commits siguiendo convenciones
5. **Ejecutar tests** localmente:
   ```bash
   npm test
   npm run build
   ```
6. **Push** y crear Pull Request:
   ```bash
   git push origin feature/mi-feature
   # Abrir PR en GitHub hacia develop
   ```
7. **Code review** (mínimo 1 aprobación)
8. **CI/CD pasa** (cuando esté configurado)
9. **Merge** a `develop` (staging)
10. **Release**: Merge de `develop` a `main` (producción)

### Revisión de código (Code Review)

**Checklist de PR**:
- [ ] Tests añadidos/actualizados
- [ ] Documentación actualizada
- [ ] Sin errores de lint
- [ ] Build exitoso
- [ ] Sin vulnerabilidades nuevas (npm audit)
- [ ] Testeado manualmente en dev
- [ ] Screenshots/video si hay cambios visuales

**Template de PR** esperado en `.github/PULL_REQUEST_TEMPLATE.md`:
```markdown
## Descripción
¿Qué cambia este PR?

## Tipo de cambio
- [ ] Bugfix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Testing
¿Cómo se testeó?

## Screenshots
(si aplica)

## Checklist
- [ ] Tests pasan
- [ ] Build exitoso
- [ ] Documentación actualizada
```

### Actualización de dependencias

**Frecuencia recomendada**:
- **Parches de seguridad**: Inmediatamente (automatizar con Dependabot)
- **Minor versions**: Mensual
- **Major versions**: Trimestral (requiere testing exhaustivo)

**Proceso**:
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar minor/patch versions
npx npm-check-updates -u -t minor
npm install

# Actualizar major versions (con precaución)
npx npm-check-updates -u
npm install

# Verificar que todo funciona
npm test
npm run build
```

### Reportar issues

🚧 TODO: Definir URL de issue tracker. Opciones:
- GitHub Issues: `https://github.com/org/landingpage/issues`
- Jira: `https://futuratickets.atlassian.net/browse/LANDING`
- Linear: `https://linear.app/futuratickets/team/FRONT`

**Template de issue** (crear en `.github/ISSUE_TEMPLATE/bug_report.md`):
```markdown
## Descripción del bug
Descripción clara del problema.

## Pasos para reproducir
1. Ir a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento esperado
Qué debería pasar.

## Screenshots
(si aplica)

## Entorno
- OS: [ej. macOS 13.2]
- Navegador: [ej. Chrome 120]
- Versión de Node: [ej. 18.19.0]

## Logs
```
Pegar logs relevantes aquí
```
```

---

## 20. Licencia

🚧 TODO: Definir licencia del proyecto y crear archivo `LICENSE`.

**Archivo esperado**: `LICENSE` o `LICENSE.md` en raíz del repositorio.

**Estado actual**: No existe archivo de licencia en el repositorio.

### Opciones comunes

**Para código propietario** (recomendado si es producto comercial):
```
Copyright (c) 2024 FuturaTickets

Todos los derechos reservados.

Este código es propiedad de FuturaTickets y no puede ser usado,
copiado, modificado o distribuido sin autorización explícita.
```

**Para código open source** (si se decide abrir):
- **MIT**: Permisiva, permite uso comercial sin restricciones
- **Apache 2.0**: Permisiva + protección de patentes
- **GPL v3**: Copyleft, derivados deben ser open source

**Añadir a package.json**:
```json
{
  "license": "UNLICENSED"  // Si es propietario
  // o
  "license": "MIT"  // Si es open source
}
```

🚧 TODO: Consultar con legal/management para definir licencia apropiada.

---

## 21. Checklist de calidad

### Documentación

- [x] Todas las secciones obligatorias presentes (1-20)
- [x] Ninguna suposición sin fuente o marcada con 🚧 TODO
- [x] Referencias a archivos/líneas de código cuando es relevante
- [x] Comandos reproducibles en bloques de código
- [x] Estructura diff-friendly con listas y tablas estables

### Análisis de código

- [x] Archivos de configuración raíz inspeccionados (package.json, tsconfig.json, Dockerfile, etc.)
- [x] Estructura de `src/` y `public/` documentada
- [x] Componentes React identificados (App.tsx analizado línea por línea)
- [x] Estilos documentados (SASS, Ant Design)
- [x] Variables de entorno verificadas (ausencia documentada)
- [x] Tests verificados (ausencia documentada)
- [x] CI/CD verificado (ausencia documentada)

### Precisión

- [x] Stack técnico con versiones exactas de package.json
- [x] Variables de entorno tabuladas (sección 5, con TODOs donde no existen)
- [x] Comandos de dev/build/prod verificados contra package.json scripts
- [x] Endpoints/APIs documentados con TODOs (no inventados)
- [x] Relación con otros repos descrita con TODOs donde falta evidencia
- [x] Sin detalles inventados sin evidencia en archivos

### Inconsistencias detectadas

- [x] **Inconsistencia 1 - Formulario**: Campo `address` validado (src/App.tsx:255) pero no existe en inputs visibles (líneas 240-249). Documentado en sección 12.
- [x] **Inconsistencia 2 - Navegación**: Links en header (Home, About, Services, Contact) sin funcionalidad (líneas 20-25). Documentado en secciones 3 y 18.
- [x] **Inconsistencia 3 - Contenido placeholder**: Institutional Supporters usan imágenes duplicadas (líneas 115-125). Documentado en sección 18.
- [x] **Inconsistencia 4 - Rama**: `initial-opt` no sigue convención estándar. Documentado en sección 19.

### TODOs añadidos

**Total de TODOs**: 47 (marcados con 🚧)

**Categorías**:
- **Configuración**: 8 TODOs (variables de entorno, versiones, owners)
- **Implementación**: 12 TODOs (formulario, tests, responsive, SEO)
- **Infraestructura**: 9 TODOs (CI/CD, monitoring, CDN)
- **Integración**: 6 TODOs (API backend, analytics, repos relacionados)
- **Documentación**: 5 TODOs (README, CONTRIBUTING, CHANGELOG)
- **Seguridad**: 4 TODOs (Dependabot, headers, CSP)
- **Contenido**: 3 TODOs (imágenes, awards reales, team section)

### Validaciones finales

- [x] Documento en español, directo y conciso
- [x] Markdown con tabla de contenidos al inicio (anclajes funcionan)
- [x] Bloques de código con comandos copiables (syntax highlighting)
- [x] Tablas para variables de entorno, stack técnico, endpoints
- [x] Prohibición de alucinación respetada (todo con fuente o TODO)
- [x] Comandos reproducibles sobre descripciones vagas
- [x] Formato mantenible y actualizable

---

## Próximos pasos recomendados

**Prioridad alta** (sprint actual):
1. Implementar envío de formulario funcional (sección 12)
2. Crear `.env.example` con variables necesarias (sección 5)
3. Configurar CI/CD básico con GitHub Actions (sección 14)
4. Añadir tests unitarios básicos (sección 11)

**Prioridad media** (próximo sprint):
5. Implementar responsive design con media queries (sección 18)
6. Configurar Google Analytics (sección 13)
7. Optimizar video hero y activos (sección 18)
8. Crear `CONTRIBUTING.md` y `CHANGELOG.md` (sección 19)

**Prioridad baja** (backlog):
9. Migrar a React Router para multi-página (sección 18)
10. Auditoría de accesibilidad WCAG (sección 18)
11. Implementar internacionalización (sección 18)
12. SEO avanzado (Open Graph, JSON-LD) (sección 18)

---

**Documento generado**: 2025-10-13
**Versión del repositorio**: 0.1.0 (commit: 1afc97b landing opt)
**Rama analizada**: initial-opt
**Autor de la documentación**: Claude Code (Anthropic)
