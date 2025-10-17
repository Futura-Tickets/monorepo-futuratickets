# Gu\u00eda de Documentaci\u00f3n Swagger/OpenAPI - Futura Tickets Admin API

## Resumen

Este documento proporciona una gu\u00eda completa para documentar todos los endpoints del API utilizando decoradores de Swagger/OpenAPI.

## Estado Actual

\u2705 **Swagger configurado y funcionando** (`src/config/swagger.config.ts`)
\ud83d\udfe1 **Documentaci\u00f3n parcial** - Solo `AccountController` tiene documentaci\u00f3n completa
\u26a0\ufe0f **Pendiente** - 11 controllers sin documentar

## Acceso a Swagger UI

### Desarrollo Local
```
http://localhost:3000/api/docs
```

### Verificar Configuraci\u00f3n
El Swagger est\u00e1 habilitado por defecto en desarrollo (ver `main.ts:79-82`):
```typescript
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  const swaggerConfig = getSwaggerConfigForEnvironment();
  setupSwagger(app, swaggerConfig);
}
```

---

## Decoradores de Swagger

### Imports Necesarios
```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
```

### 1. @ApiTags (A nivel de Controller)

Define la categor\u00eda del controller en Swagger UI.

```typescript
@ApiTags('Events')
@Controller('events')
export class EventController {
  // ...
}
```

**Tags Recomendados:**
- `Authentication` - Autenticaci\u00f3n y login
- `Accounts` - Gesti\u00f3n de cuentas
- `Events` - Eventos
- `Orders` - \u00d3rdenes
- `Payments` - Pagos
- `Tickets` - Tickets/Sales
- `Promoters` - Promotores
- `Notifications` - Notificaciones
- `Stripe` - Integraci\u00f3n Stripe
- `Health` - Health checks

### 2. @ApiOperation

Describe el endpoint con resumen y descripci\u00f3n detallada.

```typescript
@Get('/events')
@ApiOperation({
  summary: 'Get all events',
  description: 'Retrieve a list of all events for the authenticated promoter.',
})
async getEvents() {
  // ...
}
```

### 3. @ApiBearerAuth

Indica que el endpoint requiere autenticaci\u00f3n JWT.

```typescript
@Get('/events')
@ApiBearerAuth('JWT-auth')  // ⚠️ El nombre debe ser 'JWT-auth' (configurado en swagger.config.ts)
@ApiOperation({ ... })
async getEvents(@Auth(PromoterPipeService) promoter: Account) {
  // ...
}
```

**Regla:** Si el endpoint usa `@Auth()`, DEBE tener `@ApiBearerAuth('JWT-auth')`.

### 4. @ApiResponse

Documenta las posibles respuestas HTTP.

```typescript
@Get('/events/:id')
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Event retrieved successfully.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized - Invalid or missing token.',
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Event not found.',
})
async getEventById(@Param('id') id: string) {
  // ...
}
```

**C\u00f3digos HTTP Comunes:**
- `200 OK` - Operaci\u00f3n exitosa (GET, PATCH)
- `201 CREATED` - Recurso creado (POST)
- `204 NO_CONTENT` - Eliminaci\u00f3n exitosa (DELETE)
- `400 BAD_REQUEST` - Datos inv\u00e1lidos
- `401 UNAUTHORIZED` - No autenticado
- `403 FORBIDDEN` - Sin permisos
- `404 NOT_FOUND` - Recurso no existe
- `409 CONFLICT` - Conflicto (ej. email duplicado)
- `500 INTERNAL_SERVER_ERROR` - Error del servidor

### 5. @ApiParam

Documenta par\u00e1metros de ruta (path parameters).

```typescript
@Get('/events/:eventId/sales/:saleId')
@ApiParam({
  name: 'eventId',
  description: 'Event ID',
  type: String,
  example: '507f1f77bcf86cd799439011',
})
@ApiParam({
  name: 'saleId',
  description: 'Sale/Ticket ID',
  type: String,
})
async getSale(@Param('eventId') eventId: string, @Param('saleId') saleId: string) {
  // ...
}
```

### 6. @ApiQuery

Documenta query parameters (ej. `?page=1&limit=10`).

```typescript
@Get('/events')
@ApiQuery({
  name: 'page',
  required: false,
  type: Number,
  description: 'Page number',
  example: 1,
})
@ApiQuery({
  name: 'limit',
  required: false,
  type: Number,
  description: 'Items per page',
  example: 10,
})
async getEvents(@Query('page') page?: number, @Query('limit') limit?: number) {
  // ...
}
```

### 7. @ApiBody

Documenta el body de peticiones POST/PUT/PATCH.

#### Opci\u00f3n 1: Con DTO Class (Recomendado)
```typescript
import { CreateEventDto } from './dto/create-event.dto';

@Post('/events')
@ApiBody({ type: CreateEventDto })
async createEvent(@Body() createEventDto: CreateEventDto) {
  // ...
}
```

#### Opci\u00f3n 2: Schema Manual
```typescript
@Post('/events')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Concierto Rock 2025' },
      description: { type: 'string', example: 'Gran concierto de rock...' },
      capacity: { type: 'number', example: 5000 },
      dateTime: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
    required: ['name', 'capacity', 'dateTime'],
  },
})
async createEvent(@Body('createEvent') createEvent: CreateEvent) {
  // ...
}
```

---

## Plantilla de Documentaci\u00f3n por Tipo de Endpoint

### GET Endpoint (Sin par\u00e1metros)

```typescript
@Get('/')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Get all resources',
  description: 'Retrieve a list of all resources for the authenticated user.',
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Resources retrieved successfully.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized - Invalid or missing token.',
})
async getAll(@Auth(PromoterPipeService) promoter: Account): Promise<Resource[]> {
  // ...
}
```

### GET Endpoint (Con ID)

```typescript
@Get('/:id')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Get resource by ID',
  description: 'Retrieve a specific resource by its unique identifier.',
})
@ApiParam({
  name: 'id',
  description: 'Resource ID',
  type: String,
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Resource retrieved successfully.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized - Invalid or missing token.',
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Resource not found.',
})
async getById(
  @Auth(PromoterPipeService) promoter: Account,
  @Param('id') id: string,
): Promise<Resource> {
  // ...
}
```

### POST Endpoint (Crear recurso)

```typescript
@Post('/')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Create new resource',
  description: 'Create a new resource with the provided data.',
})
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Resource Name' },
      description: { type: 'string', example: 'Description here' },
    },
    required: ['name'],
  },
})
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'Resource created successfully.',
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid input data.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized - Invalid or missing token.',
})
async create(
  @Auth(PromoterPipeService) promoter: Account,
  @Body('resource') resource: CreateResource,
): Promise<Resource> {
  // ...
}
```

### PATCH Endpoint (Actualizar)

```typescript
@Patch('/:id')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Update resource',
  description: 'Update an existing resource by ID with partial data.',
})
@ApiParam({
  name: 'id',
  description: 'Resource ID',
  type: String,
})
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
    },
  },
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Resource updated successfully.',
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Invalid input data.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized - Invalid or missing token.',
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Resource not found.',
})
async update(
  @Auth(PromoterPipeService) promoter: Account,
  @Param('id') id: string,
  @Body('resource') resource: UpdateResource,
): Promise<Resource> {
  // ...
}
```

### DELETE Endpoint

```typescript
@Delete('/:id')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Delete resource',
  description: 'Permanently delete a resource by ID.',
})
@ApiParam({
  name: 'id',
  description: 'Resource ID',
  type: String,
})
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Resource deleted successfully.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized - Invalid or missing token.',
})
@ApiResponse({
  status: HttpStatus.NOT_FOUND,
  description: 'Resource not found.',
})
async delete(
  @Auth(PromoterPipeService) promoter: Account,
  @Param('id') id: string,
): Promise<DeleteResult> {
  // ...
}
```

---

## Casos Especiales

### Endpoint P\u00fablico (Sin autenticaci\u00f3n)

```typescript
@Post('/login')
@ApiOperation({
  summary: 'User login',
  description: 'Authenticate a user with email and password.',
})
@ApiBody({ type: LoginDto })
@ApiResponse({
  status: HttpStatus.OK,
  description: 'Login successful. Returns JWT token.',
})
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Invalid credentials.',
})
async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
  // ...
}
```

**Nota:** No usar `@ApiBearerAuth()` en endpoints p\u00fablicos.

### Upload de Archivos

```typescript
@Post('/upload')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Upload image',
  description: 'Upload an image file to Azure Blob Storage.',
})
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@ApiResponse({
  status: HttpStatus.CREATED,
  description: 'Image uploaded successfully.',
})
async uploadImage(
  @Auth(PromoterPipeService) promoter: Account,
  @UploadedFile() file: Express.Multer.File,
): Promise<UploadResponse> {
  // ...
}
```

### Descarga de Archivos (CSV, PDF)

```typescript
@Get('/export/csv')
@ApiBearerAuth('JWT-auth')
@ApiOperation({
  summary: 'Export data to CSV',
  description: 'Export all data to a CSV file.',
})
@Header('Content-Type', 'text/csv')
@Header('Content-Disposition', 'attachment; filename=export.csv')
@ApiResponse({
  status: HttpStatus.OK,
  description: 'CSV file generated successfully.',
  content: {
    'text/csv': {
      schema: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
async exportCsv(@Auth(PromoterPipeService) promoter: Account) {
  // ...
  return new StreamableFile(csvStream);
}
```

---

## Controllers a Documentar

### Prioridad Alta \ud83d\udd34

1. **admin-event.controller.ts** (M\u00e1s importante)
   - CRUD completo de eventos
   - Upload de im\u00e1genes
   - Lanzamiento de eventos
   - ~20 endpoints

2. **orders.controller.ts**
   - Gesti\u00f3n de \u00f3rdenes
   - Procesamiento de pagos
   - ~8 endpoints

3. **sales.controller.ts**
   - Gesti\u00f3n de tickets
   - Transferencias
   - Reventa
   - ~10 endpoints

### Prioridad Media \ud83d\udfe1

4. **stripe.controller.ts**
   - Webhooks de Stripe
   - Configuraci\u00f3n
   - ~5 endpoints

5. **payments.controller.ts**
   - M\u00e9todos de pago
   - Solicitudes de pago
   - ~6 endpoints

6. **promoter.controller.ts**
   - Gesti\u00f3n de promotores
   - ~4 endpoints

### Prioridad Baja \ud83d\udfe2

7. **user-event.controller.ts**
   - Endpoints p\u00fablicos de eventos
   - ~5 endpoints

8. **notifications.controller.ts**
   - Sistema de notificaciones
   - ~4 endpoints

9. **health-check.controller.ts**
   - Health checks
   - ~2 endpoints

10. **admin-orders.controller.ts**
    - Admin de \u00f3rdenes
    - ~3 endpoints

11. **payment-methods.controller.ts**
    - M\u00e9todos de pago
    - ~4 endpoints

---

## Verificaci\u00f3n y Testing

### 1. Verificar en Swagger UI

Despu\u00e9s de documentar un controller:

1. Reiniciar el servidor: `npm run start:dev`
2. Abrir: http://localhost:3000/api/docs
3. Verificar que:
   - El tag aparece en el sidebar
   - Todos los endpoints est\u00e1n listados
   - Los decoradores `@ApiBearerAuth()` muestran el candado \ud83d\udd12
   - Al expandir un endpoint, se ve la descripci\u00f3n completa
   - Los ejemplos de body/params son correctos

### 2. Probar Autenticaci\u00f3n

1. Click en "Authorize" (arriba a la derecha)
2. Ingresar token JWT: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click en "Authorize"
4. Todos los endpoints con \ud83d\udd12 ahora incluir\u00e1n el token

### 3. Probar Endpoints

1. Expandir un endpoint
2. Click en "Try it out"
3. Llenar par\u00e1metros
4. Click en "Execute"
5. Verificar respuesta

### 4. Exportar OpenAPI Spec

El spec JSON se exporta autom\u00e1ticamente en desarrollo:
```
./swagger-spec.json
```

Usar este archivo para:
- Generaci\u00f3n de cliente (SDK)
- Postman import
- Testing automatizado

---

## Buenas Pr\u00e1cticas

### ✅ DO

- **Documentar TODOS los endpoints**, incluso los simples
- **Usar ejemplos realistas** en `@ApiBody` y `@ApiParam`
- **Incluir TODAS las respuestas posibles** (`200`, `400`, `401`, `404`, etc.)
- **Agregar `@ApiBearerAuth('JWT-auth')`** en endpoints autenticados
- **Describir claramente** qu\u00e9 hace cada endpoint
- **Usar DTOs** cuando sea posible (en lugar de schemas manuales)
- **Mantener consistencia** en los mensajes de respuesta

### \u274c DON'T

- **No omitir endpoints** "simples" - todo debe estar documentado
- **No usar descripciones gen\u00e9ricas** como "Get data" - ser espec\u00edfico
- **No olvidar los `@ApiResponse`** - incluir al menos 2-3 c\u00f3digos de estado
- **No usar nombres de tags inconsistentes** - seguir la lista recomendada
- **No documentar endpoints deprecados** sin marcarlos como `deprecated: true`

---

## Ejemplo Completo: EventController

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { Auth } from 'src/Auth/auth.decorator';
import { PromoterPipeService } from 'src/Account/account.service';
import { Account } from 'src/Account/account.interface';
import { EventService } from './event.service';
import { CreateEvent, Event } from './event.interface';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get('/')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all events',
    description: 'Retrieve a list of all events for the authenticated promoter.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Events retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async getEvents(@Auth(PromoterPipeService) promoter: Account): Promise<Event[]> {
    return await this.eventService.getEvents(promoter.promoter!);
  }

  @Get('/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Retrieve a specific event by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found.',
  })
  async getEventById(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<Event> {
    return await this.eventService.getEventById(promoter.promoter!, id);
  }

  @Post('/')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new event',
    description: 'Create a new event with the provided data.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        createEvent: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Concierto Rock 2025' },
            description: { type: 'string', example: 'Gran concierto de rock...' },
            capacity: { type: 'number', example: 5000 },
            dateTime: {
              type: 'object',
              properties: {
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
              },
            },
          },
          required: ['name', 'capacity', 'dateTime'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async createEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Body('createEvent') createEvent: CreateEvent,
  ): Promise<Event> {
    return await this.eventService.createEvent(promoter.promoter!, createEvent);
  }

  @Delete('/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete event',
    description: 'Permanently delete an event by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found.',
  })
  async deleteEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<void> {
    await this.eventService.deleteEvent(promoter.promoter!, id);
  }
}
```

---

## Recursos Adicionales

### Documentaci\u00f3n Oficial
- [NestJS Swagger/OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [Swagger Decorators](https://docs.nestjs.com/openapi/decorators)
- [OpenAPI Specification](https://swagger.io/specification/)

### Configuraci\u00f3n Local
- **Swagger Config**: `src/config/swagger.config.ts`
- **Main Bootstrap**: `src/main.ts:79-82`
- **Swagger UI**: http://localhost:3000/api/docs

### Comandos \u00datiles
```bash
# Desarrollo con hot-reload
npm run start:dev

# Ver logs de compilaci\u00f3n
# El Swagger se regenera autom\u00e1ticamente

# Exportar spec JSON
# Se genera autom\u00e1ticamente en ./swagger-spec.json
```

---

## Checklist de Documentaci\u00f3n

Antes de considerar un controller "documentado":

- [ ] `@ApiTags()` agregado al controller
- [ ] TODOS los endpoints tienen `@ApiOperation()`
- [ ] Endpoints autenticados tienen `@ApiBearerAuth('JWT-auth')`
- [ ] Par\u00e1metros de ruta tienen `@ApiParam()`
- [ ] Query parameters tienen `@ApiQuery()`
- [ ] Body requests tienen `@ApiBody()`
- [ ] Todas las respuestas posibles tienen `@ApiResponse()`
- [ ] Ejemplos son realistas y correctos
- [ ] Probado en Swagger UI (http://localhost:3000/api/docs)
- [ ] Sin errores de compilaci\u00f3n TypeScript

---

**\u00daltima actualizaci\u00f3n:** 2025-10-14
**Estado:** \ud83d\udfe1 En progreso (AccountController completo, 11 pendientes)
**Prioridad:** Alta - Documentaci\u00f3n de API es cr\u00edtica para desarrollo frontend y testing
