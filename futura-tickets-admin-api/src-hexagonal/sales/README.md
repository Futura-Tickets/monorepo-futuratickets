# Sales Module - Hexagonal Architecture

Módulo de Ventas (Tickets) refactorizado con arquitectura hexagonal (Ports & Adapters) y DDD.

## 📐 Estructura

```
sales/
├── domain/                           # DOMAIN LAYER
│   ├── entities/
│   │   └── Sale.ts                   # Aggregate Root
│   ├── value-objects/
│   │   ├── SaleId.ts
│   │   ├── Money.ts
│   │   ├── TicketStatus.ts
│   │   ├── QRCode.ts
│   │   ├── Resale.ts
│   │   ├── Transfer.ts
│   │   └── SaleHistory.ts
│   ├── repositories/
│   │   └── ISalesRepository.ts       # Port (Interface)
│   └── services/
│       ├── IBlockchainService.ts     # Port (Interface)
│       └── IQRCodeService.ts         # Port (Interface)
│
├── application/                      # APPLICATION LAYER
│   └── use-cases/
│       ├── GetSaleByIdUseCase.ts
│       ├── PutSaleForResaleUseCase.ts
│       ├── ValidateTicketEntryUseCase.ts
│       └── CreateSalesForOrderUseCase.ts
│
├── infrastructure/                   # INFRASTRUCTURE LAYER
│   ├── persistence/
│   │   ├── SalesMongoRepository.ts   # Adapter (MongoDB)
│   │   └── sales.schema.ts
│   ├── blockchain/
│   │   └── BlockchainAdapter.ts      # Adapter (Ethers/Viem)
│   └── qrcode/
│       └── QRCodeAdapter.ts          # Adapter (qrcode lib)
│
├── interfaces/                       # INTERFACES LAYER
│   ├── controllers/
│   │   └── SalesController.ts        # HTTP Adapter
│   └── dto/
│       ├── PutForResaleDto.ts
│       └── ValidateTicketDto.ts
│
├── sales-hexagonal.module.ts         # NestJS Module
└── README.md                         # This file
```

---

## 🎯 Capas y Responsabilidades

### 1. Domain Layer (Corazón del sistema)

**Responsabilidad**: Contiene la lógica de negocio pura.

**Componentes**:
- **Entities**: `Sale` (Aggregate Root)
  - Factory methods: `create()`, `fromPersistence()`
  - Business logic: `putForResale()`, `validateEntry()`, `transferTo()`
  - Business rules: `canBeResold()`, `canBeTransferred()`

- **Value Objects**: Conceptos inmutables
  - `SaleId`: Identificador único
  - `Money`: Manejo de cantidades monetarias
  - `TicketStatus`, `TicketActivity`: Estados
  - `QRCode`, `Resale`, `Transfer`, `SaleHistory`

- **Repository Interfaces (Ports)**: Contratos para persistencia
  - `ISalesRepository`: Define métodos sin implementación

- **Service Interfaces (Ports)**: Contratos para servicios externos
  - `IBlockchainService`: Operaciones blockchain
  - `IQRCodeService`: Generación de QR codes

**Principios**:
- ✅ Sin dependencias de frameworks (NestJS, MongoDB, etc.)
- ✅ Lógica de negocio encapsulada
- ✅ Invariantes protegidos
- ✅ Testeable sin mocks complejos

---

### 2. Application Layer (Casos de Uso)

**Responsabilidad**: Orquestar flujos de negocio.

**Use Cases**:
- `GetSaleByIdUseCase`: Obtener venta por ID
- `PutSaleForResaleUseCase`: Poner ticket en reventa (incluye blockchain)
- `ValidateTicketEntryUseCase`: Validar entrada (access control)
- `CreateSalesForOrderUseCase`: Crear tickets para una orden

**Flujo típico**:
```typescript
1. Validar entrada (DTOs)
2. Obtener entidad del repositorio
3. Aplicar lógica de dominio
4. Llamar servicios externos si es necesario
5. Persistir cambios
6. Retornar resultado
```

**Principios**:
- ✅ Thin layer: No lógica de negocio compleja
- ✅ Orquestación de dominio + infraestructura
- ✅ Transaccional

---

### 3. Infrastructure Layer (Adaptadores de Salida)

**Responsabilidad**: Implementar detalles técnicos.

**Adapters**:

#### `SalesMongoRepository` (Persistence)
- Implementa `ISalesRepository`
- Mapea entre entidades de dominio y documentos MongoDB
- Maneja populate de relaciones

#### `BlockchainAdapter`
- Implementa `IBlockchainService`
- Usa `ethers` y `viem` para interactuar con smart contracts
- Oculta detalles de blockchain al dominio

#### `QRCodeAdapter`
- Implementa `IQRCodeService`
- Usa librería `qrcode` para generar códigos QR
- Retorna data URL (base64)

**Principios**:
- ✅ Dependency Inversion: Implementa interfaces del dominio
- ✅ Swappable: Fácil cambiar MongoDB por PostgreSQL
- ✅ Isolatable: Se puede mockear fácilmente en tests

---

### 4. Interfaces Layer (Adaptadores de Entrada)

**Responsabilidad**: Recibir peticiones externas.

**Components**:

#### `SalesController`
- Recibe peticiones HTTP
- Valida DTOs con `class-validator`
- Llama use cases
- Formatea respuestas

#### DTOs
- `PutForResaleDto`: Validación de datos de reventa
- `ValidateTicketDto`: Validación de ticket

**Endpoints**:
- `GET /api/sales/:id` - Obtener venta
- `PATCH /api/sales/:id/resale` - Poner en reventa
- `POST /api/sales/:id/validate` - Validar entrada

**Principios**:
- ✅ Thin controllers: Delegación a use cases
- ✅ Validación en la entrada
- ✅ Error handling consistente

---

## 🔌 Ports & Adapters

### Ports (Interfaces)

| Port | Layer | Purpose |
|------|-------|---------|
| `ISalesRepository` | Domain | Persistencia |
| `IBlockchainService` | Domain | Blockchain operations |
| `IQRCodeService` | Domain | QR generation |

### Adapters (Implementations)

| Adapter | Implements | Technology |
|---------|------------|------------|
| `SalesMongoRepository` | `ISalesRepository` | MongoDB + Mongoose |
| `BlockchainAdapter` | `IBlockchainService` | Ethers + Viem |
| `QRCodeAdapter` | `IQRCodeService` | qrcode library |
| `SalesController` | - | NestJS HTTP |

---

## 🧪 Testing

### Unit Tests - Domain Layer

```typescript
// Sale.spec.ts
describe('Sale Entity', () => {
  it('should validate entry and close ticket', () => {
    const sale = Sale.create({...});
    sale.generateQRCode(qrCode);
    sale.validateEntry();

    expect(sale.status).toEqual(TicketStatus.CLOSED);
  });
});
```

**Ventajas**:
- ✅ No requiere base de datos
- ✅ No requiere frameworks
- ✅ Rápido (<1ms por test)

### Unit Tests - Application Layer

```typescript
// ValidateTicketEntryUseCase.spec.ts
describe('ValidateTicketEntryUseCase', () => {
  let mockRepository: jest.Mocked<ISalesRepository>;

  it('should validate entry successfully', async () => {
    mockRepository.checkTicketStatus.mockResolvedValue(sale);

    const result = await useCase.execute({...});

    expect(result.success).toBe(true);
  });
});
```

**Ventajas**:
- ✅ Mock de repositorio simple
- ✅ Testea orquestación
- ✅ Independiente de infraestructura

### Integration Tests - Infrastructure Layer

```typescript
// SalesMongoRepository.spec.ts
describe('SalesMongoRepository', () => {
  it('should save and retrieve sale', async () => {
    await repository.save(sale);
    const retrieved = await repository.findById(sale.id);

    expect(retrieved).toBeDefined();
  });
});
```

**Ventajas**:
- ✅ Testea integración con MongoDB
- ✅ Valida mapeos

---

## 🚀 Uso

### Ejemplo 1: Poner ticket en reventa

```typescript
// En el controller
@Patch(':id/resale')
async putForResale(@Param('id') saleId: string, @Body() dto: PutForResaleDto) {
  const result = await this.putSaleForResaleUseCase.execute({
    saleId,
    clientId: user._id,
    resalePrice: dto.resalePrice,
    maxResalePrice: dto.maxResalePrice,
    accountPrivateKey: dto.accountPrivateKey,
    eventAddress: dto.eventAddress,
    tokenId: dto.tokenId,
  });

  return { success: true, data: result };
}
```

### Ejemplo 2: Validar entrada

```typescript
@Post(':id/validate')
async validateEntry(@Param('id') saleId: string) {
  const result = await this.validateTicketEntryUseCase.execute({
    saleId,
    promoterId: promoter._id,
  });

  return result;
}
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│  HTTP Request (POST /api/sales/:id/validate)       │
└────────────────┬────────────────────────────────────┘
                 ↓
         ┌───────────────┐
         │ SalesController│ (Interfaces Layer)
         └───────┬───────┘
                 ↓
    ┌────────────────────────┐
    │ ValidateTicketEntryUC  │ (Application Layer)
    └────────┬───────────────┘
             ↓
    ┌────────────────┐
    │ ISalesRepository│ (Domain Port)
    └────────┬───────┘
             ↓
   ┌──────────────────────┐
   │ SalesMongoRepository │ (Infrastructure Adapter)
   └──────────┬───────────┘
              ↓
        ┌──────────┐
        │ MongoDB  │
        └──────────┘
```

---

## ✅ Ventajas de esta Arquitectura

### 1. Testabilidad
- Domain: Tests sin mocks
- Application: Mocks simples de interfaces
- Infrastructure: Tests de integración aislados

### 2. Mantenibilidad
- Lógica de negocio centralizada
- Cambios aislados por capa
- Código autodocumentado

### 3. Flexibilidad
- Cambiar MongoDB → PostgreSQL: Solo cambiar adapter
- Cambiar ethers → web3.js: Solo cambiar adapter
- Agregar GraphQL: Nuevo adapter de entrada

### 4. Independencia
- Domain NO depende de NestJS
- Domain NO depende de MongoDB
- Domain NO depende de blockchain library

---

## 📈 Próximos Pasos

### Fase 1: Validación (2 semanas) ✅ COMPLETADO
- [x] Implementar módulo Sales completo
- [x] Tests unitarios domain
- [x] Tests unitarios application
- [x] Documentación

### Fase 2: Integración (1 semana)
- [ ] Integrar con módulo legacy (backward compatibility)
- [ ] Migración gradual de endpoints
- [ ] Tests de integración E2E

### Fase 3: Expansión (8-10 semanas)
- [ ] Refactorizar módulo Orders
- [ ] Refactorizar módulo Events
- [ ] Refactorizar módulo Payments

---

## 📚 Referencias

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [DDD by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Autor**: Claude Code
**Fecha**: 2025-10-15
**Versión**: 1.0
