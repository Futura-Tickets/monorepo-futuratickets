# Infrastructure Layer - Infraestructura Técnica

Esta capa contiene todos los **detalles técnicos** e **implementaciones concretas** de infraestructura que soportan el sistema.

## Responsabilidades

- Implementación de repositorios (base de datos)
- Configuración de servicios externos
- Gestión de contenedores
- CI/CD y automatización
- Seguridad y credenciales
- Herramientas de desarrollo

## Estructura

### [Docker](./docker/)
Configuración de Docker y contenedores:

- Docker Compose
- Dockerfiles
- Orquestación local

### [GitHub CI/CD](./github-cicd/)
Integración continua y despliegue:

- GitHub Actions workflows
- Secretos y configuración
- Automatización de push

### [Environment](./environment/)
Variables de entorno y configuración:

- Setup de entornos
- Credenciales de acceso
- Configuración de servicios

### [Security](./security/)
Políticas y prácticas de seguridad:

- Política de seguridad
- Guías de correcciones
- Best practices

### [Tooling](./tooling/)
Herramientas y utilidades:

- MCP Configuration
- Warp terminal
- Developer tools

## Tecnologías principales

### Base de datos
- **MongoDB**: Base de datos principal
- **PostgreSQL**: Base de datos relacional (si aplica)

### Messaging
- **RabbitMQ/Kafka**: Message broker para eventos

### Blockchain
- **Ethereum/Polygon**: Smart contracts para NFT tickets

### Cloud
- **Google Cloud Platform**: Hosting y servicios
- **Cloud Build**: CI/CD
- **Cloud Run**: Serverless containers

### Contenedores
- **Docker**: Containerización
- **Docker Compose**: Orquestación local

## Patrones de Infraestructura

### Repository Pattern
```typescript
interface TicketRepository {
  save(ticket: Ticket): Promise<void>
  findById(id: string): Promise<Ticket | null>
  findByEvent(eventId: string): Promise<Ticket[]>
}
```

### Event Publishing
```typescript
interface EventPublisher {
  publish(event: DomainEvent): Promise<void>
  subscribe(eventType: string, handler: EventHandler): void
}
```

### External Services
```typescript
interface PaymentGateway {
  processPayment(amount: Money, method: PaymentMethod): Promise<PaymentResult>
}
```

## Configuración por Ambiente

### Development
- Docker Compose local
- Variables `.env.development`
- Mocks de servicios externos

### Staging
- Cloud Run
- Base de datos de prueba
- Servicios reales

### Production
- Cloud Run con auto-scaling
- Base de datos de producción
- Monitoring y alertas

## Principios

- **Dependency Inversion**: Infraestructura depende del dominio, no al revés
- **Configuración externa**: Todo configurable por variables de entorno
- **Fail-fast**: Validación temprana de configuración
- **Observability**: Logs, métricas y trazas distribuidas

---

**Nota**: Esta capa implementa las interfaces (ports) definidas en el dominio.
