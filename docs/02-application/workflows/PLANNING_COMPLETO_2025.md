# 📋 PLANNING COMPLETO - FUTURA TICKETS 2025

**Fecha de Creación**: 16 de Octubre 2025
**Última Actualización**: 16 de Octubre 2025
**Estado**: Sistema funcional en desarrollo local
**Versión Actual**: 1.0.0-dev

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual del Proyecto
- ✅ **Backend API funcionando** (puerto 3001)
- ✅ **Admin Panel funcionando** (puerto 3003)
- ✅ **Marketplace funcionando** (puerto 3000)
- ✅ **Autenticación con httpOnly cookies implementada**
- ✅ **Sistema de refresh tokens funcional**
- ✅ **Gestión de usuarios dinámica desde panel admin**
- ✅ **Tests básicos implementados** (82 tests passing)
- ✅ **Schemas Mongoose corregidos**

### Métricas del Proyecto
| Métrica | Valor | Estado |
|---------|-------|--------|
| Líneas de código totales | ~150,000 | 🟡 Alto |
| Test coverage | 82 tests | 🟢 Básico |
| Aplicaciones activas | 3 | 🟢 Óptimo |
| APIs documentadas | 1 (Swagger) | 🟡 Parcial |
| Deuda técnica estimada | 267.5 horas | 🔴 Alta |

---

## 🎯 ESTADO ACTUAL DETALLADO

### ✅ Completado Recientemente (16 Oct 2025)

#### 1. **Autenticación Segura**
- [x] Sistema de httpOnly cookies implementado
- [x] Refresh tokens con rotación automática
- [x] Endpoints seguros (`/accounts/secure/*`)
- [x] Validación de sesiones
- [x] Scripts de creación/reset de admin
- [x] Documentación completa (AUTHENTICATION_SETUP.md, ADMIN_SETUP_FINAL.md)

**Archivos clave creados**:
```
futura-tickets-admin-api/
├── src/Auth/services/
│   ├── auth-cookie.service.ts         ✅ NUEVO
│   ├── auth-cookie.service.spec.ts    ✅ NUEVO (9 tests)
│   └── refresh-token.service.ts       ✅ NUEVO (12 tests)
├── src/Account/
│   └── account-secure.controller.ts   ✅ NUEVO (endpoints seguros)
├── src/scripts/
│   ├── seed-admin-direct.ts          ✅ NUEVO
│   └── reset-admin-password.ts       ✅ NUEVO
└── shared/validation/
    └── auth.schema.ts                ✅ NUEVO (Zod schemas)

futura-tickets-admin/
├── app/users/page.tsx                ✅ NUEVO (gestión usuarios)
└── shared/services/
    └── auth-secure.service.ts        ✅ NUEVO (frontend cookies)
```

#### 2. **Schemas Mongoose Corregidos**
- [x] Event.schema.ts - EventStatus enum fixed
- [x] Orders.schema.ts - OrderStatus enum fixed
- [x] Sales.schema.ts - TicketStatus enum fixed
- [x] Payments.schema.ts - PaymentStatus enum fixed
- [x] Notifications.schema.ts - NotificationType enum fixed

#### 3. **Gestión de Usuarios**
- [x] Página web `/users` para crear usuarios dinámicamente
- [x] Roles: ADMIN, PROMOTER, ACCESS
- [x] Validación de formularios (password min 8 chars, email válido)
- [x] Eliminación de usuarios con confirmación

#### 4. **Tests**
- [x] 82 tests pasando (7 suites)
- [x] auth.service.spec.ts (6 tests)
- [x] auth-cookie.service.spec.ts (9 tests)
- [x] refresh-token.service.spec.ts (12 tests)
- [x] app.controller.spec.ts
- [x] storage.service.spec.ts
- [x] health-check.controller.spec.ts
- [x] cron-jobs.service.spec.ts

---

## 🚀 ROADMAP DETALLADO

### SPRINT 1: Seguridad y Estabilidad (Semana 1-2) - **URGENTE**

#### **Objetivo**: Preparar sistema para producción básica

#### Tareas P0 - Críticas (Completar en 3 días)

##### 1. CORS Whitelist (2 horas) 🔴
**Archivo**: `futura-tickets-admin-api/src/main.ts`

**Estado actual**:
```typescript
app.enableCors(); // ❌ Permite TODOS los orígenes
```

**Cambiar a**:
```typescript
const whitelist = [
  'http://localhost:3000',
  'http://localhost:3003',
  process.env.FRONTEND_URL_ADMIN,
  process.env.FRONTEND_URL_MARKETPLACE,
];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Pasos**:
1. Editar `futura-tickets-admin-api/src/main.ts` líneas 14-26
2. Descomentar código existente
3. Agregar variables de entorno a `.env`:
   ```bash
   FRONTEND_URL_ADMIN=http://localhost:3003
   FRONTEND_URL_MARKETPLACE=http://localhost:3000
   ```
4. Probar con `curl` que rechace orígenes no autorizados
5. Commit: `security: enable CORS whitelist`

**Testing**:
```bash
# Debe funcionar
curl -H "Origin: http://localhost:3003" http://localhost:3001/health

# Debe fallar
curl -H "Origin: http://malicious-site.com" http://localhost:3001/health
```

---

##### 2. Activar CronJob de Expiración (1 hora) 🔴
**Archivo**: `futura-tickets-admin-api/src/CronJobs/cron-jobs.service.ts`

**Estado actual** (línea 31):
```typescript
// await this.checkEventExpireDate(event._id, event.dateTime.endDate); // ❌ COMENTADO
```

**Cambiar a**:
```typescript
await this.checkEventExpireDate(event._id, event.dateTime.endDate); // ✅ ACTIVO
```

**Pasos**:
1. Editar `src/CronJobs/cron-jobs.service.ts` línea 31
2. Descomentar la línea
3. Agregar logs para debugging:
   ```typescript
   this.logger.log(`Checking expiration for event ${event.name} (${event._id})`);
   ```
4. Probar creando un evento con fecha de fin en el pasado
5. Verificar que cambia a status `CLOSED`
6. Commit: `fix: enable event expiration cron job`

**Testing**:
```typescript
// Crear evento de prueba con fecha pasada
const testEvent = {
  name: 'Test Expired Event',
  dateTime: {
    endDate: new Date('2025-01-01'), // Fecha pasada
  }
};

// Esperar 15 minutos (cron job ejecuta)
// Verificar que event.status === 'CLOSED'
```

---

##### 3. Variables de Entorno Validadas (3 horas) 🔴

**Objetivo**: Fail-fast si faltan variables críticas

**Crear**: `futura-tickets-admin-api/src/config/env.validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number).default('3001'),

  // Database
  MONGO_URL: z.string().url('MONGO_URL must be a valid URL'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),

  // JWT
  JWT_SECRET_KEY: z.string().min(32, 'JWT_SECRET_KEY must be at least 32 characters'),
  JWT_EXPIRATION_TIME: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Encryption
  ENCRYPT_SECRET_KEY: z.string().length(32, 'ENCRYPT_SECRET_KEY must be exactly 32 characters'),
  ENCRYPT_SECRET_KEY_VI: z.string().length(16, 'ENCRYPT_SECRET_KEY_VI must be exactly 16 characters'),

  // Stripe (required)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLIC_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Google Cloud Storage (required)
  GCS_PROJECT_ID: z.string(),
  GCS_BUCKET_NAME: z.string(),
  GCS_KEY_FILE: z.string(),

  // Email
  MAIL_HOST: z.string().default('smtp.gmail.com'),
  MAIL_PORT: z.string().transform(Number).default('587'),
  MAIL_USER: z.string().email(),
  MAIL_PASSWORD: z.string(),

  // CORS
  CORS_ORIGINS: z.string().transform((str) => str.split(',')),

  // Optional
  COOKIE_DOMAIN: z.string().optional(),
  SOCKET_FUTURA_IO: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}
```

**Integrar en**: `futura-tickets-admin-api/src/main.ts`

```typescript
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  // Validate environment variables FIRST
  const env = validateEnv();
  console.log('✅ Environment variables validated');

  const app = await NestFactory.create(AppModule);
  // ... rest of setup
}
```

**Pasos**:
1. Crear archivo `src/config/env.validation.ts`
2. Implementar validación con Zod
3. Integrar en `main.ts` (antes de crear app)
4. Actualizar `.env.example` con todas las variables
5. Documentar en README
6. Commit: `feat: add environment variable validation`

**Testing**:
```bash
# Test 1: Sin JWT_SECRET_KEY
unset JWT_SECRET_KEY
npm run start:dev
# Debe fallar con mensaje claro

# Test 2: JWT_SECRET_KEY muy corto
export JWT_SECRET_KEY="short"
npm run start:dev
# Debe fallar: "JWT_SECRET_KEY must be at least 32 characters"

# Test 3: Todo correcto
cp .env.example .env
# Fill all values
npm run start:dev
# Debe iniciar correctamente
```

---

##### 4. Migrar Frontend a Auth Seguro (4 horas) 🔴

**Objetivo**: Usar httpOnly cookies en lugar de localStorage

**Archivos a modificar**:

**4.1. Login Page** (`futura-tickets-admin/app/login/page.tsx`)

```typescript
// ANTES
import { loginAccount } from '@/shared/services/auth.service';

const handleLogin = async (values) => {
  const account = await loginAccount(values);
  localStorage.setItem('token', account.token); // ❌ localStorage
  router.push('/events');
};

// DESPUÉS
import { loginAccount } from '@/shared/services/auth-secure.service';

const handleLogin = async (values) => {
  const account = await loginAccount(values);
  // ✅ Token automáticamente en httpOnly cookie
  router.push('/events');
};
```

**4.2. Auth Provider** (`futura-tickets-admin/components/FuturaAdminProvider.tsx`)

```typescript
// ANTES
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    validateToken(token);
  }
}, []);

// DESPUÉS
import { validateSession } from '@/shared/services/auth-secure.service';

useEffect(() => {
  const checkSession = async () => {
    const session = await validateSession();
    if (!session || session.expired) {
      router.push('/login');
    }
  };
  checkSession();
}, []);
```

**4.3. API Calls** (todos los archivos en `shared/services/`)

```typescript
// ANTES
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// DESPUÉS
headers: {
  'Content-Type': 'application/json',
},
credentials: 'include', // ✅ Envía cookies automáticamente
```

**Pasos**:
1. Buscar todos los `localStorage.getItem('token')` en el proyecto
2. Reemplazar con importaciones de `auth-secure.service.ts`
3. Agregar `credentials: 'include'` a todos los fetch
4. Eliminar código de manejo manual de tokens
5. Probar login/logout completo
6. Commit: `security: migrate to httpOnly cookies authentication`

**Comando para encontrar todos los usos**:
```bash
cd futura-tickets-admin
grep -r "localStorage.getItem('token')" app/ components/ shared/
```

---

#### Tareas P1 - Altas (Completar en 7 días)

##### 5. Refactorizar services.tsx (12 horas) 🟡

**Problema**: Archivo de 28,142 líneas - imposible de mantener

**Estructura propuesta**:
```
futura-tickets-admin/shared/services/
├── index.ts                    # Re-exports
├── api/
│   ├── auth.service.ts        # Login, register, token
│   ├── events.service.ts      # CRUD eventos
│   ├── sales.service.ts       # Ventas, tickets
│   ├── orders.service.ts      # Órdenes de compra
│   ├── payments.service.ts    # Pagos, withdrawals
│   ├── analytics.service.ts   # Estadísticas
│   ├── clients.service.ts     # Gestión clientes
│   ├── promocodes.service.ts  # Códigos promocionales
│   ├── coupons.service.ts     # Cupones
│   └── invitations.service.ts # Sistema invitaciones
├── utils/
│   ├── api-client.ts          # Fetch wrapper con error handling
│   └── constants.ts           # API_URL, endpoints
└── types/
    └── index.ts               # Re-export de interfaces
```

**Paso a paso**:

1. **Crear estructura de carpetas**:
```bash
cd futura-tickets-admin/shared
mkdir -p services/api services/utils services/types
```

2. **Crear api-client.ts** (base para todos los servicios):
```typescript
// services/utils/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_FUTURA;

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // httpOnly cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, error);
  }

  return response.json();
}
```

3. **Extraer auth.service.ts**:
```bash
# Buscar todas las funciones de auth
grep -n "export async function.*login\|register\|validate" services.tsx

# Copiar a nuevo archivo
# auth.service.ts
```

4. **Actualizar imports** progresivamente:
```typescript
// ANTES
import { loginAccount } from '@/shared/services';

// DESPUÉS
import { loginAccount } from '@/shared/services/api/auth.service';
```

5. **Crear index.ts** para retrocompatibilidad:
```typescript
// services/index.ts
export * from './api/auth.service';
export * from './api/events.service';
export * from './api/sales.service';
// ... etc
```

**Commits sugeridos**:
- `refactor(services): create api-client utility`
- `refactor(services): extract auth.service.ts`
- `refactor(services): extract events.service.ts`
- `refactor(services): extract sales.service.ts`
- ... (uno por servicio)

---

##### 6. Implementar Tests Unitarios (16 horas) 🟡

**Objetivo**: Alcanzar 60% de cobertura

**Configurar Jest** (si no está):
```bash
cd futura-tickets-admin
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**jest.config.js**:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

**Tests prioritarios**:

**6.1. auth.service.test.ts**:
```typescript
import { loginAccount, validateSession } from '@/shared/services/api/auth.service';

describe('auth.service', () => {
  describe('loginAccount', () => {
    it('should login with valid credentials', async () => {
      const result = await loginAccount({
        email: 'admin@futuratickets.com',
        password: 'Admin123456',
      });

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('email', 'admin@futuratickets.com');
      expect(result).not.toHaveProperty('token'); // En cookie
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        loginAccount({
          email: 'wrong@email.com',
          password: 'wrongpass',
        })
      ).rejects.toThrow();
    });
  });

  describe('validateSession', () => {
    it('should return null when no session', async () => {
      const result = await validateSession();
      expect(result).toBeNull();
    });
  });
});
```

**6.2. Login.test.tsx**:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '@/app/login/page';

describe('Login Page', () => {
  it('should render login form', () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error for invalid email', async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid credentials', async () => {
    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@futuratickets.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Admin123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/events');
    });
  });
});
```

**Comandos**:
```bash
# Ejecutar tests
npm test

# Ejecutar con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

##### 7. Validación de Formularios con Zod (8 horas) 🟡

**Ya implementado en backend** ✅, falta frontend

**Instalar**:
```bash
cd futura-tickets-admin
npm install react-hook-form @hookform/resolvers zod
```

**Ejemplo - Login Form**:

```typescript
// shared/validation/auth.schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**Usar en componente**:
```typescript
// app/login/page.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/shared/validation/auth.schemas';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginAccount(data);
      router.push('/events');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          {...register('email')}
          type="email"
          id="email"
        />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          {...register('password')}
          type="password"
          id="password"
        />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

**Formularios a validar**:
1. ✅ Login (email, password)
2. ⏳ Register (name, lastName, email, password, confirmPassword)
3. ⏳ Create Event (todos los campos)
4. ⏳ Create User (admin panel)
5. ⏳ Payment Request (amount, method)
6. ⏳ Create Promo Code (code, discount, expiry)

---

### SPRINT 2: Refactoring y Calidad (Semana 3-4)

#### Tareas P2

##### 8. Refactorizar admin-event.service.ts (16 horas) 🟡

**Problema**: 35,424 líneas en un solo archivo

**Dividir en**:
```
futura-tickets-admin-api/src/Event/
├── services/
│   ├── event.service.ts              # Core CRUD
│   ├── event-tickets.service.ts      # Gestión tickets/lotes
│   ├── event-resale.service.ts       # Lógica reventa
│   ├── event-analytics.service.ts    # Estadísticas
│   └── event-blockchain.service.ts   # Interacción blockchain
├── controllers/
│   ├── admin-event.controller.ts     # Endpoints admin
│   └── user-event.controller.ts      # Endpoints público
└── event.module.ts                   # Module definition
```

**Ejemplo - event.service.ts**:
```typescript
@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private ticketsService: EventTicketsService,
    private resaleService: EventResaleService,
    private analyticsService: EventAnalyticsService,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const event = await this.eventModel.create({
      ...dto,
      status: EventStatus.CREATED,
    });

    // Delegar gestión de tickets
    await this.ticketsService.createTicketLots(event._id, dto.ticketLots);

    return event;
  }

  async findAll(promoter: string): Promise<Event[]> {
    return this.eventModel.find({ promoter });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id);
    if (!event) throw new NotFoundException();
    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(id);
  }

  async launch(id: string, dateTime: DateTime): Promise<Event> {
    return this.eventModel.findByIdAndUpdate(
      id,
      {
        status: EventStatus.LAUNCHED,
        'dateTime.launchDate': dateTime.launchDate,
      },
      { new: true }
    );
  }
}
```

---

##### 9. Implementar Tests E2E (12 horas) 🟡

**Instalar Playwright**:
```bash
cd futura-tickets-admin
npm install -D @playwright/test
npx playwright install
```

**playwright.config.ts**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3003',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3003,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

**Tests críticos**:

**e2e/login.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login as admin successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'admin@futuratickets.com');
    await page.fill('input[name="password"]', 'Admin123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/events');
    await expect(page.locator('text=Admin Futura')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/error|invalid/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@futuratickets.com');
    await page.fill('input[name="password"]', 'Admin123456');
    await page.click('button[type="submit"]');

    // Then logout
    await page.click('text=Logout');
    await expect(page).toHaveURL('/login');
  });
});
```

**e2e/create-event.spec.ts**:
```typescript
test.describe('Create Event Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PROMOTER
    await page.goto('/login');
    await page.fill('input[name="email"]', 'promotor@futuratickets.com');
    await page.fill('input[name="password"]', 'promoter2025');
    await page.click('button[type="submit"]');
  });

  test('should create event successfully', async ({ page }) => {
    await page.goto('/events/create');

    // Fill form
    await page.fill('input[name="name"]', 'Test Event E2E');
    await page.fill('textarea[name="description"]', 'Test description');

    // Upload image
    await page.setInputFiles('input[type="file"]', './e2e/fixtures/test-image.jpg');

    // Set dates
    await page.fill('input[name="startDate"]', '2025-12-31');
    await page.fill('input[name="endDate"]', '2025-12-31');

    // Add ticket type
    await page.click('text=Add Ticket Type');
    await page.fill('input[name="ticketType"]', 'General');
    await page.fill('input[name="ticketPrice"]', '50');
    await page.fill('input[name="ticketQuantity"]', '100');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to event detail
    await expect(page).toHaveURL(/\/events\/[a-f0-9]+/);
    await expect(page.locator('text=Test Event E2E')).toBeVisible();
  });
});
```

**Ejecutar tests**:
```bash
npx playwright test
npx playwright test --ui  # Interactive mode
npx playwright show-report  # View results
```

---

##### 10. Error Boundaries (4 horas) 🟡

**Crear**: `components/ErrorBoundary.tsx`

```typescript
'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Send to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Algo salió mal</h1>
          <p>Lo sentimos, ha ocurrido un error inesperado.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            {this.state.error?.toString()}
          </details>
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Recargar página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usar en layout**:
```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

// app/events/layout.tsx
export default function EventsLayout({ children }) {
  return (
    <ErrorBoundary
      fallback={
        <div>
          <h2>Error en eventos</h2>
          <p>No se pudieron cargar los eventos.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

### SPRINT 3: Performance y Monitoring (Semana 5-6)

#### Tareas P3

##### 11. Code Splitting (4 horas) 🟢

**Lazy load componentes pesados**:

```typescript
// ANTES
import Analytics from '@/components/Analytics';
import EventList from '@/components/EventList';
import CreateEvent from '@/components/CreateEvent';

// DESPUÉS
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const Analytics = lazy(() => import('@/components/Analytics'));
const EventList = lazy(() => import('@/components/EventList'));
const CreateEvent = lazy(() => import('@/components/CreateEvent'));

// En uso
<Suspense fallback={<Spin size="large" />}>
  <Analytics />
</Suspense>
```

**Analizar bundle**:
```bash
npm install -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... config
});

# Ejecutar
ANALYZE=true npm run build
```

**Objetivo**: Reducir bundle inicial de ~2MB a <500KB

---

##### 12. Optimizar Imágenes (4 horas) 🟢

**Reemplazar `<img>` por `<Image>`**:

```typescript
// ANTES
<img src={event.image} alt={event.name} width={300} />

// DESPUÉS
import Image from 'next/image';

<Image
  src={event.image}
  alt={event.name}
  width={300}
  height={200}
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
  loading="lazy"
/>
```

**Configurar next.config.ts**:
```typescript
const nextConfig = {
  images: {
    domains: [
      'storage.googleapis.com',  // Google Cloud Storage
      'futuratickets.blob.core.windows.net',  // Azure
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};
```

---

##### 13. Caché en Redis (8 horas) 🟢

**Implementar en backend**:

```typescript
// src/Event/event.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs/redis';
import { Redis } from 'ioredis';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findAll(promoter: string): Promise<Event[]> {
    const cacheKey = `events:promoter:${promoter}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache HIT: ${cacheKey}`);
      return JSON.parse(cached);
    }

    // Query database
    this.logger.log(`Cache MISS: ${cacheKey}`);
    const events = await this.eventModel.find({ promoter });

    // Store in cache (TTL: 5 minutes)
    await this.redis.set(
      cacheKey,
      JSON.stringify(events),
      'EX',
      300
    );

    return events;
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const event = await this.eventModel.create(dto);

    // Invalidate cache
    await this.redis.del(`events:promoter:${event.promoter}`);

    return event;
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.eventModel.findByIdAndUpdate(id, dto, { new: true });

    // Invalidate cache
    await this.redis.del(`events:promoter:${event.promoter}`);
    await this.redis.del(`event:${id}`);

    return event;
  }
}
```

**Estrategia de caché**:
| Dato | TTL | Invalidar en |
|------|-----|--------------|
| Lista de eventos | 5 min | Create, update, delete event |
| Detalle de evento | 10 min | Update, delete event |
| Analytics promotor | 15 min | Nueva venta, nuevo pago |
| Ventas de evento | 1 min | Nueva venta, update status |

---

##### 14. Sentry Integration (4 horas) 🟢

**Backend**:
```bash
cd futura-tickets-admin-api
npm install @sentry/node @sentry/tracing
```

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';
import '@sentry/tracing';

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule);

  // Sentry error handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  await app.listen(3001);
}
```

**Frontend**:
```bash
cd futura-tickets-admin
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

##### 15. Health Checks Avanzados (2 horas) 🟢

**Crear**: `src/Health/health-check.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MongooseHealthIndicator, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { InjectRedis } from '@nestjs/redis';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('mongodb'),
      () => this.checkRedis(),
      () => this.disk.checkStorage('disk', { threshold: 250 * 1024 * 1024 * 1024 }), // 250GB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('mongodb'),
      () => this.checkRedis(),
    ]);
  }

  @Get('live')
  async live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  private async checkRedis() {
    try {
      await this.redis.ping();
      return { redis: { status: 'up' } };
    } catch (error) {
      return { redis: { status: 'down', error: error.message } };
    }
  }
}
```

**Usar en Kubernetes**:
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

### SPRINT 4+: Nuevas Features (Futuro)

#### Tareas P4

##### 16. Notificaciones Real-time (12 horas) 🔵

**Habilitar Socket.IO** (ya está el código, solo comentado):

```typescript
// src/main.ts
// DESCOMENTAR:
const SOCKET_FUTURA_IO = process.env.SOCKET_FUTURA_IO;

if (SOCKET_FUTURA_IO) {
  app.connectMicroservice({
    transport: Transport.SOCKET_IO,
    options: {
      url: SOCKET_FUTURA_IO,
      hub: 'Hub',
    },
  });
  await app.startAllMicroservices();
}
```

**Frontend - Socket Context**:
```typescript
// components/SocketProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_FUTURA!);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    newSocket.on('order-created', (data) => {
      // Show notification
      toast.success(`Nueva orden: ${data.orderId}`);
    });

    newSocket.on('sale-updated', (data) => {
      // Update UI
      queryClient.invalidateQueries(['sales', data.eventId]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

---

##### 17. Sistema de Reportes PDF (16 horas) 🔵

**Instalar**:
```bash
npm install puppeteer pdfkit
```

**Crear servicio**:
```typescript
// src/Reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  async generateSalesReport(eventId: string): Promise<Buffer> {
    const event = await this.eventService.findOne(eventId);
    const sales = await this.salesService.findByEvent(eventId);

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text(`Sales Report: ${event.name}`, { align: 'center' });
    doc.moveDown();

    // Stats
    doc.fontSize(14).text(`Total Sales: ${sales.length}`);
    doc.text(`Total Revenue: $${sales.reduce((sum, s) => sum + s.price, 0)}`);
    doc.moveDown();

    // Table
    doc.fontSize(10);
    sales.forEach((sale) => {
      doc.text(`${sale.client.email} - $${sale.price} - ${sale.type}`);
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
```

**Endpoint**:
```typescript
@Get('reports/sales/:eventId')
async downloadSalesReport(
  @Param('eventId') eventId: string,
  @Res() res: Response,
) {
  const pdf = await this.reportsService.generateSalesReport(eventId);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=sales-${eventId}.pdf`,
  });

  res.send(pdf);
}
```

---

##### 18. Blockchain Completo (40 horas) 🔵

**Implementar en pasos**:

1. **Deploy Contract automático**:
```typescript
// src/Blockchain/blockchain.service.ts
async deployEventNFT(event: Event): Promise<string> {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const factory = new ethers.ContractFactory(
    EventNFT.abi,
    EventNFT.bytecode,
    wallet
  );

  const contract = await factory.deploy(
    event.name,
    event.capacity,
    event.dateTime.startDate
  );

  await contract.waitForDeployment();

  return await contract.getAddress();
}
```

2. **Mint NFT al vender ticket**:
```typescript
async mintTicketNFT(sale: Sale): Promise<string> {
  const contract = new ethers.Contract(
    sale.event.address,
    EventNFT.abi,
    wallet
  );

  const tx = await contract.mintTicket(
    sale.client.address,
    sale.tokenId,
    sale.type
  );

  const receipt = await tx.wait();
  return receipt.hash;
}
```

3. **Verificar NFT en entrada**:
```typescript
async verifyNFT(ticketId: string): Promise<boolean> {
  const contract = new ethers.Contract(
    event.address,
    EventNFT.abi,
    provider
  );

  const owner = await contract.ownerOf(ticketId);
  return owner !== ethers.ZeroAddress;
}
```

---

## 📊 TRACKING Y MÉTRICAS

### KPIs de Desarrollo

| KPI | Objetivo | Actual | Estado |
|-----|----------|--------|--------|
| **Test Coverage** | >60% | 82 tests | 🟡 Básico |
| **Build Time** | <2 min | 1:45 | 🟢 OK |
| **Bundle Size** | <500KB | ~2MB | 🔴 Alto |
| **API Response Time** | <200ms | ~150ms | 🟢 OK |
| **Uptime** | >99.9% | - | ⏳ N/A |

### Timeline Estimado

```
Semana 1-2: Sprint 1 (Seguridad)
├── [===================================] 100% P0 Críticas
└── [====================              ] 60% P1 Altas

Semana 3-4: Sprint 2 (Calidad)
├── [============================      ] 80% Refactoring
└── [========================          ] 70% Tests

Semana 5-6: Sprint 3 (Performance)
├── [==============================    ] 85% Optimizaciones
└── [==========================        ] 75% Monitoring

Semana 7+: Sprint 4 (Features)
├── [=============                     ] 40% Real-time
├── [==========                        ] 30% Reportes
└── [=====                             ] 15% Blockchain
```

---

## 🔄 METODOLOGÍA

### Daily Workflow

**09:00 - Standup**:
- ¿Qué hice ayer?
- ¿Qué haré hoy?
- ¿Hay bloqueos?

**09:30 - 12:30 - Deep Work**:
- Implementar tareas P0/P1
- Sin interrupciones

**12:30 - 13:30 - Lunch**

**13:30 - 15:00 - Code Review**:
- Revisar PRs
- Testing

**15:00 - 17:00 - Deep Work 2**:
- Continuar tareas
- Documentación

**17:00 - 18:00 - Wrap up**:
- Commit & push
- Actualizar JIRA/tracking
- Preparar siguiente día

### Definición de Done (DoD)

Una tarea está "Done" cuando:
- ✅ Código implementado y funcional
- ✅ Tests unitarios escritos (>60% coverage)
- ✅ Code review aprobado
- ✅ Documentación actualizada (README, Swagger)
- ✅ Sin warnings ni errors en lint
- ✅ Deploy en staging exitoso (cuando aplique)

---

## 📞 RECURSOS Y CONTACTO

### Documentación
- [ADMIN_SETUP_FINAL.md](./futura-tickets-admin-api/ADMIN_SETUP_FINAL.md) - Guía de autenticación
- [AUTHENTICATION_SETUP.md](./futura-tickets-admin-api/AUTHENTICATION_SETUP.md) - Detalles técnicos auth
- [ROADMAP_SIGUIENTE.md](./ROADMAP_SIGUIENTE.md) - Roadmap original
- [PLANNING_COMPLETO_2025.md](./PLANNING_COMPLETO_2025.md) - Este documento

### Scripts Útiles

```bash
# Iniciar todo el sistema
./start-all.sh

# Parar todo
./stop-all.sh

# Tests completos
cd futura-tickets-admin-api && npm test

# Resetear admin
cd futura-tickets-admin-api && npm run reset:admin

# Health checks
curl http://localhost:3001/health/info | jq '.'
```

---

## ✅ CHECKLIST SEMANAL

### Semana 1
- [ ] CORS whitelist habilitado
- [ ] CronJob de expiración activo
- [ ] Variables de entorno validadas
- [ ] Frontend migrado a auth seguro
- [ ] services.tsx refactorizado (50%)

### Semana 2
- [ ] services.tsx refactorizado (100%)
- [ ] Tests unitarios básicos (>60% coverage)
- [ ] Validación de formularios con Zod
- [ ] admin-event.service.ts dividido (50%)

### Semana 3
- [ ] admin-event.service.ts dividido (100%)
- [ ] Tests E2E críticos implementados
- [ ] Error boundaries en todas las páginas
- [ ] READMEs actualizados

### Semana 4
- [ ] Swagger completo con ejemplos
- [ ] Code splitting implementado
- [ ] Imágenes optimizadas con Next/Image
- [ ] Caché en Redis funcionando

### Semana 5
- [ ] Sentry integrado (frontend + backend)
- [ ] Health checks avanzados
- [ ] Logging estructurado
- [ ] Guías de deployment creadas

### Semana 6
- [ ] CI/CD pipeline configurado
- [ ] Performance audit pasando
- [ ] Security audit sin issues críticos
- [ ] Sistema listo para staging

---

## 🎯 PRÓXIMA ACCIÓN

**EMPEZAR MAÑANA CON:**

### Tarea 1: CORS Whitelist (2 horas)
```bash
cd futura-tickets-admin-api
code src/main.ts
# Descomentar líneas 15-26
# Agregar CORS_ORIGINS a .env
npm run start:dev
```

### Tarea 2: CronJob Expiración (1 hora)
```bash
code src/CronJobs/cron-jobs.service.ts
# Descomentar línea 31
# Agregar logs
# Commit & push
```

### Tarea 3: Env Validation (3 horas)
```bash
mkdir src/config
touch src/config/env.validation.ts
# Implementar validación Zod
# Integrar en main.ts
# Actualizar .env.example
```

**Total: 6 horas** - Mejoras críticas de seguridad sin riesgo.

---

**Última Actualización**: 16 Octubre 2025 08:45
**Próxima Revisión**: 17 Octubre 2025 09:00
**Responsable**: Equipo de Desarrollo
**Estado**: 🟢 ACTIVO

---

