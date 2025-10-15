# Bounded Contexts - Contextos Delimitados

Los bounded contexts son límites explícitos dentro de los cuales un modelo de dominio particular es definido y aplicable.

## Contextos Identificados en FuturaTickets

### 1. Ticketing Context (Contexto de Ticketing)

**Responsabilidad**: Gestión de eventos y venta de tickets NFT.

**Entidades principales**:
- Event (Evento)
- Ticket (Entrada/NFT)
- Purchase (Compra)
- Customer (Cliente)
- Venue (Recinto)

**Servicios**:
- futura-tickets-admin-api
- futura-tickets-contracts-v2 (Smart Contracts)

**Reglas de negocio**:
- Un evento tiene capacidad limitada
- Los tickets son NFTs únicos en blockchain
- Las compras requieren pago previo
- Los tickets pueden transferirse

---

### 2. Access Control Context (Contexto de Control de Acceso)

**Responsabilidad**: Validación de entradas y control de acceso a eventos.

**Entidades principales**:
- AccessPoint (Punto de acceso)
- Validation (Validación)
- Entry (Registro de entrada)
- Scanner (Escáner)

**Servicios**:
- futura-access-api
- futura-tickets-web-access-app

**Reglas de negocio**:
- Un ticket solo puede usarse una vez
- Validación mediante QR/NFC
- Registro de fecha/hora de entrada
- Detección de tickets duplicados

---

### 3. Marketplace Context (Contexto de Mercado)

**Responsabilidad**: Mercado secundario para reventa de tickets.

**Entidades principales**:
- Listing (Publicación)
- Offer (Oferta)
- Trade (Intercambio)
- Commission (Comisión)

**Servicios**:
- futura-market-place-api
- futura-market-place-v2

**Reglas de negocio**:
- Solo tickets válidos pueden listarse
- Comisión por transacción
- Sistema de ofertas/contraofertas
- Transferencia segura en blockchain

---

### 4. Admin Context (Contexto de Administración)

**Responsabilidad**: Gestión del sistema y reportes.

**Entidades principales**:
- AdminUser (Usuario administrador)
- Role (Rol)
- Configuration (Configuración)
- Analytics (Analíticas)
- Report (Reporte)

**Servicios**:
- futura-tickets-admin
- futura-tickets-admin-api

**Reglas de negocio**:
- Control de acceso basado en roles
- Auditoría de todas las acciones
- Reportes en tiempo real
- Configuración multi-tenant

---

## Relaciones entre Contextos

```
┌─────────────────────────────────────────────────┐
│                  TICKETING                      │
│  (Eventos, Tickets, Ventas)                    │
└────────────┬───────────────────┬────────────────┘
             │                   │
             │ TicketIssued      │ TicketCreated
             ↓                   ↓
┌────────────────────┐  ┌───────────────────────┐
│  ACCESS CONTROL    │  │    MARKETPLACE        │
│  (Validaciones)    │  │    (Reventa)          │
└────────────────────┘  └───────────────────────┘
             │                   │
             │                   │
             └─────────┬─────────┘
                       │ Events
                       ↓
              ┌─────────────────┐
              │     ADMIN       │
              │   (Gestión)     │
              └─────────────────┘
```

## Comunicación entre Contextos

Los contextos se comunican mediante **eventos de dominio**:

### Eventos principales:

**Ticketing → otros contextos**:
- `TicketPurchased`: Cuando se compra un ticket
- `TicketIssued`: Cuando se emite el NFT
- `TicketTransferred`: Cuando se transfiere un ticket

**Access Control → otros contextos**:
- `TicketValidated`: Cuando se valida una entrada
- `AccessDenied`: Cuando se deniega acceso

**Marketplace → otros contextos**:
- `TicketListed`: Cuando se publica para reventa
- `TicketSold`: Cuando se vende en marketplace

**Admin → otros contextos**:
- `ConfigurationChanged`: Cambios de configuración
- `UserRoleChanged`: Cambios de permisos

## Lenguaje Ubicuo (Ubiquitous Language)

### Ticketing Context
- **Event**: Evento al que se puede asistir
- **Ticket**: Entrada digital NFT
- **Purchase**: Transacción de compra
- **Issue**: Emitir/mintear el NFT

### Access Control Context
- **Validate**: Verificar autenticidad del ticket
- **Scan**: Escanear QR/NFC
- **Entry**: Registro de entrada
- **Deny**: Rechazar acceso

### Marketplace Context
- **List**: Publicar para reventa
- **Bid**: Hacer oferta
- **Trade**: Intercambio completado
- **Commission**: Comisión de plataforma

### Admin Context
- **Manage**: Gestionar recursos
- **Configure**: Configurar sistema
- **Analyze**: Analizar datos
- **Report**: Generar reportes

---

**Nota**: Cada contexto tiene su propio modelo de datos y lógica de negocio independiente.
