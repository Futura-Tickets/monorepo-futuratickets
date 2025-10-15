# Cross-Cutting Concerns - Aspectos Transversales

Esta capa contiene **preocupaciones transversales** que afectan a todas las capas del sistema.

## Responsabilidades

- Resolución de problemas comunes
- Tracking de mejoras implementadas
- Informes y reportes
- Logging y observabilidad
- Auditoría y compliance

## Estructura

### [Troubleshooting](./troubleshooting/)
Resolución de problemas:

- Errores comunes y soluciones
- Guías de debugging
- FAQ técnico

### [Improvements](./improvements/)
Historial de mejoras:

- Mejoras completadas
- Resumen de implementaciones
- Trabajo realizado

### [Reports](./reports/)
Informes del proyecto:

- Resúmenes ejecutivos
- Análisis de despliegue
- Sesiones de trabajo
- Estado actual

## Cross-Cutting Concerns Típicos

### 1. Logging
```typescript
interface Logger {
  info(message: string, context?: object): void
  warn(message: string, context?: object): void
  error(message: string, error: Error, context?: object): void
}
```

Implementación en todas las capas:
- Domain: Eventos de dominio
- Application: Inicio/fin de casos de uso
- Infrastructure: Queries DB, llamadas externas
- Interfaces: Requests HTTP, errores de validación

### 2. Monitoring y Observabilidad

**Métricas**:
- Tiempo de respuesta de APIs
- Tasa de errores
- Throughput
- Uso de recursos

**Trazas distribuidas**:
- Request ID propagado entre servicios
- Correlation para debugging

**Dashboards**:
- Grafana para visualización
- Alertas automáticas

### 3. Auditoría

```typescript
interface AuditLog {
  userId: string
  action: string
  resource: string
  timestamp: Date
  changes: object
}
```

Auditar:
- Cambios en eventos
- Transferencias de tickets
- Acciones administrativas
- Cambios de configuración

### 4. Caching

```typescript
interface CacheManager {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  invalidate(pattern: string): Promise<void>
}
```

Estrategias:
- Cache de eventos (bajo cambio)
- Cache de tickets disponibles
- Invalidación por eventos

### 5. Rate Limiting

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests por minuto
@Controller('/api/public')
export class PublicController {
  // Endpoints públicos limitados
}
```

### 6. Error Handling Global

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error
    this.logger.error(exception)

    // Format response
    const response = this.formatError(exception)

    // Return to client
    return response
  }
}
```

### 7. Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  // ...
}))
```

### 8. CORS Configuration

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})
```

## Mejoras Continuas

El equipo mantiene un registro de mejoras en la carpeta `improvements/`:

- Refactorings realizados
- Optimizaciones de rendimiento
- Mejoras de seguridad
- Actualizaciones de dependencias

## Troubleshooting

Proceso de resolución de problemas:

1. **Identificar**: Logs, métricas, reportes de usuarios
2. **Reproducir**: Ambiente de desarrollo/staging
3. **Diagnosticar**: Debugging, profiling
4. **Resolver**: Fix + tests
5. **Documentar**: Agregar a troubleshooting docs
6. **Prevenir**: Alertas, validaciones

## Principios

- **Separation of Concerns**: No mezclar con lógica de negocio
- **Consistency**: Mismo approach en todo el sistema
- **Configurability**: Configurable sin cambiar código
- **Performance**: Mínimo overhead
- **Maintainability**: Fácil de actualizar

---

**Nota**: Estos concerns se implementan mediante decorators, middleware, y AOP.
