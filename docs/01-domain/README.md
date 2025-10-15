# Domain Layer - Conocimiento del Negocio

Esta capa contiene el **conocimiento del dominio del negocio** de FuturaTickets. Aquí se define la arquitectura del sistema, los bounded contexts y las reglas de negocio fundamentales.

## Principios DDD aplicados

- **Ubiquitous Language**: Lenguaje común entre negocio y desarrollo
- **Bounded Contexts**: Límites claros entre diferentes contextos del sistema
- **Domain Model**: Modelo rico que encapsula lógica de negocio

## Estructura

### [Architecture](./architecture/)
Documentación de la arquitectura completa del sistema.

- Visión general del sistema
- Arquitectura de APIs
- Clasificación de repositorios y servicios

### [Bounded Contexts](./bounded-contexts/)
Definición de los contextos delimitados del sistema:

- **Ticketing**: Venta y emisión de tickets
- **Access Control**: Control de acceso y validación de entradas
- **Marketplace**: Mercado secundario de reventa
- **Admin**: Panel de administración y gestión

## Bounded Contexts Identificados

```
┌─────────────────────────────────────────────────────────┐
│                    FUTURATICKETS                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ TICKETING  │  │ACCESS CONTROL│  │  MARKETPLACE   │ │
│  │            │  │              │  │                │ │
│  │ • Events   │  │ • Validation │  │ • Resale       │ │
│  │ • Tickets  │  │ • QR Check   │  │ • Bids/Offers  │ │
│  │ • Sales    │  │ • Entry Log  │  │ • Trading      │ │
│  └────────────┘  └──────────────┘  └────────────────┘ │
│                                                          │
│                  ┌──────────────┐                       │
│                  │    ADMIN     │                       │
│                  │              │                       │
│                  │ • Users      │                       │
│                  │ • Reports    │                       │
│                  │ • Config     │                       │
│                  └──────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

## Entidades principales por contexto

### Ticketing Context
- Event (Evento)
- Ticket (Entrada)
- Purchase (Compra)
- Customer (Cliente)

### Access Control Context
- AccessPoint (Punto de acceso)
- Validation (Validación)
- Entry (Registro de entrada)

### Marketplace Context
- Listing (Publicación)
- Offer (Oferta)
- Trade (Intercambio)

### Admin Context
- User (Usuario administrador)
- Configuration (Configuración)
- Analytics (Analíticas)

## Eventos de Dominio

Los contextos se comunican mediante eventos de dominio:

- `TicketPurchased`
- `TicketValidated`
- `TicketListedForResale`
- `TicketTransferred`

---

**Nota**: Esta capa es independiente de la infraestructura y debe contener solo lógica de negocio pura.
