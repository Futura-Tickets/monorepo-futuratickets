# Interfaces Layer - Puntos de Entrada

Esta capa contiene todos los **puntos de entrada** al sistema y la **interfaz con el usuario/desarrollador**.

## Responsabilidades

- Exponer APIs REST/GraphQL
- Manejar peticiones HTTP
- Validar entrada de datos
- Formatear respuestas
- Documentar endpoints
- Guías de onboarding

## Estructura

### [Getting Started](./getting-started/)
Guías para comenzar con el proyecto:

- Quick Start
- Configuración inicial
- Setup completo

### [Development](./development/)
Guías para desarrolladores:

- Guía de contribución
- Paso a paso
- Creación de repositorios

### [API Docs](./api-docs/)
Documentación de APIs (pendiente de migrar):

- Endpoints REST
- Schemas GraphQL
- Ejemplos de uso
- Autenticación

## APIs del Sistema

### Ticketing API
```
POST   /api/events              # Crear evento
GET    /api/events/:id          # Obtener evento
POST   /api/tickets/purchase    # Comprar ticket
GET    /api/tickets/:id         # Obtener ticket
```

### Access Control API
```
POST   /api/validate/:ticketId  # Validar entrada
GET    /api/access/history      # Historial de accesos
POST   /api/access/deny         # Denegar acceso
```

### Marketplace API
```
POST   /api/marketplace/list    # Publicar ticket
GET    /api/marketplace/offers  # Ver ofertas
POST   /api/marketplace/bid     # Hacer oferta
POST   /api/marketplace/accept  # Aceptar oferta
```

### Admin API
```
GET    /api/admin/users         # Listar usuarios
POST   /api/admin/users         # Crear usuario
GET    /api/admin/analytics     # Ver analíticas
PUT    /api/admin/config        # Actualizar config
```

## Estructura de un Controller

```typescript
@Controller('/api/tickets')
export class TicketController {
  constructor(
    private purchaseTicketUseCase: PurchaseTicketUseCase
  ) {}

  @Post('/purchase')
  async purchase(@Body() dto: PurchaseTicketDto) {
    // 1. Validar entrada
    const validated = await this.validate(dto)

    // 2. Ejecutar caso de uso
    const result = await this.purchaseTicketUseCase.execute(validated)

    // 3. Formatear respuesta
    return this.toResponse(result)
  }
}
```

## Validación de Entrada

Toda entrada debe ser validada antes de llegar a la capa de aplicación:

```typescript
class PurchaseTicketDto {
  @IsUUID()
  eventId: string

  @IsEmail()
  customerEmail: string

  @Min(1)
  quantity: number

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod
}
```

## Manejo de Errores

```typescript
try {
  const result = await useCase.execute(command)
  return { success: true, data: result }
} catch (error) {
  if (error instanceof DomainError) {
    return { success: false, error: error.message }
  }
  throw error // Internal server error
}
```

## Autenticación y Autorización

### JWT Authentication
```typescript
@UseGuards(JwtAuthGuard)
@Controller('/api/admin')
export class AdminController {
  // Rutas protegidas
}
```

### Role-Based Access Control
```typescript
@Roles('admin', 'event-manager')
@UseGuards(RolesGuard)
@Put('/events/:id')
async updateEvent() {
  // Solo admin y event-manager
}
```

## Documentación OpenAPI/Swagger

Cada API debe estar documentada con Swagger:

```typescript
@ApiTags('tickets')
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@Controller('/api/tickets')
export class TicketController {
  // ...
}
```

## Principios

- **Thin Controllers**: Mínima lógica en controllers
- **DTO Validation**: Validar toda entrada
- **Error Handling**: Manejo consistente de errores
- **API Versioning**: Versionado de APIs
- **Documentation**: Documentación actualizada

---

**Nota**: Esta capa no contiene lógica de negocio, solo adaptación de requests/responses.
