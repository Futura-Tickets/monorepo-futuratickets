# Plan de Refactorizaci\u00f3n - admin-event.service.ts

**Archivo:** `src/Event/admin-event.service.ts`
**L\u00edneas actuales:** 1,243
**M\u00e9todos:** ~30
**Estado:** \u26a0\ufe0f Refactorizaci\u00f3n recomendada

---

## An\u00e1lisis del Archivo

### Responsabilidades Actuales
El `AdminEventService` actualmente maneja:

1. \u2705 **CRUD de Eventos** (getEvents, createEvent, editEvent, deleteEvent)
2. \u2705 **Blockchain Operations** (createNftEvent, createNftTicket, transferNftTicket)
3. \u2705 **Order Processing** (createOrder, handleStripeEvent)
4. \u2705 **Ticket Management** (mintTicket, transferResaleTicket)
5. \u2705 **Invitations** (createInvitation, getInvitationsByEventId)
6. \u2705 **Access Control** (checkAccessEvent, getAccessEvent, getAttendantsEvent)
7. \u2705 **Resale** (getResaleEvent, updateResaleEvent)
8. \u2705 **Queue Management** (addMintTicketQueue, addTransferResaleTicketQueue, etc.)
9. \u2705 **QR Code Generation** (generateTicketQrCode)
10. \u2705 **Socket Emissions** (emitAccess)

### Problemas Identificados

\u274c **Violaci\u00f3n del Single Responsibility Principle**
- El servicio tiene demasiadas responsabilidades
- Mezcla l\u00f3gica de negocio con operaciones blockchain
- Combina procesamiento de \u00f3rdenes con gesti\u00f3n de eventos

\u274c **Alta Complejidad Ciclo m\u00e1tica**
- M\u00e9todos muy largos (createOrder: ~90 l\u00edneas)
- L\u00f3gica anidada compleja (transferResaleTicket: ~170 l\u00edneas)
- Switch statements largos (checkAccessEvent: ~190 l\u00edneas)

\u274c **Acoplamiento Alto**
- Depende de 10+ servicios inyectados
- Dif\u00edcil de probar unitariamente
- Cambios en un servicio afectan m\u00faltiples funcionalidades

\u274c **Duplicaci\u00f3n de C\u00f3digo**
- L\u00f3gica de poblado de Mongoose repetida
- Patrones de actualizaci\u00f3n de historial repetidos
- Validaciones similares en m\u00faltiples m\u00e9todos

---

## Estrategia de Refactorizaci\u00f3n

### Fase 1: Extraer Servicios Espec\u00edficos \ud83d\udd34

#### 1.1 EventBlockchainService
**Responsabilidad:** Operaciones blockchain relacionadas con eventos

**M\u00e9todos a mover:**
- `createNftEvent()` - Crear evento NFT en blockchain
- `createNftTicket()` - Mintear ticket NFT
- `transferNftTicket()` - Transferir ticket NFT
- `mintTicket()` - Procesar minteo completo
- `transferResaleTicket()` - Procesar transferencia completa

**Dependencias:**
- AbstractionService
- ProviderService
- AccountService
- PromoterService
- SalesService

**Beneficios:**
- \u2705 Separa l\u00f3gica blockchain de l\u00f3gica de eventos
- \u2705 F\u00e1cil de testear sin blockchain real
- \u2705 Reutilizable en otros servicios

#### 1.2 EventOrderService
**Responsabilidad:** Procesamiento de \u00f3rdenes relacionadas con eventos

**M\u00e9todos a mover:**
- `createOrder()` - Procesar orden de pago
- `handleStripeEvent()` - Manejar webhooks de Stripe

**Dependencias:**
- OrdersService
- SalesService
- MailService
- NotificationService
- SocketService
- EventQueueService (nuevo)

**Beneficios:**
- \u2705 Aislamiento de l\u00f3gica de procesamiento de pagos
- \u2705 Mejor manejo de errores en pagos
- \u2705 F\u00e1cil de extender con nuevos m\u00e9todos de pago

#### 1.3 EventQueueService
**Responsabilidad:** Gesti\u00f3n de colas de jobs

**M\u00e9todos a mover:**
- `addMintTicketQueue()` - Cola de minteo
- `addTransferResaleTicketQueue()` - Cola de transferencias
- `addInvitationTicketQueue()` - Cola de invitaciones
- `addCreateOrderQueue()` - Cola de \u00f3rdenes

**Dependencias:**
- Bull Queues (inyectadas)

**Beneficios:**
- \u2705 Centralizaci\u00f3n de l\u00f3gica de colas
- \u2705 F\u00e1cil monitoreo de jobs
- \u2705 Reutilizable en otros m\u00f3dulos

#### 1.4 EventInvitationService
**Responsabilidad:** Gesti\u00f3n de invitaciones

**M\u00e9todos a mover:**
- `createInvitation()` - Crear invitaci\u00f3n
- `getInvitationsByEventId()` - Obtener invitaciones

**Dependencias:**
- AccountService
- OrdersService
- SalesService
- MailService
- EventQueueService
- SocketService

**Beneficios:**
- \u2705 L\u00f3gica de invitaciones aislada
- \u2705 F\u00e1cil de extender (ej. invitaciones m\u00faltiples)
- \u2705 Mejor testing

#### 1.5 EventAccessService
**Responsabilidad:** Control de acceso a eventos

**M\u00e9todos a mover:**
- `checkAccessEvent()` - Validar acceso
- `getAccessEvent()` - Obtener evento para acceso
- `getAttendantsEvent()` - Obtener asistentes
- `emitAccess()` - Emitir evento de acceso

**Dependencias:**
- SalesService
- SocketService

**Beneficios:**
- \u2705 L\u00f3gica de control de acceso clara
- \u2705 F\u00e1cil de testear validaciones
- \u2705 Reutilizable en Access API

#### 1.6 EventResaleService
**Responsabilidad:** Gesti\u00f3n de reventa de tickets

**M\u00e9todos a mover:**
- `getResaleEvent()` - Obtener evento con tickets en venta
- `updateResaleEvent()` - Actualizar estado de reventa

**Dependencias:**
- EventModel (compartido)
- SalesService

**Beneficios:**
- \u2705 L\u00f3gica de reventa aislada
- \u2705 F\u00e1cil agregar nuevas features de resale
- \u2705 Mejor testing

---

### Fase 2: Extraer Utilidades Comunes \ud83d\udfe1

#### 2.1 EventQueryBuilder
**Responsabilidad:** Construir queries complejas de Mongoose

**M\u00e9todos:**
- `buildEventWithOrdersQuery()` - Query est\u00e1ndar con populate
- `buildAccessEventQuery()` - Query para eventos de acceso
- `buildResaleEventQuery()` - Query para eventos con reventa
- `buildAttendantsQuery()` - Query para asistentes

**Beneficios:**
- \u2705 Elimina duplicaci\u00f3n de l\u00f3gica de populate
- \u2705 Queries reutilizables
- \u2705 F\u00e1cil de modificar estructura de queries

#### 2.2 TicketHistoryBuilder
**Responsabilidad:** Construir historial de tickets

**M\u00e9todos:**
- `addProcessingHistory()` - Agregar historial de procesamiento
- `addGrantedHistory()` - Agregar historial de acceso concedido
- `addDeniedHistory()` - Agregar historial de acceso denegado
- `addTransferHistory()` - Agregar historial de transferencia

**Beneficios:**
- \u2705 Elimina duplicaci\u00f3n de construcci\u00f3n de historial
- \u2705 Historial consistente
- \u2705 F\u00e1cil de extender

#### 2.3 QrCodeGenerator
**Responsabilidad:** Generaci\u00f3n de c\u00f3digos QR

**M\u00e9todos:**
- `generateTicketQr()` - Generar QR para ticket
- `generateEventQr()` - Generar QR para evento

**Beneficios:**
- \u2705 Servicio reutilizable
- \u2705 F\u00e1cil cambiar librer\u00eda de QR
- \u2705 Cach\u00e9 de QR codes

---

### Fase 3: Refactorizar M\u00e9todos Largos \ud83d\udfe1

#### 3.1 createOrder()
**L\u00edneas:** ~90
**Complejidad:** Alta

**Refactorizaci\u00f3n:**
```typescript
// ANTES: Un m\u00e9todo monol\u00edtico de 90 l\u00edneas

// DESPU\u00c9S: M\u00faltiples m\u00e9todos peque\u00f1os
public async createOrder(paymentId: string): Promise<EmitOrder | void> {
  const orders = await this.findOrdersByPaymentId(paymentId);
  if (!orders.length) return;

  for (const order of orders) {
    await this.processOrder(order);
  }
}

private async processOrder(order: Order): Promise<void> {
  const tickets = await this.createTicketsForOrder(order);
  await this.queueTicketJobs(tickets);
  await this.finalizeOrder(order);
  await this.notifyOrderCreated(order);
}

private async createTicketsForOrder(order: Order): Promise<CreatedTicket[]> {
  // L\u00f3gica de creaci\u00f3n de tickets
}

private async queueTicketJobs(tickets: CreatedTicket[]): Promise<void> {
  // L\u00f3gica de colas
}

private async finalizeOrder(order: Order): Promise<void> {
  // Actualizaci\u00f3n de estado y env\u00edo de email
}

private async notifyOrderCreated(order: Order): Promise<void> {
  // Notificaciones y socket
}
```

**Beneficios:**
- \u2705 M\u00e9todos < 20 l\u00edneas cada uno
- \u2705 F\u00e1cil de testear individualmente
- \u2705 M\u00e1s legible y mantenible

#### 3.2 checkAccessEvent()
**L\u00edneas:** ~190
**Complejidad:** Muy Alta

**Refactorizaci\u00f3n:**
```typescript
// ANTES: Switch statement de 190 l\u00edneas con duplicaci\u00f3n

// DESPU\u00c9S: Pattern Strategy
public async checkAccessEvent(
  accessAccount: Account,
  sale: string,
): Promise<AccessResult> {
  const saleFound = await this.findSaleOrDeny(accessAccount.promoter!, sale);
  if (!saleFound) return this.denyAccess('TICKET NOT FOUND');

  const accessHandler = this.getAccessHandler(saleFound.status);
  return await accessHandler.handle(saleFound, accessAccount);
}

private getAccessHandler(status: TicketStatus): AccessHandler {
  const handlers = {
    [TicketStatus.OPEN]: new GrantAccessHandler(this.salesService, this.socketService),
    [TicketStatus.CLOSED]: new DenyUsedTicketHandler(this.salesService, this.socketService),
    [TicketStatus.SALE]: new DenySaleTicketHandler(this.salesService, this.socketService),
    [TicketStatus.EXPIRED]: new DenyExpiredTicketHandler(this.salesService, this.socketService),
    [TicketStatus.PROCESSING]: new DenyProcessingTicketHandler(this.salesService, this.socketService),
  };

  return handlers[status] || new DenyDefaultHandler();
}
```

**Beneficios:**
- \u2705 Elimina switch statement largo
- \u2705 Cada handler es testeable independientemente
- \u2705 F\u00e1cil agregar nuevos estados
- \u2705 Elimina duplicaci\u00f3n de c\u00f3digo

---

## Estructura Final Propuesta

```
src/Event/
├── admin-event.service.ts (150-200 l\u00edneas - solo CRUD b\u00e1sico)
│
├── blockchain/
│   ├── event-blockchain.service.ts
│   └── event-blockchain.module.ts
│
├── orders/
│   ├── event-order.service.ts
│   └── event-order.module.ts
│
├── queues/
│   ├── event-queue.service.ts
│   └── event-queue.module.ts
│
├── invitations/
│   ├── event-invitation.service.ts
│   └── event-invitation.module.ts
│
├── access/
│   ├── event-access.service.ts
│   ├── handlers/
│   │   ├── access-handler.interface.ts
│   │   ├── grant-access.handler.ts
│   │   ├── deny-used-ticket.handler.ts
│   │   ├── deny-sale-ticket.handler.ts
│   │   ├── deny-expired-ticket.handler.ts
│   │   └── deny-processing-ticket.handler.ts
│   └── event-access.module.ts
│
├── resale/
│   ├── event-resale.service.ts
│   └── event-resale.module.ts
│
└── utils/
    ├── event-query-builder.service.ts
    ├── ticket-history-builder.service.ts
    └── qr-code-generator.service.ts
```

---

## Plan de Ejecuci\u00f3n

### Semana 1: Preparaci\u00f3n \ud83d\udfe2
- [ ] Crear tests E2E para flujos cr\u00edticos existentes
- [ ] Documentar comportamiento actual de todos los m\u00e9todos
- [ ] Crear m\u00e9tricas de baseline (tiempo de respuesta, cobertura)
- [ ] Setup branch de refactoring

### Semana 2: Extraer Utilidades \ud83d\udfe2
- [ ] Crear EventQueryBuilder
- [ ] Crear TicketHistoryBuilder
- [ ] Crear QrCodeGenerator
- [ ] Migrar m\u00e9todos a usar utilidades
- [ ] Tests unitarios para utilidades

### Semana 3: Extraer EventQueueService \ud83d\udfe1
- [ ] Crear EventQueueService
- [ ] Migrar m\u00e9todos de cola
- [ ] Actualizar AdminEventService para usar nuevo servicio
- [ ] Tests unitarios

### Semana 4: Extraer EventAccessService \ud83d\udfe1
- [ ] Crear EventAccessService
- [ ] Implementar Strategy Pattern para handlers
- [ ] Refactorizar checkAccessEvent()
- [ ] Tests unitarios para cada handler

### Semana 5: Extraer EventOrderService \ud83d\udfe1
- [ ] Crear EventOrderService
- [ ] Refactorizar createOrder() en m\u00e9todos peque\u00f1os
- [ ] Migrar handleStripeEvent()
- [ ] Tests unitarios

### Semana 6: Extraer Servicios Restantes \ud83d\udfe1
- [ ] Crear EventBlockchainService
- [ ] Crear EventInvitationService
- [ ] Crear EventResaleService
- [ ] Tests unitarios para cada servicio

### Semana 7: Integraci\u00f3n y Testing \ud83d\udd34
- [ ] Actualizar m\u00f3dulos
- [ ] Tests E2E completos
- [ ] Performance testing
- [ ] Comparar m\u00e9tricas con baseline

### Semana 8: Deployment y Monitoreo \ud83d\udd34
- [ ] Code review completo
- [ ] Deploy a staging
- [ ] Monitoreo de errores y performance
- [ ] Deploy a producci\u00f3n

---

## M\u00e9tricas de \u00c9xito

### Antes de Refactorizaci\u00f3n
- **L\u00edneas:** 1,243
- **M\u00e9todos:** ~30
- **Complejidad ciclo m\u00e1tica:** Alta (>20 en varios m\u00e9todos)
- **Dependencias:** 10+ servicios
- **Test Coverage:** ~30% (estimado)
- **M\u00e9todo m\u00e1s largo:** ~190 l\u00edneas

### Objetivo Post-Refactorizaci\u00f3n
- **L\u00edneas AdminEventService:** < 200
- **M\u00e9todos por servicio:** < 10
- **Complejidad ciclo m\u00e1tica:** < 10 por m\u00e9todo
- **Dependencias por servicio:** < 5
- **Test Coverage:** > 80%
- **M\u00e9todo m\u00e1s largo:** < 30 l\u00edneas

---

## Riesgos y Mitigaciones

### Riesgo 1: Breaking Changes
**Mitigaci\u00f3n:**
- Mantener tests E2E pasando en todo momento
- Refactorizar incrementalmente
- Feature flags para nuevos servicios

### Riesgo 2: Performance Degradation
**Mitigaci\u00f3n:**
- Establecer baseline de performance
- Performance testing continuo
- Monitoreo de APM en producci\u00f3n

### Riesgo 3: Bugs Introducidos
**Mitigaci\u00f3n:**
- Tests E2E completos antes de empezar
- Code review riguroso
- Deploy gradual (staging \u2192 producci\u00f3n)

### Riesgo 4: Tiempo de Desarrollo Extendido
**Mitigaci\u00f3n:**
- Plan de 8 semanas realista
- Priorizar servicios m\u00e1s cr\u00edticos primero
- Permitir trabajo incremental

---

## Estado Actual

\u2705 **Plan documentado**
\u26a0\ufe0f **No iniciado** - Requiere aprobaci\u00f3n y recursos

### Pr\u00f3ximos Pasos Inmediatos

1. **Revisi\u00f3n del plan** con el equipo
2. **Aprobaci\u00f3n** de tiempo y recursos
3. **Setup de tests E2E** como baseline
4. **Creaci\u00f3n de branch** de refactoring
5. **Inicio de Fase 1**

---

## Alternativa: Refactorizaci\u00f3n Incremental (Plan B)

Si no hay tiempo para refactorizaci\u00f3n completa, hacer mejoras incrementales:

### Mes 1
- \u2705 Extraer EventQueryBuilder
- \u2705 Extraer TicketHistoryBuilder
- \u2705 Refactorizar m\u00e9todo m\u00e1s largo (checkAccessEvent)

### Mes 2
- \u2705 Extraer EventAccessService
- \u2705 Tests unitarios para acceso

### Mes 3
- \u2705 Extraer EventOrderService
- \u2705 Tests para procesamiento de \u00f3rdenes

### Mes 4+
- Continuar extrayendo servicios seg\u00fan prioridad
- Mantener test coverage > 70%

---

**\u00daltima actualizaci\u00f3n:** 2025-10-14
**Estado:** \ud83d\udcdd Plan documentado - Pendiente de aprobaci\u00f3n
**Tiempo estimado:** 8 semanas (completo) o 4 meses (incremental)
