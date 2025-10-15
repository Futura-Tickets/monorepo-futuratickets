# Application Layer - Casos de Uso

Esta capa contiene los **casos de uso** y la **orquestación** de la lógica de negocio. Coordina el flujo entre el dominio y la infraestructura.

## Responsabilidades

- Orquestar casos de uso del sistema
- Coordinar transacciones
- Gestionar el flujo de deployment
- Coordinar workflows de desarrollo
- Ejecutar pruebas de integración

## Estructura

### [Deployment](./deployment/)
Guías y documentación de despliegue:

- Despliegue local
- Despliegue en producción
- Cloud Build
- Estado de servicios

### [Workflows](./workflows/)
Flujos de trabajo y planificación:

- Plan de sprints
- Roadmap
- Tareas prioritarias
- Desarrollo del dashboard

### [Testing](./testing/)
Estrategias y guías de testing:

- Testing con Docker
- Testing local
- Pruebas de integración

## Casos de Uso Principales

### Ticketing Context
```
- CreateEvent
- PurchaseTicket
- CancelPurchase
- IssueTicket
- TransferTicket
```

### Access Control Context
```
- ValidateTicket
- RegisterEntry
- CheckAccess
- ReportAccessDenied
```

### Marketplace Context
```
- ListTicketForSale
- MakeOffer
- AcceptOffer
- CompleteTransaction
```

### Admin Context
```
- ManageUsers
- GenerateReports
- ConfigureSystem
- ViewAnalytics
```

## Flujo de un caso de uso típico

```
1. Interface Layer recibe request
2. Application Service valida entrada
3. Domain Service ejecuta lógica de negocio
4. Repository (Infrastructure) persiste cambios
5. Event Publisher notifica a otros contextos
6. Response se devuelve a Interface Layer
```

## Principios

- **Single Responsibility**: Cada caso de uso hace una cosa
- **Transaccionalidad**: Garantiza consistencia de datos
- **Idempotencia**: Operaciones repetidas producen el mismo resultado
- **Observabilidad**: Logging y métricas en cada operación

---

**Nota**: Esta capa no contiene lógica de negocio compleja (dominio) ni detalles de infraestructura.
