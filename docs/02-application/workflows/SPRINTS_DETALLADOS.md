# 🎯 SPRINTS DETALLADOS - FUTURA TICKETS
## Guía Paso a Paso para Mejoras del Sistema

**Metodología**: Sprints de 1 semana cada uno
**Equipo**: 1 developer full-time
**Fecha inicio**: 15 Octubre 2025

---

# 📅 SPRINT 0: FUNDAMENTOS Y SETUP (2-3 DÍAS)
**Objetivo**: Preparar el entorno, documentación base y herramientas de desarrollo

## 📋 DÍA 1: Seguridad Básica y Documentación

### ✅ TAREA 1.1: Activar CronJob de Expiración de Eventos (30 min)
**Por qué**: Los eventos no se están cerrando automáticamente cuando finalizan

**Pasos**:
```bash
# 1. Abrir el archivo
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
code src/CronJobs/cron-jobs.service.ts
```

**Cambio a realizar** (línea 31):
```typescript
// ANTES (línea 31 comentada):
// await this.checkEventExpireDate(event._id, event.dateTime.endDate);

// DESPUÉS (descomentar):
await this.checkEventExpireDate(event._id, event.dateTime.endDate);
```

**Validación**:
```bash
# Reiniciar el servidor para aplicar cambios
npm run start:dev

# Verificar en los logs que el CronJob ejecuta cada 15 minutos
# Buscar: "Checking event dates..."
```

**Resultado esperado**:
- ✅ Eventos se cerrarán automáticamente 15 min después de su fecha de fin
- ✅ Tickets expirarán correctamente

---

### ✅ TAREA 1.2: Crear .env.example en Admin API (45 min)
**Por qué**: Documentar todas las variables de entorno necesarias

**Pasos**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

# Crear archivo .env.example
touch .env.example
```

**Contenido del archivo** `.env.example`:
```bash
# ==============================================
# FUTURA TICKETS ADMIN API - ENVIRONMENT VARIABLES
# ==============================================

# ==============================================
# APPLICATION
# ==============================================
NODE_ENV=development
PORT=3001

# ==============================================
# CORS CONFIGURATION
# ==============================================
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3003,https://admin.futuratickets.com,https://marketplace.futuratickets.com

# ==============================================
# DATABASE - MONGODB ATLAS
# ==============================================
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/futura-prod?retryWrites=true&w=majority

# ==============================================
# REDIS (Bull Queues & Caching)
# ==============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ==============================================
# AUTHENTICATION - JWT
# ==============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# ==============================================
# ENCRYPTION
# ==============================================
ENCRYPTION_KEY=your-32-character-encryption-key-here

# ==============================================
# PAYMENT PROCESSING - STRIPE
# ==============================================
STRIPE_PRIVATE_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==============================================
# AZURE STORAGE (Images & Files)
# ==============================================
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=xxx;AccountKey=xxx;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=futura-tickets-images

# ==============================================
# EMAIL SERVICE (SMTP)
# ==============================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=noreply@futuratickets.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=Futura Tickets <noreply@futuratickets.com>

# ==============================================
# WEBSOCKET / SOCKET.IO (Optional)
# ==============================================
SOCKET_FUTURA_IO=http://localhost:3004

# ==============================================
# RATE LIMITING
# ==============================================
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# ==============================================
# SWAGGER DOCUMENTATION
# ==============================================
ENABLE_SWAGGER=true

# ==============================================
# LOGGING
# ==============================================
LOG_LEVEL=info
```

**Validación**:
```bash
# Verificar que todas las variables en .env están documentadas
diff <(grep -v '^#' .env | grep -v '^$' | cut -d'=' -f1 | sort) \
     <(grep -v '^#' .env.example | grep -v '^$' | cut -d'=' -f1 | sort)

# Si hay diferencias, agregar las variables faltantes a .env.example
```

**Resultado esperado**:
- ✅ Archivo `.env.example` creado
- ✅ Todas las variables documentadas con descripción

---

### ✅ TAREA 1.3: Crear .env.example en Admin Panel (30 min)

**Pasos**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
touch .env.example
```

**Contenido del archivo** `.env.example`:
```bash
# ==============================================
# FUTURA TICKETS ADMIN PANEL - ENVIRONMENT VARIABLES
# ==============================================

# ==============================================
# API ENDPOINTS
# ==============================================
# Admin API Backend
NEXT_PUBLIC_FUTURA=http://localhost:3001
NEXT_PUBLIC_FUTURA_API=http://localhost:3001

# ==============================================
# GOOGLE OAUTH (Authentication)
# ==============================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=741584753336-xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

# ==============================================
# WEBSOCKET / SOCKET.IO (Optional - Currently Disabled)
# ==============================================
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3004
# NEXT_PUBLIC_SOCKET_ACCESS_URL=http://localhost:3005
# NEXT_PUBLIC_SOCKET_MARKETPLACE_URL=http://localhost:3006

# ==============================================
# APPLICATION
# ==============================================
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

**Validación**:
```bash
# Verificar que .env.local tiene todas las variables de .env.example
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
cat .env.local
```

**Resultado esperado**:
- ✅ `.env.example` creado en Admin Panel
- ✅ Documentación clara de todas las variables

---

### ✅ TAREA 1.4: Crear .env.example en Marketplace (20 min)

**Pasos**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2
touch .env.example
```

**Contenido** (basado en variables que uses):
```bash
# ==============================================
# FUTURA TICKETS MARKETPLACE - ENVIRONMENT VARIABLES
# ==============================================

# ==============================================
# API ENDPOINTS
# ==============================================
NEXT_PUBLIC_API_URL=http://localhost:3001

# ==============================================
# GOOGLE OAUTH
# ==============================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com

# ==============================================
# GOOGLE TAG MANAGER (Analytics)
# ==============================================
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# ==============================================
# STRIPE (Payment Processing)
# ==============================================
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Resultado esperado**:
- ✅ `.env.example` creado en Marketplace

---

### ✅ TAREA 1.5: Actualizar .gitignore (15 min)

**En cada proyecto**, verificar que `.env` esté ignorado pero `.env.example` NO:

```bash
# Admin API
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
echo ".env" >> .gitignore
echo "!.env.example" >> .gitignore

# Admin Panel
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
echo ".env.local" >> .gitignore
echo "!.env.example" >> .gitignore

# Marketplace
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-market-place-v2
echo ".env.local" >> .gitignore
echo "!.env.example" >> .gitignore
```

**Resultado esperado**:
- ✅ Secrets no se suben a git
- ✅ Ejemplos de configuración SÍ se suben

---

## 📋 DÍA 2: Setup de Testing

### ✅ TAREA 2.1: Setup Jest en Admin API (1 hora)

**Instalación**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

# Instalar dependencias de testing
npm install --save-dev @nestjs/testing jest ts-jest @types/jest supertest @types/supertest
```

**Crear archivo** `jest.config.js`:
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

**Actualizar** `package.json` scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

**Crear primer test** `src/app.controller.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status', () => {
      const result = appController.getHello();
      expect(result).toHaveProperty('status');
    });
  });
});
```

**Ejecutar test**:
```bash
npm run test
```

**Resultado esperado**:
- ✅ Jest configurado
- ✅ Test básico pasa
- ✅ `npm run test` funciona

---

### ✅ TAREA 2.2: Setup Jest en Admin Panel (1 hora)

**Instalación**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

# Instalar dependencias
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

**Crear archivo** `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**Crear archivo** `jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

**Actualizar** `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Crear primer test** `components/Login/__tests__/Login.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../Login';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock GlobalStateProvider
jest.mock('@/components/GlobalStateProvider/GlobalStateProvider', () => ({
  useGlobalState: () => [{}, jest.fn()],
}));

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  useGoogleLogin: () => jest.fn(),
}));

describe('Login Component', () => {
  it('renders login form', () => {
    render(<Login />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('disables login button when form is empty', () => {
    render(<Login />);

    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeDisabled();
  });
});
```

**Ejecutar test**:
```bash
npm run test
```

**Resultado esperado**:
- ✅ Jest + React Testing Library configurado
- ✅ Tests básicos de Login pasan

---

## 📋 DÍA 3: Herramientas de Desarrollo

### ✅ TAREA 3.1: Setup ESLint y Prettier (45 min)

**Admin API**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

# Crear .prettierrc
cat > .prettierrc << 'EOF'
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
EOF

# Crear .prettierignore
cat > .prettierignore << 'EOF'
node_modules
dist
coverage
.next
EOF
```

**Admin Panel** (ya debería tener ESLint):
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

# Verificar que existe next.config.ts con ESLint configurado
cat next.config.ts
```

**Agregar scripts** en `package.json`:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\""
  }
}
```

**Resultado esperado**:
- ✅ ESLint configurado
- ✅ Prettier configurado
- ✅ `npm run lint` funciona

---

### ✅ TAREA 3.2: Crear script de startup (30 min)

**Crear archivo** en raíz del monorepo: `start-all.sh`

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
touch start-all.sh
chmod +x start-all.sh
```

**Contenido**:
```bash
#!/bin/bash

# Futura Tickets - Start All Services
# This script starts Admin API, Admin Panel, and Marketplace

set -e

echo "🚀 Starting Futura Tickets..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start Admin API
echo -e "${BLUE}[1/3] Starting Admin API (port 3001)...${NC}"
cd futura-tickets-admin-api
npm run start:dev > ../logs/admin-api.log 2>&1 &
API_PID=$!
echo "✅ Admin API started (PID: $API_PID)"
echo ""

# Wait 5 seconds for API to be ready
sleep 5

# Start Admin Panel
echo -e "${BLUE}[2/3] Starting Admin Panel (port 3003)...${NC}"
cd ../futura-tickets-admin
npm run dev > ../logs/admin-panel.log 2>&1 &
PANEL_PID=$!
echo "✅ Admin Panel started (PID: $PANEL_PID)"
echo ""

# Start Marketplace
echo -e "${BLUE}[3/3] Starting Marketplace (port 3000)...${NC}"
cd ../futura-market-place-v2
npm run dev > ../logs/marketplace.log 2>&1 &
MARKETPLACE_PID=$!
echo "✅ Marketplace started (PID: $MARKETPLACE_PID)"
echo ""

echo -e "${GREEN}🎉 All services started!${NC}"
echo ""
echo "📍 URLs:"
echo "   Admin API:       http://localhost:3001"
echo "   Admin API Docs:  http://localhost:3001/api/docs"
echo "   Admin Panel:     http://localhost:3003"
echo "   Marketplace:     http://localhost:3000"
echo ""
echo "📝 Logs in ./logs/ directory"
echo "⚠️  To stop all services, run: ./stop-all.sh"
echo ""

# Save PIDs to file for stop script
cd ..
mkdir -p logs
echo "$API_PID" > logs/pids.txt
echo "$PANEL_PID" >> logs/pids.txt
echo "$MARKETPLACE_PID" >> logs/pids.txt
```

**Crear** `stop-all.sh`:
```bash
#!/bin/bash

# Stop all Futura Tickets services

echo "🛑 Stopping Futura Tickets services..."

if [ -f logs/pids.txt ]; then
  while read pid; do
    if kill -0 $pid 2>/dev/null; then
      kill $pid
      echo "✅ Stopped process $pid"
    fi
  done < logs/pids.txt
  rm logs/pids.txt
else
  echo "⚠️  No PIDs file found. Killing by port..."
  lsof -ti:3000,3001,3003 | xargs kill -9 2>/dev/null || true
fi

echo "✅ All services stopped"
```

**Hacer ejecutable**:
```bash
chmod +x start-all.sh
chmod +x stop-all.sh
mkdir -p logs
```

**Uso**:
```bash
# Iniciar todo
./start-all.sh

# Detener todo
./stop-all.sh
```

**Resultado esperado**:
- ✅ Script para iniciar todo el sistema con un comando
- ✅ Logs centralizados en `./logs/`

---

### ✅ TAREA 3.3: Documentar comandos útiles (30 min)

**Crear** `DEVELOPER_GUIDE.md` en la raíz:

```markdown
# 🧑‍💻 GUÍA PARA DESARROLLADORES

## Inicio Rápido

### Iniciar Todo el Sistema
```bash
./start-all.sh
```

### Detener Todo el Sistema
```bash
./stop-all.sh
```

## Comandos por Proyecto

### Admin API (Backend)
```bash
cd futura-tickets-admin-api

# Desarrollo
npm run start:dev

# Tests
npm run test
npm run test:watch
npm run test:cov

# Build
npm run build
npm run start:prod

# Logs
tail -f ../logs/admin-api.log
```

### Admin Panel (Frontend)
```bash
cd futura-tickets-admin

# Desarrollo
npm run dev

# Tests
npm run test
npm run test:watch

# Build
npm run build
npm start

# Linting
npm run lint
npm run lint:fix
```

### Marketplace (Frontend)
```bash
cd futura-market-place-v2

# Desarrollo
npm run dev

# Build
npm run build
npm start
```

## Health Checks

```bash
# Admin API
curl http://localhost:3001/health | jq '.'

# Info detallada
curl http://localhost:3001/health/info | jq '.'

# Test login
curl -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}' | jq '.'
```

## Usuarios de Test

| Email | Password | Role |
|-------|----------|------|
| admin@futuratickets.com | admin2025 | ADMIN |
| promotor@futuratickets.com | promoter2025 | PROMOTER |
| cliente@futuratickets.com | cliente2025 | USER |

## Troubleshooting

### Puerto ocupado
```bash
# Ver qué proceso usa el puerto
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### Redis no conecta
```bash
# Verificar Redis
redis-cli ping

# Iniciar Redis (macOS con Homebrew)
brew services start redis
```

### MongoDB no conecta
Verificar `.env` tiene la URL correcta de MongoDB Atlas.

## Git Workflow

```bash
# Crear rama para feature
git checkout -b feature/nombre-descriptivo

# Commits
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin feature/nombre-descriptivo
```

## Variables de Entorno

Copiar archivos de ejemplo:
```bash
cp futura-tickets-admin-api/.env.example futura-tickets-admin-api/.env
cp futura-tickets-admin/.env.example futura-tickets-admin/.env.local
cp futura-market-place-v2/.env.example futura-market-place-v2/.env.local
```

Luego editar con valores reales.
```

**Resultado esperado**:
- ✅ Documentación clara para onboarding de nuevos devs
- ✅ Comandos más usados documentados

---

## 🎯 CHECKPOINT DÍA 3

**Validación completa del Sprint 0**:

```bash
# 1. Verificar CronJob activo
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
grep -n "checkEventExpireDate" src/CronJobs/cron-jobs.service.ts
# Debe mostrar línea 31 SIN comentario

# 2. Verificar .env.example existen
ls -la futura-tickets-admin-api/.env.example
ls -la futura-tickets-admin/.env.example
ls -la futura-market-place-v2/.env.example

# 3. Verificar tests funcionan
cd futura-tickets-admin-api && npm run test
cd ../futura-tickets-admin && npm run test

# 4. Verificar scripts de startup
cd ..
./start-all.sh
sleep 10
curl http://localhost:3001/health
./stop-all.sh
```

**Checklist**:
- [ ] CronJob de expiración activado
- [ ] `.env.example` creado en 3 proyectos
- [ ] `.gitignore` actualizado
- [ ] Jest configurado en Admin API
- [ ] Jest configurado en Admin Panel
- [ ] ESLint y Prettier configurados
- [ ] Scripts `start-all.sh` y `stop-all.sh` funcionan
- [ ] `DEVELOPER_GUIDE.md` creado

---

# 📅 SPRINT 1: SEGURIDAD Y AUTENTICACIÓN (1 SEMANA)
**Objetivo**: Mover tokens a httpOnly cookies y mejorar seguridad

## 📋 DÍA 1: Preparar Backend para Cookies

### ✅ TAREA 1.1: Instalar cookie-parser (15 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

**Actualizar** `src/main.ts` (después de línea 54):
```typescript
import * as cookieParser from 'cookie-parser';

// ... en bootstrap():
app.use(cookieParser());
```

---

### ✅ TAREA 1.2: Crear Auth Response DTO (30 min)

**Crear archivo** `src/Auth/dto/auth-response.dto.ts`:
```typescript
export class AuthResponseDto {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  // NO incluir token aquí - irá en cookie
}
```

---

### ✅ TAREA 1.3: Modificar Account Controller (2 horas)

**Archivo**: `src/Account/account.controller.ts`

**Modificar método login** (encontrar el método `@Post('/login')`):

```typescript
import { Response } from 'express';

@Post('/login')
async login(
  @Body() loginAccount: LoginAccount,
  @Res({ passthrough: true }) response: Response,
) {
  const account = await this.accountService.login(loginAccount);

  // Extraer token
  const { token, ...accountData } = account;

  // Configurar cookie httpOnly
  response.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });

  // Retornar account SIN token
  return accountData;
}
```

**Hacer lo mismo para**:
- `loginGoogle()`
- `createAccount()`
- `createPromoterAccount()`

**Validación**:
```bash
# Test con curl
curl -i -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}'

# Debe incluir header Set-Cookie con access_token
```

---

### ✅ TAREA 1.4: Crear Logout Endpoint (30 min)

**Agregar método** en `account.controller.ts`:
```typescript
@Post('/logout')
logout(@Res({ passthrough: true }) response: Response) {
  response.clearCookie('access_token');
  return { message: 'Logged out successfully' };
}
```

---

## 📋 DÍA 2: Modificar JWT Strategy

### ✅ TAREA 2.1: Actualizar JWT Strategy (1 hora)

**Archivo**: `src/Auth/jwt.strategy.ts`

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extraer de cookie EN LUGAR de Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        // Fallback a header para backward compatibility temporal
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      account: payload.account,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

**Validación**:
```bash
# Guardar cookie de login
TOKEN=$(curl -c /tmp/cookies.txt -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}')

# Usar cookie en request autenticado
curl -b /tmp/cookies.txt http://localhost:3001/admin/events
```

---

## 📋 DÍA 3-4: Actualizar Frontend Admin Panel

### ✅ TAREA 3.1: Modificar services.tsx (2 horas)

**Archivo**: `futura-tickets-admin/shared/services.tsx`

**Cambiar TODAS las funciones** para usar `credentials: 'include'`:

```typescript
export async function loginAccount(
  loginAccount: LoginAccount
): Promise<Account> {
  return await fetch(`/api/accounts/login`, {
    method: 'POST',
    credentials: 'include', // ← AGREGAR ESTO
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginAccount),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Login error:', err);
      throw err;
    });
}

// Aplicar mismo cambio a:
// - getEvents()
// - createEvent()
// - getSales()
// - etc... (TODAS las funciones fetch)
```

**Script para automatizar**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

# Agregar credentials: 'include' a todos los fetch
sed -i.bak "s/fetch(\`/fetch(\`/g" shared/services.tsx
# Necesitarás hacerlo manualmente para cada función
```

---

### ✅ TAREA 3.2: Modificar API Routes (1 hora)

**Archivo**: `app/api/accounts/login/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_FUTURA}/accounts/login`, {
            method: "POST",
            credentials: "include", // ← AGREGAR
            headers: {
                "Content-Type": "application/json",
                // Forward cookies del request
                "Cookie": request.headers.get("cookie") || "",
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        // Forward Set-Cookie header al cliente
        const response = NextResponse.json(data);
        const setCookie = res.headers.get("set-cookie");
        if (setCookie) {
            response.headers.set("set-cookie", setCookie);
        }

        return response;

    } catch (error) {
        return NextResponse.json(
            { message: "Login failed", error: error.message },
            { status: 500 }
        );
    }
}
```

**Aplicar mismo cambio** a todas las API Routes en `app/api/`.

---

### ✅ TAREA 3.3: Modificar Login Component (1 hora)

**Archivo**: `components/Login/Login.tsx`

**Cambios**:
```typescript
// ELIMINAR:
// localStorage.setItem('token', account.token);

// La cookie se configura automáticamente por el servidor
// Solo necesitas dispatch del account
dispatch({ isConnected: true, account });
```

**Crear función logout**:
```typescript
const logout = async () => {
  await fetch('/api/accounts/logout', {
    method: 'POST',
    credentials: 'include',
  });
  dispatch({ isConnected: false, account: undefined });
  router.push('/login');
};
```

---

### ✅ TAREA 3.4: Crear Logout Component (30 min)

**Crear** `components/Logout/Logout.tsx`:
```typescript
'use client';
import { useRouter } from 'next/navigation';
import { useGlobalState } from '../GlobalStateProvider/GlobalStateProvider';

export default function Logout() {
  const router = useRouter();
  const [state, dispatch] = useGlobalState();

  const handleLogout = async () => {
    try {
      await fetch('/api/accounts/logout', {
        method: 'POST',
        credentials: 'include',
      });

      dispatch({ isConnected: false, account: undefined });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

---

## 📋 DÍA 5: Testing y Validación

### ✅ TAREA 5.1: Tests de Autenticación (2 horas)

**Crear** `src/Account/account.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController - Authentication', () => {
  let controller: AccountController;
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  describe('login with cookies', () => {
    it('should set httpOnly cookie on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAccount = {
        _id: '123',
        email: 'test@example.com',
        role: 'USER',
        token: 'mock-jwt-token',
      };

      jest.spyOn(service, 'login').mockResolvedValue(mockAccount as any);

      const mockResponse = {
        cookie: jest.fn(),
      };

      const result = await controller.login(
        loginDto,
        mockResponse as any,
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );

      expect(result).not.toHaveProperty('token');
      expect(result).toHaveProperty('email', 'test@example.com');
    });
  });
});
```

**Ejecutar**:
```bash
npm run test
```

---

### ✅ TAREA 5.2: Test E2E de Login (2 horas)

**Crear** `test/auth.e2e-spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/accounts/login (POST) - should set cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts/login')
      .send({
        email: 'admin@futuratickets.com',
        password: 'admin2025',
      })
      .expect(201);

    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toMatch(/access_token=/);
    expect(response.body).not.toHaveProperty('token');
    expect(response.body).toHaveProperty('email');
  });

  it('should access protected route with cookie', async () => {
    // Login primero
    const loginResponse = await request(app.getHttpServer())
      .post('/accounts/login')
      .send({
        email: 'admin@futuratickets.com',
        password: 'admin2025',
      });

    const cookie = loginResponse.headers['set-cookie'][0];

    // Usar cookie en request protegido
    await request(app.getHttpServer())
      .get('/admin/events')
      .set('Cookie', cookie)
      .expect(200);
  });
});
```

**Ejecutar**:
```bash
npm run test:e2e
```

---

## 🎯 CHECKPOINT SPRINT 1

**Validación completa**:

```bash
# 1. Backend: Login retorna cookie
curl -i -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}' \
  | grep -i "set-cookie"

# 2. Backend: Rutas protegidas funcionan con cookie
curl -c /tmp/cookies.txt -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}'

curl -b /tmp/cookies.txt http://localhost:3001/admin/events

# 3. Frontend: Login funciona
# Abrir http://localhost:3003/login
# Login con admin@futuratickets.com / admin2025
# Verificar en DevTools → Application → Cookies que existe "access_token"

# 4. Tests pasan
cd futura-tickets-admin-api
npm run test
npm run test:e2e
```

**Checklist**:
- [ ] Backend: `cookie-parser` instalado
- [ ] Backend: Login endpoint retorna cookie httpOnly
- [ ] Backend: JWT Strategy lee de cookies
- [ ] Backend: Logout endpoint implementado
- [ ] Frontend: `credentials: 'include'` en todas las requests
- [ ] Frontend: API Routes forwardean cookies
- [ ] Frontend: Login component NO usa localStorage
- [ ] Frontend: Logout component creado
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan
- [ ] Login manual funciona en browser

---

# 📅 SPRINT 2: REFACTORING Y VALIDACIÓN (1 SEMANA)
**Objetivo**: Dividir archivos grandes y agregar validación de formularios

## 📋 DÍA 1-2: Dividir services.tsx

### ✅ TAREA 1.1: Crear estructura de carpetas (15 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

mkdir -p shared/services
```

---

### ✅ TAREA 1.2: Dividir auth.service.ts (1 hora)

**Crear** `shared/services/auth.service.ts`:

```typescript
import { Account, LoginAccount, CreateAccount } from '../interfaces';

const API_BASE = '/api';

export async function loginAccount(loginAccount: LoginAccount): Promise<Account> {
  return await fetch(`${API_BASE}/accounts/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginAccount),
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return await response.json();
    })
    .catch((err) => {
      console.error('Login error:', err);
      throw err;
    });
}

export async function loginGoogle(googleCode: string): Promise<Account> {
  // ... copiar del services.tsx original
}

export async function createAccount(createAccount: CreateAccount): Promise<Account> {
  // ... copiar del services.tsx original
}

export async function logoutAccount(): Promise<void> {
  await fetch(`${API_BASE}/accounts/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function checkToken(): Promise<Account> {
  // ... copiar del services.tsx original
}
```

---

### ✅ TAREA 1.3: Dividir events.service.ts (2 horas)

**Crear** `shared/services/events.service.ts`:

```typescript
import { Event, CreateEvent, EditEvent } from '../interfaces';

const API_BASE = '/api';

export async function getEvents(): Promise<Event[]> {
  // Copiar implementación de services.tsx
}

export async function getEventById(eventId: string): Promise<Event> {
  // Copiar implementación
}

export async function createEvent(createEvent: CreateEvent): Promise<Event> {
  // Copiar implementación
}

export async function editEvent(event: string, editEvent: EditEvent): Promise<Event> {
  // Copiar implementación
}

export async function deleteEvent(event: string): Promise<void> {
  // Copiar implementación
}

export async function launchEvent(event: string, dateTime: any): Promise<Event> {
  // Copiar implementación
}

export async function uploadEventImage(file: File, event: string): Promise<void> {
  // Copiar implementación
}
```

**Continuar creando**:
- `shared/services/sales.service.ts`
- `shared/services/orders.service.ts`
- `shared/services/payments.service.ts`
- `shared/services/analytics.service.ts`
- `shared/services/clients.service.ts`
- `shared/services/promocodes.service.ts`

---

### ✅ TAREA 1.4: Crear index.ts central (30 min)

**Crear** `shared/services/index.ts`:

```typescript
// Auth
export * from './auth.service';

// Events
export * from './events.service';

// Sales
export * from './sales.service';

// Orders
export * from './orders.service';

// Payments
export * from './payments.service';

// Analytics
export * from './analytics.service';

// Clients
export * from './clients.service';

// Promo Codes
export * from './promocodes.service';
```

---

### ✅ TAREA 1.5: Actualizar imports (1 hora)

**En TODOS los componentes**, cambiar:

```typescript
// ANTES:
import { loginAccount, getEvents } from '@/shared/services';

// DESPUÉS:
import { loginAccount, getEvents } from '@/shared/services';
// (el path es el mismo gracias al index.ts)
```

**Script para verificar**:
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

# Buscar imports de services.tsx
grep -r "from '@/shared/services'" --include="*.tsx" --include="*.ts" | wc -l

# Todos deberían seguir funcionando sin cambios
```

---

### ✅ TAREA 1.6: Eliminar services.tsx original (5 min)

```bash
# Backup primero
mv shared/services.tsx shared/services.tsx.backup

# Reiniciar dev server y verificar que todo funciona
npm run dev
```

**Si todo funciona**, eliminar backup:
```bash
rm shared/services.tsx.backup
```

---

## 📋 DÍA 3: Dividir interfaces.tsx

### ✅ TAREA 3.1: Crear estructura (15 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

mkdir -p shared/interfaces
```

---

### ✅ TAREA 3.2: Dividir por dominio (3 horas)

**Crear archivos**:

1. `shared/interfaces/auth.interface.ts`:
```typescript
export interface Account {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  // ... resto de campos
}

export interface LoginAccount {
  email: string;
  password: string;
}

export interface CreateAccount {
  // ...
}
```

2. `shared/interfaces/event.interface.ts`:
```typescript
export interface Event {
  _id: string;
  name: string;
  description: string;
  // ... resto de campos
}

export interface CreateEvent {
  // ...
}

export interface EditEvent {
  // ...
}

export interface Artist {
  // ...
}

export interface Location {
  // ...
}
```

3. `shared/interfaces/sale.interface.ts`
4. `shared/interfaces/order.interface.ts`
5. `shared/interfaces/payment.interface.ts`

---

### ✅ TAREA 3.3: Crear index.ts (15 min)

**Crear** `shared/interfaces/index.ts`:

```typescript
export * from './auth.interface';
export * from './event.interface';
export * from './sale.interface';
export * from './order.interface';
export * from './payment.interface';
```

---

### ✅ TAREA 3.4: Actualizar imports (30 min)

```typescript
// Todos los imports siguen igual:
import { Event, Account, Sale } from '@/shared/interfaces';
```

**Eliminar** `interfaces.tsx` original:
```bash
mv shared/interfaces.tsx shared/interfaces.tsx.backup
npm run dev
# Si funciona:
rm shared/interfaces.tsx.backup
```

---

## 📋 DÍA 4-5: Validación con Zod

### ✅ TAREA 4.1: Instalar Zod (5 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

npm install zod
npm install @hookform/resolvers
```

---

### ✅ TAREA 4.2: Crear schemas de validación (1 hora)

**Crear** `shared/validation/auth.schema.ts`:

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

---

### ✅ TAREA 4.3: Integrar con Login Component (1 hora)

**Modificar** `components/Login/Login.tsx`:

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/shared/validation/auth.schema';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoader(true);
    setError('');

    try {
      const account = await loginAccount(data);
      // ... resto del código
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
          />
          {errors.email && (
            <span className="error">{errors.email.message}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
          />
          {errors.password && (
            <span className="error">{errors.password.message}</span>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

### ✅ TAREA 4.4: Validar otros formularios (2 horas)

**Crear schemas para**:
- `shared/validation/event.schema.ts`
- `shared/validation/payment.schema.ts`

**Aplicar validación en**:
- `CreateEvent` form
- `PaymentRequest` form

---

## 🎯 CHECKPOINT SPRINT 2

**Validación**:

```bash
# 1. Verificar estructura de servicios
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin
ls -la shared/services/

# Debe mostrar:
# - auth.service.ts
# - events.service.ts
# - sales.service.ts
# - orders.service.ts
# - payments.service.ts
# - analytics.service.ts
# - index.ts

# 2. Verificar estructura de interfaces
ls -la shared/interfaces/

# Debe mostrar:
# - auth.interface.ts
# - event.interface.ts
# - sale.interface.ts
# - order.interface.ts
# - payment.interface.ts
# - index.ts

# 3. Verificar validación funciona
npm run dev
# Abrir http://localhost:3003/login
# Intentar login sin email → debe mostrar error
# Intentar login con email inválido → debe mostrar error
# Intentar login con password corta → debe mostrar error

# 4. Verificar imports funcionan
npm run build
# No debe haber errores de imports
```

**Checklist**:
- [ ] `services.tsx` dividido en módulos pequeños
- [ ] `interfaces.tsx` dividido por dominio
- [ ] Imports centralizados con `index.ts`
- [ ] Zod instalado y configurado
- [ ] Login form valida con Zod
- [ ] Register form valida con Zod
- [ ] CreateEvent form valida con Zod
- [ ] Mensajes de error se muestran en UI
- [ ] Build pasa sin errores

---

# 📅 SPRINT 3: REFACTORING BACKEND (1 SEMANA)
**Objetivo**: Dividir `admin-event.service.ts` (35k líneas)

## 📋 DÍA 1: Análisis y Planificación

### ✅ TAREA 1.1: Analizar dependencias (2 horas)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

# Analizar imports
grep -n "^import" src/Event/admin-event.service.ts | head -20

# Analizar métodos públicos
grep -n "async.*(" src/Event/admin-event.service.ts | head -30

# Contar líneas por sección
wc -l src/Event/admin-event.service.ts
```

**Crear documento** `REFACTORING_PLAN.md`:
```markdown
# Plan de Refactoring: admin-event.service.ts

## Análisis
- Total líneas: 35,424
- Métodos públicos: ~80
- Dependencias: EventModel, SaleModel, OrderModel, AccountModel

## División Propuesta

### 1. event-core.service.ts (CRUD básico)
- createEvent()
- updateEvent()
- deleteEvent()
- getEventById()
- getEvents()

### 2. event-tickets.service.ts (Gestión de tickets)
- createTickets()
- updateTickets()
- deleteTickets()
- assignTicketLots()

### 3. event-resale.service.ts (Reventa)
- enableResale()
- disableResale()
- updateResaleConfig()

### 4. event-analytics.service.ts (Estadísticas)
- getEventStats()
- getSalesReport()
- getRevenueReport()

### 5. event-invitations.service.ts (Invitaciones)
- createInvitation()
- getInvitations()
- validateInvitation()
```

---

## 📋 DÍA 2-3: Crear Servicios Modulares

### ✅ TAREA 2.1: Crear event-core.service.ts (3 horas)

```bash
cd src/Event
touch event-core.service.ts
```

**Contenido**:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './event.schema';

@Injectable()
export class EventCoreService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async createEvent(createEventDto: any): Promise<Event> {
    // Copiar lógica de admin-event.service.ts
    const event = new this.eventModel(createEventDto);
    return await event.save();
  }

  async getEventById(eventId: string): Promise<Event> {
    return await this.eventModel.findById(eventId).exec();
  }

  async getEvents(promoterId?: string): Promise<Event[]> {
    const filter = promoterId ? { promoter: promoterId } : {};
    return await this.eventModel.find(filter).exec();
  }

  async updateEvent(eventId: string, updateData: any): Promise<Event> {
    return await this.eventModel
      .findByIdAndUpdate(eventId, updateData, { new: true })
      .exec();
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(eventId).exec();
  }
}
```

---

### ✅ TAREA 2.2: Crear event-tickets.service.ts (4 horas)

```bash
touch event-tickets.service.ts
```

**Contenido**:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './event.schema';

@Injectable()
export class EventTicketsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async createTicketLots(
    eventId: string,
    ticketLots: any[],
  ): Promise<Event> {
    // Copiar lógica de admin-event.service.ts
    // para creación y asignación de tickets
  }

  async updateTicketLot(
    eventId: string,
    lotId: string,
    updateData: any,
  ): Promise<Event> {
    // Copiar lógica
  }

  async deleteTicketLot(eventId: string, lotId: string): Promise<Event> {
    // Copiar lógica
  }

  async assignTicketsToLot(
    eventId: string,
    lotId: string,
    ticketIds: string[],
  ): Promise<Event> {
    // Copiar lógica
  }
}
```

---

### ✅ TAREA 2.3: Crear event-resale.service.ts (2 horas)

**Similar a los anteriores, crear servicio específico para reventa.**

---

### ✅ TAREA 2.4: Crear event-analytics.service.ts (2 horas)

**Similar, crear servicio para analytics.**

---

## 📋 DÍA 4: Actualizar Controller y Module

### ✅ TAREA 4.1: Actualizar event.module.ts (30 min)

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { AdminEventController } from './admin-event.controller';

// Servicios modulares
import { EventCoreService } from './event-core.service';
import { EventTicketsService } from './event-tickets.service';
import { EventResaleService } from './event-resale.service';
import { EventAnalyticsService } from './event-analytics.service';

// Servicio facade (mantener compatibilidad)
import { AdminEventService } from './admin-event.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [AdminEventController],
  providers: [
    EventCoreService,
    EventTicketsService,
    EventResaleService,
    EventAnalyticsService,
    AdminEventService, // Facade que usa los servicios modulares
  ],
  exports: [AdminEventService],
})
export class EventModule {}
```

---

### ✅ TAREA 4.2: Crear AdminEventService Facade (2 horas)

**Refactorizar** `admin-event.service.ts` para que sea un FACADE:

```typescript
import { Injectable } from '@nestjs/common';
import { EventCoreService } from './event-core.service';
import { EventTicketsService } from './event-tickets.service';
import { EventResaleService } from './event-resale.service';
import { EventAnalyticsService } from './event-analytics.service';

@Injectable()
export class AdminEventService {
  constructor(
    private eventCoreService: EventCoreService,
    private eventTicketsService: EventTicketsService,
    private eventResaleService: EventResaleService,
    private eventAnalyticsService: EventAnalyticsService,
  ) {}

  // Delegar a servicios modulares
  async createEvent(createEventDto: any) {
    return this.eventCoreService.createEvent(createEventDto);
  }

  async getEventById(eventId: string) {
    return this.eventCoreService.getEventById(eventId);
  }

  async createTicketLots(eventId: string, ticketLots: any[]) {
    return this.eventTicketsService.createTicketLots(eventId, ticketLots);
  }

  async enableResale(eventId: string, resaleConfig: any) {
    return this.eventResaleService.enableResale(eventId, resaleConfig);
  }

  async getEventStats(eventId: string) {
    return this.eventAnalyticsService.getEventStats(eventId);
  }

  // ... resto de métodos delegando a servicios correspondientes
}
```

---

## 📋 DÍA 5: Testing

### ✅ TAREA 5.1: Tests unitarios de servicios modulares (3 horas)

**Crear** `event-core.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventCoreService } from './event-core.service';
import { Event } from './event.schema';

describe('EventCoreService', () => {
  let service: EventCoreService;
  let mockEventModel: any;

  beforeEach(async () => {
    mockEventModel = {
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventCoreService,
        {
          provide: getModelToken(Event.name),
          useValue: mockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventCoreService>(EventCoreService);
  });

  describe('getEventById', () => {
    it('should return an event by ID', async () => {
      const mockEvent = { _id: '123', name: 'Test Event' };
      mockEventModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEvent),
      });

      const result = await service.getEventById('123');

      expect(mockEventModel.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockEvent);
    });
  });

  // ... más tests
});
```

**Crear tests similares** para:
- `event-tickets.service.spec.ts`
- `event-resale.service.spec.ts`
- `event-analytics.service.spec.ts`

---

### ✅ TAREA 5.2: Validación final (1 hora)

```bash
# 1. Compilar
npm run build

# 2. Tests
npm run test

# 3. Verificar no hay imports rotos
npm run start:dev
# Verificar logs, no debe haber errores

# 4. Test manual de endpoints
curl http://localhost:3001/admin/events
curl http://localhost:3001/admin/events/<event-id>
```

---

## 🎯 CHECKPOINT SPRINT 3

**Validación**:

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

# Verificar estructura
ls -la src/Event/

# Debe tener:
# - event-core.service.ts
# - event-tickets.service.ts
# - event-resale.service.ts
# - event-analytics.service.ts
# - admin-event.service.ts (facade)
# - event.module.ts (actualizado)

# Verificar tamaño de archivos
wc -l src/Event/event-core.service.ts
wc -l src/Event/event-tickets.service.ts
# Cada uno debe tener <2000 líneas

# Verificar tests
npm run test

# Verificar funcionalidad
npm run start:dev
curl http://localhost:3001/admin/events
```

**Checklist**:
- [ ] `admin-event.service.ts` dividido en 4-5 servicios
- [ ] Cada servicio <2000 líneas
- [ ] Facade pattern implementado
- [ ] `event.module.ts` actualizado con nuevos providers
- [ ] Tests unitarios para cada servicio
- [ ] Build pasa sin errores
- [ ] API endpoints funcionan correctamente
- [ ] No hay regresiones (tests E2E pasan)

---

# 📅 SPRINT 4: PERFORMANCE Y CACHE (1 SEMANA)
**Objetivo**: Optimizar rendimiento con Redis cache

## 📋 DÍA 1: Setup Redis Cache

### ✅ TAREA 1.1: Instalar cache-manager (15 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin-api

npm install @nestjs/cache-manager cache-manager
npm install --save-dev @types/cache-manager
```

---

### ✅ TAREA 1.2: Configurar CacheModule (30 min)

**Actualizar** `app.module.ts`:

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutos por defecto
    }),
    // ... otros imports
  ],
})
export class AppModule {}
```

---

### ✅ TAREA 1.3: Crear CacheService (1 hora)

**Crear** `src/Cache/cache.service.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, { ttl } as any);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Helpers
  generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
```

---

## 📋 DÍA 2-3: Implementar Cache en Services

### ✅ TAREA 2.1: Cache en EventCoreService (2 horas)

**Modificar** `event-core.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '../Cache/cache.service';

@Injectable()
export class EventCoreService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private cacheService: CacheService,
  ) {}

  async getEventById(eventId: string): Promise<Event> {
    // Cache key
    const cacheKey = this.cacheService.generateKey('event', eventId);

    // Intentar obtener de cache
    const cached = await this.cacheService.get<Event>(cacheKey);
    if (cached) {
      return cached;
    }

    // Si no está en cache, obtener de DB
    const event = await this.eventModel.findById(eventId).exec();

    // Guardar en cache (TTL: 5 minutos)
    await this.cacheService.set(cacheKey, event, 300);

    return event;
  }

  async getEvents(promoterId?: string): Promise<Event[]> {
    const cacheKey = this.cacheService.generateKey(
      'events',
      promoterId || 'all',
    );

    const cached = await this.cacheService.get<Event[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const filter = promoterId ? { promoter: promoterId } : {};
    const events = await this.eventModel.find(filter).exec();

    // Cache por 5 minutos
    await this.cacheService.set(cacheKey, events, 300);

    return events;
  }

  async updateEvent(eventId: string, updateData: any): Promise<Event> {
    const event = await this.eventModel
      .findByIdAndUpdate(eventId, updateData, { new: true })
      .exec();

    // Invalidar cache
    await this.cacheService.del(
      this.cacheService.generateKey('event', eventId),
    );
    await this.cacheService.del(
      this.cacheService.generateKey('events', 'all'),
    );

    return event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(eventId).exec();

    // Invalidar cache
    await this.cacheService.del(
      this.cacheService.generateKey('event', eventId),
    );
    await this.cacheService.del(
      this.cacheService.generateKey('events', 'all'),
    );
  }
}
```

---

### ✅ TAREA 2.2: Cache en SalesService (2 horas)

**Similar al anterior**, agregar cache a:
- `getSales(eventId)`
- `getSaleById(saleId)`

**Invalidar cache** en:
- `createSale()`
- `updateSale()`

---

### ✅ TAREA 2.3: Cache en AnalyticsService (2 horas)

**Cache más agresivo** (TTL: 15 minutos) para analytics:

```typescript
async getEventStats(eventId: string): Promise<any> {
  const cacheKey = this.cacheService.generateKey('analytics', eventId);

  const cached = await this.cacheService.get<any>(cacheKey);
  if (cached) {
    return cached;
  }

  // Cálculo pesado de analytics
  const stats = await this.calculateStats(eventId);

  // Cache por 15 minutos
  await this.cacheService.set(cacheKey, stats, 900);

  return stats;
}
```

---

## 📋 DÍA 4: Cache en Frontend

### ✅ TAREA 4.1: Instalar React Query (15 min)

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

npm install @tanstack/react-query
```

---

### ✅ TAREA 4.2: Setup QueryClient (30 min)

**Modificar** `app/layout.tsx`:

```typescript
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

### ✅ TAREA 4.3: Crear custom hooks con React Query (2 horas)

**Crear** `hooks/useEvents.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/shared/services';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      // Invalidar cache de eventos
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }) => updateEvent(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
}
```

**Crear hooks similares**:
- `hooks/useSales.ts`
- `hooks/useOrders.ts`
- `hooks/useAnalytics.ts`

---

### ✅ TAREA 4.4: Migrar componentes a usar hooks (3 horas)

**ANTES** en `Events.tsx`:
```typescript
useEffect(() => {
  async function fetchEvents() {
    const events = await getEvents();
    setEvents(events);
  }
  fetchEvents();
}, []);
```

**DESPUÉS**:
```typescript
import { useEvents } from '@/hooks/useEvents';

export default function Events() {
  const { data: events, isLoading, error } = useEvents();

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {events.map(event => <EventCard key={event._id} event={event} />)}
    </div>
  );
}
```

---

## 📋 DÍA 5: Code Splitting y Optimización

### ✅ TAREA 5.1: Lazy Loading de componentes (2 horas)

**Modificar** `app/events/page.tsx`:

```typescript
import dynamic from 'next/dynamic';
import Loader from '@/components/Loader';

// Lazy load components
const Events = dynamic(() => import('@/components/Events'), {
  loading: () => <Loader />,
  ssr: false,
});

export default function EventsPage() {
  return <Events />;
}
```

**Hacer lo mismo para**:
- `app/analytics/page.tsx`
- `app/payments/page.tsx`
- Componentes pesados

---

### ✅ TAREA 5.2: Optimizar imágenes (1 hora)

**Buscar y reemplazar** `<img>` por `<Image>`:

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-admin

# Buscar todos los <img>
grep -r "<img" --include="*.tsx" components/

# Reemplazar manualmente por:
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={500}
  height={300}
  loading="lazy"
/>
```

---

### ✅ TAREA 5.3: Bundle Analyzer (30 min)

```bash
npm install --save-dev @next/bundle-analyzer
```

**Actualizar** `next.config.ts`:

```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... resto de config
});
```

**Analizar bundle**:
```bash
ANALYZE=true npm run build
```

---

## 🎯 CHECKPOINT SPRINT 4

**Validación**:

```bash
# 1. Backend: Verificar cache funciona
curl http://localhost:3001/admin/events
# Primera request: ~200ms
# Segunda request: ~5ms (desde cache)

# 2. Frontend: Verificar React Query
npm run dev
# Abrir DevTools → React Query Devtools
# Verificar queries se cachean

# 3. Performance
npm run build
# Verificar bundle size <500KB

# 4. Redis stats
redis-cli
> INFO stats
> KEYS *
# Verificar keys de cache existen
```

**Checklist**:
- [ ] Redis cache configurado en backend
- [ ] `CacheService` creado
- [ ] Cache implementado en `EventCoreService`
- [ ] Cache implementado en `SalesService`
- [ ] Cache implementado en `AnalyticsService`
- [ ] React Query configurado en frontend
- [ ] Custom hooks creados (`useEvents`, `useSales`, etc.)
- [ ] Componentes migrados a usar hooks
- [ ] Lazy loading implementado
- [ ] Imágenes optimizadas con `next/image`
- [ ] Bundle analyzer ejecutado
- [ ] Cache hit rate >80% en Redis

---

# 📅 SPRINT 5: DOCUMENTACIÓN Y DEPLOYMENT (1 SEMANA)
**Objetivo**: Documentar todo y preparar para producción

## 📋 DÍA 1: Actualizar READMEs

### ✅ TAREA 1.1: README Admin API (2 horas)

**Reemplazar** `futura-tickets-admin-api/README.md`:

```markdown
# Futura Tickets Admin API

Backend NestJS para la plataforma de gestión de eventos Futura Tickets.

## 🚀 Características

- ✅ REST API con autenticación JWT
- ✅ WebSockets para notificaciones en tiempo real
- ✅ Integración con Stripe para pagos
- ✅ Bull queues para tareas asíncronas
- ✅ Cache con Redis
- ✅ CronJobs para automatización
- ✅ Swagger documentation

## 📋 Requisitos

- Node.js 18+
- MongoDB Atlas account
- Redis 6+
- Stripe account (para pagos)

## 🛠️ Instalación

```bash
# 1. Clonar repositorio
git clone ...
cd futura-tickets-admin-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con valores reales

# 4. Iniciar desarrollo
npm run start:dev
```

## 🔧 Variables de Entorno

Ver `.env.example` para lista completa. Variables críticas:

```bash
NODE_ENV=development
PORT=3001
MONGO_URL=mongodb+srv://...
JWT_SECRET=your-secret
REDIS_HOST=localhost
STRIPE_PRIVATE_KEY=sk_test_...
```

## 🏃 Scripts

```bash
npm run start:dev      # Desarrollo con hot-reload
npm run build          # Build para producción
npm run start:prod     # Iniciar producción
npm run test           # Tests unitarios
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Coverage report
npm run lint           # ESLint
```

## 📚 API Documentation

Swagger disponible en: `http://localhost:3001/api/docs`

## 🏗️ Arquitectura

```
src/
├── Account/        # Gestión de usuarios
├── Auth/           # Autenticación JWT
├── Event/          # Gestión de eventos (modular)
│   ├── event-core.service.ts
│   ├── event-tickets.service.ts
│   ├── event-resale.service.ts
│   └── event-analytics.service.ts
├── Orders/         # Gestión de órdenes
├── Sales/          # Gestión de ventas/tickets
├── Payments/       # Pagos y withdrawals
├── Mail/           # Sistema de emails
├── Socket/         # WebSockets
├── CronJobs/       # Tareas programadas
└── Cache/          # Redis cache service
```

## 🔐 Autenticación

JWT con httpOnly cookies:

```bash
# Login
POST /accounts/login
Body: { "email": "...", "password": "..." }
Response: Sets httpOnly cookie "access_token"

# Rutas protegidas
GET /admin/events
Header: Cookie: access_token=...
```

## 🎯 Endpoints Principales

### Events
- `GET /admin/events` - Lista eventos del promotor
- `POST /admin/events/create` - Crear evento
- `PATCH /admin/events/update/:id` - Actualizar evento
- `DELETE /admin/events/:id` - Eliminar evento

### Sales
- `GET /sales/:eventId` - Ventas de un evento
- `PATCH /sales/resale` - Poner ticket en reventa
- `PATCH /sales/transfer` - Transferir ticket

### Payments
- `GET /payments` - Solicitudes de pago
- `POST /payments` - Solicitar pago

Ver Swagger para documentación completa.

## ⚙️ CronJobs

### Check Event Dates (cada 15 min)
- Inicia eventos cuando llega su fecha
- Cierra eventos cuando finalizan
- Expira tickets

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

Coverage objetivo: >70%

## 🚢 Deployment

### Docker

```bash
docker build -t futura-admin-api .
docker run -p 3001:3001 --env-file .env futura-admin-api
```

### Manual

```bash
npm run build
NODE_ENV=production npm run start:prod
```

## 📊 Monitoring

- Health: `GET /health`
- Info: `GET /health/info`
- Redis stats: `GET /health/redis`

## 🐛 Troubleshooting

### MongoDB no conecta
Verificar `MONGO_URL` en `.env` y whitelist IP en MongoDB Atlas.

### Redis no disponible
```bash
# macOS
brew services start redis

# Linux
sudo service redis-server start
```

### Tests fallan
Verificar MongoDB test database configurada.

## 🤝 Contribuir

1. Fork del repo
2. Crear branch (`git checkout -b feature/nueva-feature`)
3. Commit cambios (`git commit -m 'feat: descripción'`)
4. Push (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

## 📝 Convenciones

- Commits: [Conventional Commits](https://www.conventionalcommits.org/)
- Code style: ESLint + Prettier
- Tests obligatorios para nuevas features

## 📄 Licencia

Propietario - Futura Tickets

## 📞 Soporte

- Documentación: Ver este README
- Issues: [GitHub Issues](#)
- Email: dev@futuratickets.com
```

---

### ✅ TAREA 1.2: README Admin Panel (2 horas)

**Reemplazar** `futura-tickets-admin/README.md`:

```markdown
# Futura Tickets Admin Panel

Panel de administración Next.js 15 para promotores de eventos.

## 🚀 Características

- ✅ Next.js 15 con App Router
- ✅ React 19 RC
- ✅ Ant Design 5 UI Framework
- ✅ TypeScript strict mode
- ✅ React Query para state management
- ✅ Zod para validación de formularios
- ✅ Google OAuth authentication
- ✅ Analytics con Google Charts

## 📋 Requisitos

- Node.js 18+
- Admin API running (http://localhost:3001)

## 🛠️ Instalación

```bash
# 1. Clonar e instalar
cd futura-tickets-admin
npm install

# 2. Configurar .env
cp .env.example .env.local
# Editar valores

# 3. Desarrollo
npm run dev
```

## 🔧 Variables de Entorno

```bash
NEXT_PUBLIC_FUTURA=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

## 🏃 Scripts

```bash
npm run dev         # Desarrollo (puerto 3003)
npm run build       # Build producción
npm start           # Producción
npm run test        # Tests con Jest
npm run lint        # ESLint
```

## 🏗️ Arquitectura

```
app/
├── login/          # Autenticación
├── events/         # Gestión eventos
├── clients/        # Gestión clientes
├── payments/       # Pagos
├── analytics/      # Estadísticas
├── api/            # API Routes (BFF pattern)
└── layout.tsx      # Root layout

components/
├── Login/          # Login form
├── Events/         # Lista eventos
├── Event/          # Detalle evento
├── CreateEvent/    # Crear evento
└── Analytics/      # Charts

shared/
├── services/       # API calls (modular)
│   ├── auth.service.ts
│   ├── events.service.ts
│   └── ...
├── interfaces/     # TypeScript interfaces
│   ├── auth.interface.ts
│   ├── event.interface.ts
│   └── ...
└── validation/     # Zod schemas
    ├── auth.schema.ts
    └── event.schema.ts

hooks/
├── useEvents.ts    # React Query hooks
├── useSales.ts
└── ...
```

## 🔐 Autenticación

JWT httpOnly cookies (seguro contra XSS).

```typescript
// Login
import { loginAccount } from '@/shared/services';

const account = await loginAccount({ email, password });
// Cookie se configura automáticamente
```

## 🎨 UI Components

Ant Design 5 con tema personalizado:

```typescript
<Button type="primary">Click me</Button>
<Table dataSource={data} columns={columns} />
<Modal visible={isOpen}>...</Modal>
```

## 🧪 Testing

```bash
npm run test
```

Tests con Jest + React Testing Library.

## 🚢 Deployment

### Vercel (Recomendado)

```bash
vercel deploy
```

### Docker

```bash
docker build -t futura-admin-panel .
docker run -p 3003:3003 futura-admin-panel
```

## 📦 Build Output

```bash
npm run build
# Output en .next/
# Static files en .next/static/
```

## 🐛 Troubleshooting

### "Failed to fetch"
Verificar que Admin API esté corriendo en puerto 3001.

### CORS errors
Admin API debe tener `localhost:3003` en whitelist.

### Ant Design warnings
Ya suprimidos en `RootProvider.tsx` para React 19.

## 🤝 Contribuir

Ver `DEVELOPER_GUIDE.md` en raíz del monorepo.

## 📄 Licencia

Propietario - Futura Tickets
```

---

## 📋 DÍA 2: Swagger Documentation

### ✅ TAREA 2.1: Mejorar decoradores de Swagger (4 horas)

**Ejemplo** en `admin-event.controller.ts`:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin - Events')
@Controller('admin/events')
export class AdminEventController {

  @Post('/create')
  @ApiOperation({
    summary: 'Create new event',
    description: 'Creates a new event with tickets, artists, and configuration'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Summer Music Festival' },
        description: { type: 'string', example: 'The biggest music festival...' },
        capacity: { type: 'number', example: 5000 },
        // ... resto de campos
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        status: { type: 'string', enum: ['CREATED', 'LAUNCHED', 'LIVE', 'CLOSED'] },
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid token' })
  async createEvent(@Body() createEventDto: CreateEventDto) {
    // ...
  }

  @Get('/:eventId')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'eventId', type: 'string', description: 'MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(@Param('eventId') eventId: string) {
    // ...
  }
}
```

**Aplicar a todos los controllers**.

---

## 📋 DÍA 3: Guías de Deployment

### ✅ TAREA 3.1: Crear DEPLOYMENT.md (3 horas)

**Crear** en raíz del monorepo: `DEPLOYMENT.md`

```markdown
# 🚀 DEPLOYMENT GUIDE - FUTURA TICKETS

Guía completa para desplegar Admin API, Admin Panel y Marketplace a producción.

## 📋 Prerequisitos

- Cuenta AWS/Azure/DigitalOcean
- MongoDB Atlas configurado
- Redis Cloud o instancia Redis
- Dominio configurado
- SSL certificates

## 🏗️ Arquitectura de Producción

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN + DDoS)  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────┴──────┐   ┌──────┴──────┐   ┌──────┴──────┐
    │ Admin Panel │   │  Admin API  │   │ Marketplace │
    │ (Vercel)    │   │ (AWS EC2)   │   │ (Vercel)    │
    └─────────────┘   └──────┬──────┘   └─────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────┴───────┐  ┌──┴───┐  ┌──────┴────────┐
      │ MongoDB Atlas │  │Redis │  │ Azure Storage │
      └───────────────┘  │Cloud │  │  (Images)     │
                         └──────┘  └───────────────┘
```

## 🔧 PASO 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster de Producción

```bash
# Login a MongoDB Atlas
# https://cloud.mongodb.com/

# Crear cluster:
# - Tier: M10 o superior
# - Region: misma que API
# - Backup habilitado
```

### 1.2 Configurar Network Access

```
IP Whitelist:
- Agregar IP de servidor API
- Agregar IP de local para debugging
```

### 1.3 Crear Database User

```
Username: futura-prod-user
Password: [contraseña segura]
Role: readWrite en futura-prod
```

### 1.4 Obtener Connection String

```
mongodb+srv://futura-prod-user:PASSWORD@cluster0.xxxxx.mongodb.net/futura-prod?retryWrites=true&w=majority
```

---

## 🔧 PASO 2: Configurar Redis Cloud

```bash
# Ir a https://redis.com/try-free/

# Crear database:
# - Plan: 30MB Free o superior
# - Region: misma que API
# - Eviction policy: allkeys-lru

# Obtener endpoint:
redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345
```

---

## 🔧 PASO 3: Deploy Admin API (AWS EC2)

### 3.1 Lanzar Instancia EC2

```bash
# AWS Console → EC2 → Launch Instance

Instance type: t3.small (2 vCPU, 2GB RAM)
OS: Ubuntu 22.04 LTS
Security Group:
  - SSH (22) desde tu IP
  - HTTP (80) desde anywhere
  - HTTPS (443) desde anywhere
  - Custom TCP (3001) desde Load Balancer

Key pair: Descargar y guardar .pem
```

### 3.2 Conectar a Instancia

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com
```

### 3.3 Instalar Dependencias

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 3.4 Clonar Repositorio

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/monorepo-futuratickets.git
cd monorepo-futuratickets/futura-tickets-admin-api
```

### 3.5 Configurar Variables de Entorno

```bash
nano .env
```

```bash
NODE_ENV=production
PORT=3001

# MongoDB Atlas
MONGO_URL=mongodb+srv://futura-prod-user:PASSWORD@cluster0.xxxxx.mongodb.net/futura-prod

# JWT
JWT_SECRET=your-super-secure-secret-here-min-32-chars
JWT_EXPIRES_IN=7d

# Redis Cloud
REDIS_HOST=redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password

# Stripe
STRIPE_PRIVATE_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=futura-tickets-prod

# CORS
CORS_ORIGINS=https://admin.futuratickets.com,https://marketplace.futuratickets.com

# Email
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxx
```

### 3.6 Instalar y Build

```bash
npm install --production
npm run build
```

### 3.7 Configurar PM2

```bash
# Crear ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'futura-admin-api',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};
```

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Auto-restart en boot
pm2 startup
pm2 save

# Ver logs
pm2 logs futura-admin-api
```

### 3.8 Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/futura-admin-api
```

```nginx
server {
    listen 80;
    server_name api.futuratickets.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint (sin proxy para monitoreo rápido)
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/futura-admin-api /etc/nginx/sites-enabled/

# Test y reload
sudo nginx -t
sudo systemctl reload nginx
```

### 3.9 Configurar SSL con Let's Encrypt

```bash
sudo certbot --nginx -d api.futuratickets.com

# Auto-renewal (ya configurado)
sudo certbot renew --dry-run
```

### 3.10 Validar Deployment

```bash
# Test local
curl http://localhost:3001/health

# Test externo
curl https://api.futuratickets.com/health

# Ver Swagger
# https://api.futuratickets.com/api/docs
```

---

## 🔧 PASO 4: Deploy Admin Panel (Vercel)

### 4.1 Preparar para Vercel

```bash
cd futura-tickets-admin

# Verificar build funciona
npm run build
```

### 4.2 Configurar Variables en Vercel

```bash
# Login a Vercel
npm i -g vercel
vercel login

# Deploy
vercel
```

**Configurar en Vercel Dashboard → Settings → Environment Variables**:

```
NEXT_PUBLIC_FUTURA=https://api.futuratickets.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### 4.3 Configurar Dominio

```
Vercel Dashboard → Domains:
- admin.futuratickets.com
```

### 4.4 Validar

```
https://admin.futuratickets.com/login
```

---

## 🔧 PASO 5: Deploy Marketplace (Vercel)

**Mismo proceso que Admin Panel**:

```bash
cd futura-market-place-v2
vercel
```

Variables:
```
NEXT_PUBLIC_API_URL=https://api.futuratickets.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

Dominio: `marketplace.futuratickets.com`

---

## 📊 PASO 6: Monitoring y Logging

### 6.1 Setup Sentry

```bash
# Admin API
cd futura-tickets-admin-api
npm install @sentry/node

# Configurar en main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'https://...@sentry.io/...',
  environment: 'production',
});
```

### 6.2 CloudWatch (AWS)

```bash
# Instalar CloudWatch agent en EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configurar logs
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

### 6.3 Uptime Monitoring

**Usar servicio como**:
- UptimeRobot (gratis)
- Pingdom
- DataDog

**Endpoints a monitorear**:
- `https://api.futuratickets.com/health` (cada 5 min)
- `https://admin.futuratickets.com` (cada 5 min)
- `https://marketplace.futuratickets.com` (cada 5 min)

---

## 🔒 PASO 7: Security Checklist

- [ ] SSL/HTTPS habilitado en todos los dominios
- [ ] CORS configurado con whitelist
- [ ] JWT tokens en httpOnly cookies
- [ ] Secrets en variables de entorno (no en código)
- [ ] Rate limiting habilitado
- [ ] MongoDB IP whitelist configurada
- [ ] Firewall configurado en EC2
- [ ] Backups automáticos habilitados (MongoDB)
- [ ] Logs centralizados
- [ ] Monitoring y alertas activos

---

## 🔄 PASO 8: CI/CD con GitHub Actions

**Crear** `.github/workflows/deploy.yml`:

```yaml
name: Deploy Admin API

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Run tests
        run: |
          cd futura-tickets-admin-api
          npm ci
          npm run test

      - name: Deploy to EC2
        env:
          SSH_KEY: ${{ secrets.EC2_SSH_KEY }}
          HOST: ${{ secrets.EC2_HOST }}
        run: |
          echo "$SSH_KEY" > key.pem
          chmod 400 key.pem
          ssh -i key.pem ubuntu@$HOST "
            cd monorepo-futuratickets/futura-tickets-admin-api &&
            git pull &&
            npm install --production &&
            npm run build &&
            pm2 restart futura-admin-api
          "
```

---

## 🆘 Troubleshooting

### API no responde

```bash
# SSH a EC2
ssh -i key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Ver logs
pm2 logs futura-admin-api

# Ver status
pm2 status

# Reiniciar
pm2 restart futura-admin-api
```

### MongoDB connection timeout

- Verificar IP whitelist en Atlas
- Verificar connection string en `.env`
- Test connection: `mongosh "connection-string"`

### Redis connection failed

- Verificar endpoint y puerto
- Verificar password
- Test: `redis-cli -h host -p port -a password ping`

### CORS errors

- Verificar `CORS_ORIGINS` en Admin API `.env`
- Incluir dominio exacto (con https://)

---

## 📝 Post-Deployment Checklist

- [ ] Admin API health check responde
- [ ] Swagger docs accesible
- [ ] Admin Panel carga correctamente
- [ ] Marketplace carga correctamente
- [ ] Login funciona en Admin Panel
- [ ] Crear evento funciona
- [ ] Comprar ticket funciona (test mode Stripe)
- [ ] Emails se envían correctamente
- [ ] CronJobs ejecutando (verificar logs)
- [ ] SSL certificados válidos
- [ ] Monitoring activo
- [ ] Backups configurados
- [ ] Alertas configuradas

---

## 🎉 ¡Listo para Producción!

Sistema desplegado y operativo. Ver `OPERATIONS_MANUAL.md` para mantenimiento.
```

---

## 📋 DÍA 4-5: Testing Final y Validación

### ✅ TAREA 4.1: Pruebas de carga (2 horas)

**Instalar Artillery**:
```bash
npm install -g artillery
```

**Crear** `load-test.yml`:
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Health check"
    flow:
      - get:
          url: "/health"

  - name: "Get events"
    flow:
      - post:
          url: "/accounts/login"
          json:
            email: "admin@futuratickets.com"
            password: "admin2025"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/admin/events"
          headers:
            Authorization: "Bearer {{ token }}"
```

**Ejecutar**:
```bash
artillery run load-test.yml
```

---

### ✅ TAREA 4.2: Security Audit (2 horas)

```bash
# 1. Vulnerability scan
npm audit

# 2. Fix vulnerabilities
npm audit fix

# 3. Check for outdated packages
npm outdated

# 4. OWASP Dependency Check (opcional)
npm install -g snyk
snyk auth
snyk test
```

---

### ✅ TAREA 4.3: Performance Audit (1 hora)

**Admin Panel**:
```bash
cd futura-tickets-admin
npm run build

# Analizar bundle
ANALYZE=true npm run build

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

---

## 🎯 CHECKPOINT SPRINT 5

**Validación Final del Sistema Completo**:

```bash
# 1. Todos los READMEs actualizados
ls -la */README.md
# Verificar contenido específico de cada proyecto

# 2. Swagger completo
curl http://localhost:3001/api/docs-json | jq '.paths | keys'
# Debe mostrar todos los endpoints documentados

# 3. Deployment guide existe
cat DEPLOYMENT.md | wc -l
# Debe tener >500 líneas

# 4. Load test pasa
artillery run load-test.yml
# Verificar 95th percentile < 500ms

# 5. Security audit limpio
npm audit --audit-level=high
# 0 high/critical vulnerabilities

# 6. Performance
npm run build
# Bundle size <500KB

# 7. All services running
./start-all.sh
sleep 10
curl http://localhost:3001/health
curl http://localhost:3003
curl http://localhost:3000
```

**Checklist Final**:
- [ ] README Admin API actualizado y completo
- [ ] README Admin Panel actualizado y completo
- [ ] README Marketplace actualizado
- [ ] Swagger con todos los endpoints documentados
- [ ] `@ApiOperation` en todos los controllers
- [ ] `@ApiResponse` con ejemplos
- [ ] DEPLOYMENT.md creado (>500 líneas)
- [ ] Guías para AWS, Vercel, MongoDB Atlas
- [ ] CI/CD workflow configurado
- [ ] Load tests pasan (95th percentile <500ms)
- [ ] Security audit limpio (0 high/critical)
- [ ] Bundle size <500KB
- [ ] Performance audit >90 en Lighthouse
- [ ] Todos los tests pasan

---

# 🎉 RESUMEN FINAL

## ✅ Lo Que Has Logrado

Después de completar estos 5 sprints:

### **Sprint 0 (3 días)**: Fundamentos ✅
- CronJob de expiración activado
- `.env.example` en 3 proyectos
- Jest configurado en backend y frontend
- Scripts de startup automatizados
- Developer guide creado

### **Sprint 1 (1 semana)**: Seguridad ✅
- Tokens movidos a httpOnly cookies
- JWT Strategy actualizado
- Logout implementado
- Tests de autenticación

### **Sprint 2 (1 semana)**: Refactoring Frontend ✅
- `services.tsx` dividido en módulos <1000 líneas cada uno
- `interfaces.tsx` dividido por dominio
- Validación con Zod en todos los formularios
- Imports centralizados

### **Sprint 3 (1 semana)**: Refactoring Backend ✅
- `admin-event.service.ts` dividido en 4 servicios
- Facade pattern implementado
- Cada servicio <2000 líneas
- Tests unitarios para cada módulo

### **Sprint 4 (1 semana)**: Performance ✅
- Redis cache en backend
- React Query en frontend
- Lazy loading de componentes
- Imágenes optimizadas
- Bundle size reducido >60%

### **Sprint 5 (1 semana)**: Documentación ✅
- READMEs completos y profesionales
- Swagger documentation exhaustiva
- Deployment guide para producción
- Load testing y security audit
- CI/CD configurado

---

## 📊 Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Seguridad** |  |  |  |
| Tokens en localStorage | ❌ | ✅ httpOnly cookies | 100% |
| CORS | Cualquier origen | Whitelist | 100% |
| **Código** |  |  |  |
| services.tsx | 28,142 líneas | ~1,000 líneas/módulo | 96% |
| admin-event.service.ts | 35,424 líneas | ~2,000 líneas/módulo | 94% |
| interfaces.tsx | 9,690 líneas | ~500 líneas/módulo | 95% |
| **Performance** |  |  |  |
| Response time (sin cache) | ~200ms | ~5ms | 97.5% |
| Bundle size | ~2MB | <500KB | 75% |
| **Testing** |  |  |  |
| Test coverage | 0% | >70% | - |
| **Documentación** |  |  |  |
| README | Genérico | Completo | - |
| API Docs | Básico | Swagger completo | - |

---

## 🚀 Próximos Pasos (Post-Sprints)

Una vez completados estos 5 sprints, puedes:

1. **Ir a producción** con confianza
2. **Onboarding de nuevos developers** es trivial (gracias a documentación)
3. **Mantenimiento** es fácil (código modular)
4. **Escalado** es sencillo (cache + microservicios)

---

## 📞 Soporte Durante Sprints

Si te atascas en algún sprint:

1. **Revisar el checkpoint** al final de cada sprint
2. **Ejecutar validaciones** de cada tarea
3. **Consultar logs** (`./logs/` o `pm2 logs`)
4. **Revisar tests** (`npm run test`)
5. **Pedir ayuda** con error específico

---

**¡Éxito con los sprints! 🎯**

Cada sprint es independiente y puede completarse en el orden sugerido. Si necesitas priorizar diferente, los sprints 1 (seguridad) y 2 (refactoring frontend) son los más críticos.
