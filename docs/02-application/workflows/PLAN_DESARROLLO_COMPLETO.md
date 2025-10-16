# 📋 Plan de Desarrollo Completo - FuturaTickets

**Fecha**: 16 Octubre 2025
**Estado Actual**: Sistema funcional con documentación completa y configuraciones de desarrollo implementadas
**Versión**: 2.0.0-dev

---

## 🎯 RESUMEN EJECUTIVO

### Trabajo Completado Recientemente

#### ✅ Infraestructura de Deployment (Completado)
- Configuración completa de Kubernetes
- Manifests para Admin API, Admin Panel, Marketplace
- MongoDB y Redis en cluster
- Monitoring stack (Grafana, Prometheus, AlertManager)
- Sentry integration
- CI/CD con GitHub Actions
- Smoke tests y load tests
- Sistema de backups automáticos (CronJobs)

#### ✅ Infraestructura de Desarrollo (Completado)
- Git Worktrees: Documentación completa + scripts automatizados
- Linting y Formatting: ESLint, Prettier, EditorConfig compartidos
- Scripts de automatización: start-all.sh, stop-all.sh, quick-start.sh
- Validación de deployment: validate-deployment.sh
- Documentación exhaustiva:
  - SETUP_GUIDE.md (800+ líneas)
  - LINTING_SETUP.md (465 líneas)
  - GIT_WORKTREES_GUIDE.md (600+ líneas)
  - DEVELOPMENT_WORKFLOW.md (1000+ líneas)

#### ✅ Seguridad Básica (Completado)
- CORS whitelist configurado con `CORS_ORIGINS` env var
- CronJob de expiración de eventos activado
- `.env.example` en todos los proyectos
- Validación de env vars en startup (warning mode)
- JWT + httpOnly cookies configurados

### Proyectos Activos

| Proyecto | Estado | Puerto | Descripción |
|----------|--------|--------|-------------|
| **futura-tickets-admin-api** | ✅ Running | 3001 | Backend NestJS (9,485 líneas) |
| **futura-tickets-admin** | ✅ Running | 3003 | Admin Panel Next.js (11,343 líneas) |
| **futura-market-place-v2** | ✅ Running | 3000 | Marketplace Next.js (3,818 líneas) |
| **MongoDB Atlas** | ✅ Connected | - | Base de datos principal |
| **Redis** | ✅ Connected | 6379 | Cache y queues |

---

## 🚀 PRÓXIMOS PASOS PRIORITIZADOS

Basándome en el análisis del ROADMAP_SIGUIENTE.md y los CLAUDE.md de cada proyecto, aquí están las tareas pendientes organizadas por prioridad.

---

## 🎯 FASE 1: FUNCIONALIDADES CRÍTICAS Y SEGURIDAD (1-2 semanas)

### 1.1 Migrar Autenticación a httpOnly Cookies

**Tiempo estimado**: 4 horas
**Impacto**: Alto - Seguridad
**Archivos a modificar**:

#### Backend API:
- `futura-tickets-admin-api/src/Auth/auth.service.ts`
- `futura-tickets-admin-api/src/main.ts` (ya tiene cookieParser)

```typescript
// auth.service.ts - Modificar respuesta de login
async login(loginDto: LoginDto, res: Response) {
  const token = this.jwtService.sign(payload);

  // Configurar cookie httpOnly
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    domain: process.env.COOKIE_DOMAIN || undefined
  });

  return { user, message: 'Login successful' };
}
```

#### Frontend Admin:
- `futura-tickets-admin/shared/services.tsx` (eliminar `localStorage.setItem('token')`)
- `futura-tickets-admin/components/Login/Login.tsx`

```typescript
// services.tsx - Cambiar a credentials: 'include'
export async function loginAccount(loginAccount: LoginAccount) {
  const response = await fetch(`${FUTURA}/api/accounts/login`, {
    method: 'POST',
    credentials: 'include', // ✅ Enviar cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginAccount)
  });

  return await response.json(); // Sin token en response
}
```

#### Frontend Marketplace:
- `futura-market-place-v2/contexts/auth-context.tsx`
- `futura-market-place-v2/app/shared/services/services.tsx`

**Testing**:
```bash
# Verificar que cookie se establece
curl -v -X POST http://localhost:3001/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futuratickets.com","password":"admin2025"}' \
  | grep Set-Cookie

# Debe mostrar: Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict
```

---

### 1.2 Completar Features del Marketplace

**Tiempo estimado**: 12-16 horas

#### 1.2.1 Sistema de Wishlist (Backend)
**Archivos**:
- `futura-tickets-admin-api/src/Account/account.schema.ts`
- `futura-tickets-admin-api/src/Account/account.service.ts`
- `futura-tickets-admin-api/src/Account/account.controller.ts`

```typescript
// account.schema.ts - Agregar campo
@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], default: [] })
wishlist: string[];

// account.controller.ts - Nuevos endpoints
@Get('/wishlist')
async getWishlist(@Auth(UserPipeService) user: Account) {
  return this.accountService.getWishlist(user._id);
}

@Post('/wishlist/:eventId')
async addToWishlist(
  @Auth(UserPipeService) user: Account,
  @Param('eventId') eventId: string
) {
  return this.accountService.addToWishlist(user._id, eventId);
}

@Delete('/wishlist/:eventId')
async removeFromWishlist(
  @Auth(UserPipeService) user: Account,
  @Param('eventId') eventId: string
) {
  return this.accountService.removeFromWishlist(user._id, eventId);
}
```

#### 1.2.2 Sistema de Wishlist (Frontend)
**Archivos**:
- `futura-market-place-v2/contexts/wishlist-context.tsx` (nuevo)
- `futura-market-place-v2/components/event/event-card.tsx`
- `futura-market-place-v2/app/account/page.tsx`

```typescript
// wishlist-context.tsx
interface WishlistContextType {
  wishlist: string[]; // Array de event IDs
  addToWishlist: (eventId: string) => Promise<void>;
  removeFromWishlist: (eventId: string) => Promise<void>;
  isInWishlist: (eventId: string) => boolean;
}

// Persistir en backend + localStorage como cache
```

**Notificaciones Email cuando evento tiene descuento**:
```typescript
// futura-tickets-admin-api/src/CronJobs/cron-jobs.service.ts
@Cron('0 9 * * *') // Diario a las 9 AM
async checkWishlistDiscounts() {
  const eventsWithDiscounts = await this.eventService.getEventsWithActiveDiscounts();

  for (const event of eventsWithDiscounts) {
    const usersWithEventInWishlist = await this.accountService.getUsersByWishlistEvent(event._id);

    for (const user of usersWithEventInWishlist) {
      await this.mailService.sendWishlistDiscountNotification(user.email, event);
    }
  }
}
```

---

### 1.3 Habilitar Notificaciones en Tiempo Real (Socket.IO)

**Tiempo estimado**: 12 horas
**Estado Actual**: Socket.IO está implementado pero con errores
**Archivos**:

#### Backend:
- `futura-tickets-admin-api/src/Socket/socket.gateway.ts`
- `futura-tickets-admin-api/src/Socket/socket.module.ts`

**Problemas a resolver**:
1. Configurar Azure Web PubSub o alternativa (Redis Adapter)
2. Implementar reconnection logic
3. Agregar autenticación a sockets

```typescript
// socket.gateway.ts - Agregar autenticación
@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGINS.split(',') } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log(`Client connected: ${client.id} - User: ${payload.email}`);
    } catch (error) {
      console.error('Socket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Emitir eventos cuando ocurre una venta
  @SubscribeMessage('sale-created')
  handleSaleCreated(sale: Sale) {
    this.server.emit('order-created', {
      event: sale.event,
      client: sale.client,
      type: sale.type,
      price: sale.price
    });
  }
}
```

#### Frontend Admin:
- `futura-tickets-admin/components/Socket.tsx`

```typescript
// Agregar reconnection y error handling
'use client';
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

export function useAdminSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // O cookie si ya migraste

    const newSocket = io(process.env.NEXT_PUBLIC_FUTURA!, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
}
```

---

### 1.4 Implementar Health Checks Avanzados

**Tiempo estimado**: 2 horas
**Archivos**: `futura-tickets-admin-api/src/app.controller.ts`

```typescript
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @InjectConnection() private connection: Connection
  ) {}

  // Health check básico (ya existe)
  @Get('/health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }

  // Nuevo: Readiness check
  @Get('/health/ready')
  async getReadiness() {
    const checks = {
      mongodb: 'checking',
      redis: 'checking',
      stripe: 'checking'
    };

    try {
      // Check MongoDB
      const mongoState = this.connection.readyState;
      checks.mongodb = mongoState === 1 ? 'ok' : 'error';

      // Check Redis
      const redisClient = this.appService.getRedisClient();
      await redisClient.ping();
      checks.redis = 'ok';

      // Check Stripe
      const stripeConfig = this.configService.get('STRIPE_SECRET_KEY');
      checks.stripe = stripeConfig ? 'ok' : 'not_configured';

      const allOk = Object.values(checks).every(v => v === 'ok' || v === 'not_configured');

      return {
        status: allOk ? 'ready' : 'not_ready',
        checks
      };
    } catch (error) {
      return {
        status: 'not_ready',
        checks,
        error: error.message
      };
    }
  }

  // Nuevo: Liveness check
  @Get('/health/live')
  getLiveness() {
    return {
      status: 'alive',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## 🎯 FASE 2: REFACTORING Y CALIDAD (2-3 semanas)

### 2.1 Dividir Archivos Gigantes

#### 2.1.1 Refactorizar `admin-event.service.ts` (35,424 líneas)

**Tiempo estimado**: 16 horas

**Nueva estructura**:
```
futura-tickets-admin-api/src/Event/
├── admin-event.controller.ts
├── event.module.ts
├── event.schema.ts
├── services/
│   ├── event.service.ts           # Lógica core de eventos
│   ├── event-tickets.service.ts   # Gestión de tickets y lotes
│   ├── event-resale.service.ts    # Lógica de reventa
│   ├── event-analytics.service.ts # Estadísticas
│   └── event-images.service.ts    # Upload de imágenes
```

**Pasos**:
1. Crear carpeta `services/`
2. Extraer métodos relacionados a cada servicio
3. Inyectar servicios en el controller
4. Actualizar imports en otros módulos

```typescript
// event-tickets.service.ts (nuevo)
@Injectable()
export class EventTicketsService {
  constructor(@InjectModel('Event') private eventModel: Model<Event>) {}

  async createTicketLot(eventId: string, ticketLot: TicketLot) {
    // Lógica de creación de lotes de tickets
  }

  async updateTicketAvailability(eventId: string, ticketType: string, quantity: number) {
    // Actualizar disponibilidad
  }

  async getTicketsByEvent(eventId: string) {
    // Obtener todos los tickets de un evento
  }
}

// admin-event.controller.ts - Inyectar servicios
constructor(
  private eventService: EventService,
  private eventTicketsService: EventTicketsService,
  private eventResaleService: EventResaleService,
  private eventAnalyticsService: EventAnalyticsService,
  private eventImagesService: EventImagesService
) {}
```

#### 2.1.2 Dividir `services.tsx` del Admin Panel (28,142 líneas)

**Tiempo estimado**: 8 horas

**Nueva estructura**:
```
futura-tickets-admin/shared/services/
├── auth.service.ts       # Login, register, token
├── events.service.ts     # CRUD eventos
├── sales.service.ts      # Ventas, tickets
├── orders.service.ts     # Órdenes
├── payments.service.ts   # Pagos, withdrawals
├── analytics.service.ts  # Estadísticas
├── clients.service.ts    # Clientes
└── index.ts              # Exports centralizados
```

```typescript
// auth.service.ts (nuevo)
export async function loginAccount(loginAccount: LoginAccount) {
  const response = await fetch(`${FUTURA}/api/accounts/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginAccount)
  });
  return await response.json();
}

export async function checkToken() {
  const response = await fetch(`${FUTURA}/api/accounts/check-token`, {
    credentials: 'include'
  });
  return await response.json();
}

// index.ts - Re-exportar todo
export * from './auth.service';
export * from './events.service';
export * from './sales.service';
// ...
```

#### 2.1.3 Dividir `interfaces.tsx` del Admin Panel (9,690 líneas)

**Tiempo estimado**: 4 horas

**Nueva estructura**:
```
futura-tickets-admin/shared/interfaces/
├── auth.interface.ts
├── event.interface.ts
├── sale.interface.ts
├── order.interface.ts
├── payment.interface.ts
├── analytics.interface.ts
└── index.ts
```

---

### 2.2 Implementar Testing

**Tiempo estimado**: 24 horas (distribuidas en 2 semanas)

#### 2.2.1 Tests Unitarios Backend

**Frameworks**: Jest + supertest

```bash
cd futura-tickets-admin-api
npm install --save-dev @nestjs/testing supertest
```

**Prioridad de módulos a testear**:
1. **Auth Module** (auth.service.spec.ts)
2. **Event Module** (event.service.spec.ts)
3. **Sales Module** (sales.service.spec.ts)

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verify: jest.fn(() => ({ email: 'test@example.com' }))
          }
        },
        {
          provide: getModelToken('Account'),
          useValue: mockModel
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const result = await service.login({
        email: 'admin@futuratickets.com',
        password: 'admin2025'
      });

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('admin@futuratickets.com');
    });

    it('should throw error when credentials are invalid', async () => {
      await expect(
        service.login({
          email: 'invalid@example.com',
          password: 'wrong'
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

**Scripts package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register node_modules/.bin/jest --runInBand"
  }
}
```

#### 2.2.2 Tests E2E con Playwright

**Tiempo estimado**: 12 horas

```bash
cd futura-tickets-admin
npm install --save-dev @playwright/test
npx playwright install
```

**Escenarios críticos**:
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login as admin successfully', async ({ page }) => {
    await page.goto('http://localhost:3003/login');

    await page.fill('input[name="email"]', 'admin@futuratickets.com');
    await page.fill('input[name="password"]', 'admin2025');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3003/events');
    await expect(page.locator('text=Admin Panel')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3003/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});

// e2e/events.spec.ts
test.describe('Event Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login como promoter
    await page.goto('http://localhost:3003/login');
    await page.fill('input[name="email"]', 'promotor@futuratickets.com');
    await page.fill('input[name="password"]', 'promoter2025');
    await page.click('button[type="submit"]');
  });

  test('should create event successfully', async ({ page }) => {
    await page.goto('http://localhost:3003/events/create');

    // Llenar formulario
    await page.fill('input[name="name"]', 'Test Event E2E');
    await page.fill('textarea[name="description"]', 'Description of test event');
    await page.fill('input[name="capacity"]', '1000');

    // Upload imagen
    await page.setInputFiles('input[type="file"]', 'test-image.jpg');

    // Submit
    await page.click('button[type="submit"]');

    // Verificar redirección y mensaje
    await expect(page).toHaveURL(/\/events\/[a-z0-9]+/);
    await expect(page.locator('text=Event created successfully')).toBeVisible();
  });
});
```

---

### 2.3 Implementar Validación de Formularios

**Tiempo estimado**: 8 horas

**Archivos**: Todos los forms en Admin y Marketplace

```typescript
// futura-tickets-admin/components/Login/Login.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginAccount(data);
      router.push('/events');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

**Schemas de validación para otros formularios**:
```typescript
// CreateEvent schema
const createEventSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  capacity: z.number().min(1, 'Capacidad debe ser mayor a 0'),
  location: z.object({
    venue: z.string().min(1, 'Venue requerido'),
    city: z.string().min(1, 'Ciudad requerida'),
    country: z.string().min(1, 'País requerido')
  }),
  dateTime: z.object({
    launch: z.date(),
    startDate: z.date(),
    endDate: z.date()
  }).refine(data => data.startDate > data.launch, {
    message: 'Fecha de inicio debe ser posterior a fecha de lanzamiento'
  }).refine(data => data.endDate > data.startDate, {
    message: 'Fecha de fin debe ser posterior a fecha de inicio'
  }),
  tickets: z.array(z.object({
    type: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().min(1)
  })).min(1, 'Debe haber al menos un tipo de ticket')
});
```

---

## 🎯 FASE 3: PERFORMANCE Y OPTIMIZACIÓN (1-2 semanas)

### 3.1 Code Splitting en Admin Panel

**Tiempo estimado**: 4 horas

```typescript
// futura-tickets-admin/app/events/[event]/page.tsx
import { lazy, Suspense } from 'react';

const Analytics = lazy(() => import('@/components/Analytics'));
const EventDetails = lazy(() => import('@/components/Event/EventDetails'));

export default function EventPage({ params }: { params: { event: string } }) {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <EventDetails eventId={params.event} />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <Analytics eventId={params.event} />
      </Suspense>
    </div>
  );
}
```

---

### 3.2 Optimizar Imágenes con Next/Image

**Tiempo estimado**: 4 horas

```typescript
// Cambiar todos los <img> por <Image>
import Image from 'next/image';

// Antes:
<img src={event.image} alt={event.name} />

// Después:
<Image
  src={event.image}
  alt={event.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

**Configuración**:
```javascript
// next.config.ts
images: {
  domains: ['futurastorage.blob.core.windows.net'],
  formats: ['image/webp', 'image/avif']
}
```

---

### 3.3 Implementar Caché en Redis

**Tiempo estimado**: 8 horas

```typescript
// futura-tickets-admin-api/src/Event/event.service.ts
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class EventService {
  constructor(
    @InjectModel('Event') private eventModel: Model<Event>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getEvents(): Promise<Event[]> {
    const cacheKey = 'events:all';

    // Intentar obtener de cache
    const cachedEvents = await this.cacheManager.get<Event[]>(cacheKey);
    if (cachedEvents) {
      return cachedEvents;
    }

    // Si no está en cache, consultar DB
    const events = await this.eventModel.find({ status: 'LAUNCHED' }).exec();

    // Guardar en cache por 5 minutos
    await this.cacheManager.set(cacheKey, events, { ttl: 300 });

    return events;
  }

  async createEvent(createEvent: CreateEvent): Promise<Event> {
    const event = await this.eventModel.create(createEvent);

    // Invalidar cache
    await this.cacheManager.del('events:all');

    return event;
  }

  async getSalesByEvent(eventId: string): Promise<Sale[]> {
    const cacheKey = `sales:event:${eventId}`;

    const cachedSales = await this.cacheManager.get<Sale[]>(cacheKey);
    if (cachedSales) return cachedSales;

    const sales = await this.salesModel.find({ event: eventId }).exec();

    // Cache por 1 minuto (datos más dinámicos)
    await this.cacheManager.set(cacheKey, sales, { ttl: 60 });

    return sales;
  }
}
```

**Configuración Redis Cache**:
```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 300 // Default 5 minutos
    })
  ]
})
export class AppModule {}
```

---

## 🎯 FASE 4: NUEVAS FUNCIONALIDADES (3-4 semanas)

### 4.1 Sistema de Reportes (PDF/CSV)

**Tiempo estimado**: 16 horas

```bash
npm install --save jspdf jspdf-autotable
```

```typescript
// futura-tickets-admin-api/src/Analytics/analytics.controller.ts
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Controller('analytics')
export class AnalyticsController {
  @Get('/report/pdf')
  async generatePDFReport(
    @Query('eventId') eventId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response
  ) {
    const analytics = await this.analyticsService.getEventAnalytics(
      eventId,
      new Date(startDate),
      new Date(endDate)
    );

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Ventas - Futura Tickets', 14, 22);

    // Información del evento
    doc.setFontSize(12);
    doc.text(`Evento: ${analytics.event.name}`, 14, 32);
    doc.text(`Fecha: ${startDate} - ${endDate}`, 14, 40);

    // Tabla de ventas
    autoTable(doc, {
      head: [['Ticket', 'Cantidad', 'Precio', 'Total']],
      body: analytics.salesByTicketType.map(item => [
        item.type,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      ]),
      startY: 50
    });

    // Total
    doc.text(
      `Total Recaudado: $${analytics.totalRevenue.toFixed(2)}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    // Enviar PDF
    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${eventId}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  }

  @Get('/report/csv')
  async generateCSVReport(
    @Query('eventId') eventId: string,
    @Res() res: Response
  ) {
    const sales = await this.salesService.getSalesByEvent(eventId);

    const csvData = [
      ['ID', 'Cliente', 'Tipo', 'Precio', 'Estado', 'Fecha'],
      ...sales.map(sale => [
        sale._id,
        `${sale.client.name} ${sale.client.lastName}`,
        sale.type,
        sale.price.toString(),
        sale.status,
        sale.createdAt.toISOString()
      ])
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-${eventId}.csv`);
    res.send(csv);
  }
}
```

---

### 4.2 Completar Integración Blockchain

**Tiempo estimado**: 40 horas (1 semana)

**Archivos**:
- `futura-tickets-admin-api/src/Blockchain/` (nuevo módulo)
- Smart contracts en `futura-tickets-smartcontracts/`

```typescript
// blockchain.service.ts
import { ethers } from 'ethers';
import EventNFT from '../abis/EventNFT.json';

@Injectable()
export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('RPC_URL');
    const privateKey = this.configService.get('PRIVATE_KEY');

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async deployEventContract(event: Event): Promise<{ address: string; hash: string }> {
    const factory = new ethers.ContractFactory(
      EventNFT.abi,
      EventNFT.bytecode,
      this.wallet
    );

    const contract = await factory.deploy(
      event.name,
      event.capacity,
      event.dateTime.startDate.getTime() / 1000
    );

    await contract.deployed();

    return {
      address: contract.address,
      hash: contract.deployTransaction.hash
    };
  }

  async mintTicket(
    contractAddress: string,
    to: string,
    ticketId: string,
    metadata: string
  ): Promise<string> {
    const contract = new ethers.Contract(
      contractAddress,
      EventNFT.abi,
      this.wallet
    );

    const tx = await contract.mint(to, ticketId, metadata);
    await tx.wait();

    return tx.hash;
  }

  async transferTicket(
    contractAddress: string,
    from: string,
    to: string,
    tokenId: string
  ): Promise<string> {
    const contract = new ethers.Contract(
      contractAddress,
      EventNFT.abi,
      this.wallet
    );

    const tx = await contract.transferFrom(from, to, tokenId);
    await tx.wait();

    return tx.hash;
  }
}
```

**Integrar en Event Service**:
```typescript
// event.service.ts
async createEvent(createEvent: CreateEvent): Promise<Event> {
  const event = await this.eventModel.create(createEvent);

  // Si blockchain está habilitado, deploy contract
  if (createEvent.isBlockchain) {
    try {
      const { address, hash } = await this.blockchainService.deployEventContract(event);

      event.address = address;
      event.hash = hash;
      await event.save();

      this.logger.log(`Event contract deployed at ${address}`);
    } catch (error) {
      this.logger.error('Failed to deploy event contract', error);
      // Continuar sin blockchain
    }
  }

  return event;
}
```

---

### 4.3 Sistema de Notificaciones Push (PWA)

**Tiempo estimado**: 16 horas

#### Service Worker:
```typescript
// futura-market-place-v2/public/sw.js
self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/images/logo.png',
    badge: '/images/badge.png',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

#### Backend:
```bash
npm install --save web-push
```

```typescript
// notifications.service.ts
import * as webPush from 'web-push';

@Injectable()
export class NotificationsService {
  constructor() {
    webPush.setVapidDetails(
      'mailto:noreply@futuratickets.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }

  async sendPushNotification(
    subscription: PushSubscription,
    payload: {
      title: string;
      body: string;
      url: string;
    }
  ) {
    await webPush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  }

  async notifyWishlistDiscount(userId: string, event: Event) {
    const subscriptions = await this.getSubscriptionsByUser(userId);

    const payload = {
      title: '¡Descuento en tu evento favorito!',
      body: `${event.name} tiene un descuento especial`,
      url: `/events/${event.url}`
    };

    for (const subscription of subscriptions) {
      await this.sendPushNotification(subscription, payload);
    }
  }
}
```

---

## 📊 RESUMEN DE TIEMPOS

| Fase | Categoría | Tareas | Tiempo Total | Semanas |
|------|-----------|--------|--------------|---------|
| **Fase 1** | Funcionalidades Críticas y Seguridad | 4 | 30-32 horas | 1-2 |
| **Fase 2** | Refactoring y Calidad | 3 | 60 horas | 2-3 |
| **Fase 3** | Performance y Optimización | 3 | 16 horas | 1 |
| **Fase 4** | Nuevas Funcionalidades | 3 | 72 horas | 3-4 |
| **TOTAL** | | **13 tareas** | **178-180 horas** | **7-10 semanas** |

*Basado en 1 developer full-time*

---

## 🎯 SUGERENCIAS ADICIONALES

### Mejoras de Arquitectura

1. **Migración a Monorepo con pnpm workspaces**
   - Compartir dependencias comunes
   - Reducir duplicación de código
   - Build system optimizado

2. **Implementar BFF (Backend for Frontend)**
   - Admin API dedicada para Admin Panel
   - Marketplace API dedicada para Marketplace
   - Reducir overfetching

3. **GraphQL para Admin Panel**
   - Queries más eficientes
   - Subscriptions para real-time
   - Type-safe con TypeScript codegen

### Seguridad Adicional

1. **Rate Limiting por Usuario**
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests por minuto
@Post('/events')
async createEvent() {}
```

2. **CSRF Protection**
```typescript
app.use(csurf({ cookie: true }));
```

3. **Helmet.js para Security Headers**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

4. **Input Sanitization**
```bash
npm install --save class-validator class-sanitizer
```

### Observabilidad

1. **Sentry para Error Tracking**
```bash
npm install --save @sentry/node @sentry/nestjs
```

2. **Structured Logging con Pino**
```bash
npm install --save nestjs-pino pino-http
```

3. **APM con New Relic o Datadog**

4. **Distributed Tracing con OpenTelemetry**

### DevOps

1. **Docker Compose para desarrollo local**
```yaml
version: '3.8'
services:
  api:
    build: ./futura-tickets-admin-api
    ports:
      - "3001:3001"
    environment:
      - MONGO_URL=mongodb://mongo:27017/futura-prod
    depends_on:
      - mongo
      - redis

  admin:
    build: ./futura-tickets-admin
    ports:
      - "3003:3003"

  marketplace:
    build: ./futura-market-place-v2
    ports:
      - "3000:3000"

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"

  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

2. **GitHub Actions para CI/CD**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deployment script aquí
```

### Features Adicionales

1. **Sistema de Referidos**
   - Código único por usuario
   - Descuentos por referir amigos
   - Dashboard de referidos

2. **Multi-idioma (i18n)**
```bash
npm install --save next-intl
```

3. **Modo Oscuro/Claro**
```typescript
import { ThemeProvider } from 'next-themes';
```

4. **Calendario de Eventos**
```bash
npm install --save react-big-calendar
```

5. **Chat de Soporte (Intercom o similar)**

6. **Sistema de Reseñas y Ratings**
   - Usuarios pueden calificar eventos
   - Comentarios y fotos
   - Moderación de contenido

---

## ✅ CHECKLIST PARA PRODUCCIÓN

### Seguridad
- [x] CORS whitelist configurado
- [x] JWT tokens (pendiente: migrar a httpOnly cookies)
- [x] Variables de entorno validadas
- [ ] Rate limiting por ruta
- [ ] Helmet.js habilitado
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] Security audit (npm audit fix)

### Testing
- [ ] Tests unitarios >60% coverage
- [ ] Tests E2E para flujos críticos
- [ ] Load testing (k6 o Artillery)
- [ ] Security testing (OWASP ZAP)

### Performance
- [ ] Bundle size <500KB
- [ ] Images optimizadas
- [ ] Code splitting
- [ ] Caché en Redis
- [ ] CDN para assets estáticos

### Monitoring
- [x] Sentry configurado
- [x] Logs estructurados
- [x] Health checks (/health, /health/ready, /health/live)
- [x] Grafana dashboards
- [x] Alertas configuradas

### Documentación
- [x] READMEs actualizados
- [x] SETUP_GUIDE.md
- [x] DEVELOPMENT_WORKFLOW.md
- [x] API documentation (Swagger)
- [ ] Runbook de incidentes
- [x] Guías de deployment

### Backup y Recuperación
- [x] MongoDB backups automáticos (CronJob)
- [ ] Plan de disaster recovery documentado
- [ ] Tested restore procedure

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### Esta Semana (Prioridad Máxima)

1. **Migrar autenticación a httpOnly cookies** (4 horas)
2. **Implementar Wishlist backend + frontend** (8 horas)
3. **Crear primer test unitario** (auth.service.spec.ts) (2 horas)
4. **Dividir services.tsx en módulos** (8 horas)

**Total: 22 horas (~3 días de trabajo)**

### Próximas 2 Semanas

1. **Completar tests unitarios críticos** (16 horas)
2. **Implementar validación de formularios con Zod** (8 horas)
3. **Refactorizar admin-event.service.ts** (16 horas)
4. **Implementar cache en Redis** (8 horas)

**Total: 48 horas (~1.5 semanas)**

---

## 📞 CONTACTO Y SOPORTE

### Documentación Técnica
- **SETUP_GUIDE.md**: Setup completo de deployment
- **LINTING_SETUP.md**: Configuración de ESLint y Prettier
- **GIT_WORKTREES_GUIDE.md**: Guía detallada de Git Worktrees
- **DEVELOPMENT_WORKFLOW.md**: Workflow completo de desarrollo
- **ROADMAP_SIGUIENTE.md**: Roadmap detallado original

### Scripts Útiles
```bash
# Desarrollo
./scripts/quick-start.sh           # Setup inicial
./scripts/validate-deployment.sh   # Validar antes de deploy
./scripts/worktree-create.sh       # Crear Git Worktree
./scripts/worktree-cleanup.sh      # Limpiar worktrees mergeados

# Start/Stop
./start-all.sh                     # Iniciar todos los servicios
./stop-all.sh                      # Detener todos los servicios

# Kubernetes
./k8s/tests/smoke-test.sh          # Smoke tests
./k8s/tests/load-test.sh           # Load tests
```

### Health Checks
```bash
# API Health
curl http://localhost:3001/health
curl http://localhost:3001/health/ready
curl http://localhost:3001/health/info

# Swagger
open http://localhost:3001/api/docs
```

---

**Última actualización**: 16 Octubre 2025
**Versión**: 2.0.0
**Autor**: Claude Code + Equipo FuturaTickets

---

## 📝 NOTAS ADICIONALES

### Trade-offs y Decisiones

1. **Monorepo vs Multi-repo**
   - **Actual**: Monorepo con submodules
   - **Pros**: Código compartido, versioning unificado
   - **Contras**: Build times más largos
   - **Recomendación**: Considerar pnpm workspaces para optimizar

2. **Socket.IO vs Server-Sent Events**
   - **Actual**: Socket.IO
   - **Pros**: Bidireccional, robust
   - **Contras**: Más complejo, requiere Redis adapter para scale
   - **Alternativa**: SSE para notificaciones unidireccionales

3. **JWT en httpOnly Cookies vs localStorage**
   - **Recomendación**: httpOnly cookies
   - **Razón**: Más seguro contra XSS
   - **Trade-off**: Más complejo en SPA, requiere CORS credentials

4. **MongoDB vs PostgreSQL**
   - **Actual**: MongoDB
   - **Pros**: Flexible schema, bueno para eventos con estructura variable
   - **Contras**: No hay transactions complejas
   - **OK para este proyecto**: Sí, el modelo de eventos se beneficia de la flexibilidad

### Métricas de Éxito

#### Performance
- Time to First Byte (TTFB): < 200ms
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

#### Disponibilidad
- Uptime: 99.9% (< 8.7 horas downtime/año)
- Error rate: < 0.1%
- Response time p95: < 500ms

#### Negocio
- Conversion rate: > 5%
- Average order value: Tracking
- Customer retention: > 60%
- Net Promoter Score (NPS): > 50

---

**¡Proyecto en excelente forma! La infraestructura está sólida y lista para escalar. Enfócate en completar la Fase 1 y 2 en las próximas 4-5 semanas.** 🚀
