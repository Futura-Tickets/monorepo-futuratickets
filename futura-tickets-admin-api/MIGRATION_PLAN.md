# Migration Plan - Legacy to Hexagonal Architecture

Plan de migración gradual del código legacy a arquitectura hexagonal.

## 📋 Estrategia: Migración Incremental

### Principios:
✅ **Zero Downtime**: Sistema siempre funcional
✅ **Backward Compatible**: Código legacy sigue funcionando
✅ **Progressive**: Módulo por módulo, endpoint por endpoint
✅ **Testeable**: Cada paso validado con tests
✅ **Reversible**: Podemos rollback en cualquier momento

---

## 🗓️ Timeline General (10-12 semanas)

```
┌─────────────────────────────────────────────────────┐
│ Semana 1-2: ✅ COMPLETADO                           │
│ └─ PoC Sales Module (Hexagonal)                    │
├─────────────────────────────────────────────────────┤
│ Semana 3: Integración Sales                        │
│ └─ Backward compatibility + Tests                  │
├─────────────────────────────────────────────────────┤
│ Semana 4-5: Orders Module                          │
│ └─ Refactor + Integration                          │
├─────────────────────────────────────────────────────┤
│ Semana 6-7: Payments Module                        │
│ └─ Refactor + Integration                          │
├─────────────────────────────────────────────────────┤
│ Semana 8-10: Events Module (más complejo)          │
│ └─ Refactor + Integration                          │
├─────────────────────────────────────────────────────┤
│ Semana 11: Cleanup                                 │
│ └─ Eliminar código legacy + adapters temporales    │
├─────────────────────────────────────────────────────┤
│ Semana 12: Optimización                           │
│ └─ Performance tuning + Monitoring                 │
└─────────────────────────────────────────────────────┘
```

---

## 📅 Fase 1: Sales Module (Semana 3)

### Estado Actual:
- ✅ Código hexagonal implementado
- ✅ Tests unitarios (domain + application)
- ✅ Documentación completa

### Tareas Semana 3:

#### Día 1-2: Backward Compatibility
```typescript
// ✅ COMPLETADO
✓ LegacySalesServiceAdapter creado
✓ Permite llamar código legacy desde hexagonal
✓ Permite convertir legacy → domain entity
```

#### Día 3: Update Module Configuration
```typescript
// app.module.ts
@Module({
  imports: [
    // Legacy (mantener temporalmente)
    SalesModule,

    // Nuevo hexagonal
    SalesHexagonalModule,
  ],
})
export class AppModule {}
```

#### Día 4: Endpoint Migration Strategy

**Opción A: Feature Flag (Recomendado)**
```typescript
// sales.controller.ts
@Get(':id')
async getSale(@Param('id') id: string) {
  const useHexagonal = this.configService.get('USE_HEXAGONAL_SALES');

  if (useHexagonal) {
    return this.hexagonalSalesController.getSale(id);
  }

  return this.legacySalesService.getSale(id);
}
```

**Opción B: Nuevo Namespace (Más Seguro)**
```typescript
// Endpoints legacy (mantener)
GET /api/sales/:id           → Legacy SalesService

// Endpoints nuevos (hexagonal)
GET /api/v2/sales/:id        → Hexagonal SalesController
```

#### Día 5: Integration Tests
```typescript
// sales-integration.spec.ts
describe('Sales Integration', () => {
  it('should work with both legacy and hexagonal', async () => {
    // Test legacy
    const legacyResult = await legacyService.getSale(...);

    // Test hexagonal
    const hexResult = await hexUseCase.execute(...);

    // Verify same result
    expect(normalize(legacyResult)).toEqual(normalize(hexResult));
  });
});
```

---

## 📅 Fase 2: Orders Module (Semana 4-5)

### Estado Actual:
- ❌ Código legacy: `src/Orders/`
- ❌ 56 archivos TypeScript
- ❌ Acoplado a Sales, Events, Payments

### Plan:

#### Semana 4: Refactor
```
Día 1-2: Análisis y diseño
├─ Identificar bounded context
├─ Definir entities y value objects
└─ Diseñar use cases

Día 3-4: Implementación
├─ Domain layer (entities, VOs, repositories)
├─ Application layer (use cases)
└─ Infrastructure layer (adapters)

Día 5: Tests
├─ Unit tests (domain)
├─ Unit tests (application)
└─ Integration tests
```

#### Semana 5: Integración
```
Día 1-2: Backward compatibility adapter
Día 3: Module configuration
Día 4: Endpoint migration (feature flags)
Día 5: E2E tests + Validation
```

---

## 📅 Fase 3: Payments Module (Semana 6-7)

Similar a Orders, pero incluye:
- Integración con Stripe
- Payment Methods
- Refunds
- Webhooks

### Consideraciones Especiales:
- ⚠️ **Stripe webhooks**: Mantener backward compatibility crítico
- ⚠️ **Idempotencia**: Verificar que se mantiene
- ⚠️ **PCI compliance**: No romper seguridad

---

## 📅 Fase 4: Events Module (Semana 8-10)

### ⚠️ MÓDULO MÁS COMPLEJO
- 65,917 líneas de código
- admin-event.service.ts: 35,424 líneas
- user-event.service.ts: 20,497 líneas

### Estrategia de División:

#### Identificar Sub-Bounded Contexts:
```
Events (Main Context)
├─ Event Management (CRUD)
├─ Ticket Management (Lots, Availability)
├─ Blockchain Integration (NFT Minting)
├─ Media Management (Images, Assets)
└─ Statistics & Analytics
```

#### Plan por Sub-Contexto:
```
Semana 8: Event Management + Ticket Management
Semana 9: Blockchain Integration + Media Management
Semana 10: Statistics + Integration + Tests
```

---

## 📅 Fase 5: Cleanup (Semana 11)

Una vez todos los módulos migrados:

### Tareas:
```
1. Eliminar código legacy
   ├─ src/Sales/sales.service.ts (legacy)
   ├─ src/Orders/orders.service.ts (legacy)
   ├─ src/Payments/payments.service.ts (legacy)
   └─ src/Event/admin-event.service.ts (legacy)

2. Eliminar adapters temporales
   └─ LegacySalesServiceAdapter, etc.

3. Actualizar imports
   └─ Todos los módulos apuntan a hexagonal

4. Actualizar tests
   └─ Eliminar tests legacy

5. Actualizar documentación
   └─ README, API docs, etc.
```

---

## 📅 Fase 6: Optimización (Semana 12)

### Performance Tuning:
```
1. Profiling
   └─ Identificar bottlenecks

2. Caching
   ├─ Redis para queries frecuentes
   └─ Cache de eventos activos

3. Database Indexing
   └─ Optimizar queries MongoDB

4. Monitoring
   ├─ New Relic / Datadog
   ├─ Error tracking (Sentry)
   └─ Dashboards (Grafana)
```

---

## 🔄 Proceso de Migración por Endpoint

### Checklist por Endpoint:

```
□ 1. Implementar use case hexagonal
□ 2. Implementar tests unitarios
□ 3. Crear backward compatibility adapter (si necesario)
□ 4. Actualizar controller con feature flag
□ 5. Tests de integración legacy vs hexagonal
□ 6. Deploy a staging
□ 7. Smoke tests en staging
□ 8. Feature flag ON para 10% usuarios
□ 9. Monitor métricas (errors, latency)
□ 10. Feature flag ON para 50% usuarios
□ 11. Feature flag ON para 100% usuarios
□ 12. Eliminar código legacy
```

---

## 🧪 Testing Strategy

### Niveles de Testing:

#### 1. Unit Tests (Domain)
```typescript
// Rápido, sin mocks
describe('Sale Entity', () => {
  it('should validate business rules', () => {
    const sale = Sale.create({...});
    expect(sale.canBeResold()).toBe(true);
  });
});
```

#### 2. Unit Tests (Application)
```typescript
// Mocks simples de repositorios
describe('PutSaleForResaleUseCase', () => {
  it('should orchestrate domain logic', async () => {
    mockRepository.findById.mockResolvedValue(sale);
    await useCase.execute({...});
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

#### 3. Integration Tests
```typescript
// Con MongoDB de test
describe('SalesMongoRepository', () => {
  it('should persist and retrieve', async () => {
    await repository.save(sale);
    const retrieved = await repository.findById(sale.id);
    expect(retrieved).toBeDefined();
  });
});
```

#### 4. E2E Tests
```typescript
// HTTP requests reales
describe('Sales API E2E', () => {
  it('PUT /api/sales/:id/resale', async () => {
    const response = await request(app)
      .patch('/api/sales/123/resale')
      .send({ resalePrice: 100 });

    expect(response.status).toBe(200);
  });
});
```

#### 5. Comparison Tests (Durante Migración)
```typescript
// Verificar legacy vs hexagonal
describe('Sales Migration', () => {
  it('should return same result', async () => {
    const legacyResult = await legacyService.getSale(...);
    const hexResult = await hexUseCase.execute(...);

    expect(normalize(legacyResult)).toEqual(normalize(hexResult));
  });
});
```

---

## 📊 Métricas de Éxito

### KPIs a Monitorear:

| Métrica | Target | Current | Status |
|---------|--------|---------|--------|
| **Test Coverage** | >80% | 0% → | 🔄 |
| **Response Time** | <200ms | ? | 📊 |
| **Error Rate** | <0.1% | ? | 📊 |
| **Build Time** | <5min | ? | 📊 |
| **Code Duplication** | <5% | ? | 🔄 |
| **Cyclomatic Complexity** | <10 | ? | 🔄 |

---

## 🚨 Riesgos y Mitigaciones

### Riesgo 1: Breaking Changes
**Mitigación**: Feature flags + rollback plan

### Riesgo 2: Performance Degradation
**Mitigación**: Profiling antes/después + benchmarks

### Riesgo 3: Data Inconsistency
**Mitigación**: Tests de comparación legacy vs hexagonal

### Riesgo 4: Team Resistance
**Mitigación**: Training sessions + pair programming

### Riesgo 5: Deadline Pressure
**Mitigación**: Migración incremental, cada fase entrega valor

---

## 👥 Equipo Requerido

### Roles:
- **1 Senior Developer**: Arquitectura + Code reviews
- **1-2 Mid Developers**: Implementación
- **1 QA Engineer**: Testing strategy + automation
- **1 DevOps**: CI/CD + monitoring setup

### Tiempo Dedicado:
- **100% durante semanas 1-6** (crítico)
- **50% durante semanas 7-12** (optimización)

---

## 📚 Recursos de Aprendizaje

### Para el Equipo:
1. **DDD**: "Domain-Driven Design" by Eric Evans (Cap 1-5)
2. **Hexagonal**: Alistair Cockburn articles
3. **Clean Architecture**: Uncle Bob's blog
4. **NestJS + DDD**: GitHub examples

### Workshops Internos:
- **Semana 1**: DDD fundamentals (4h)
- **Semana 2**: Hexagonal architecture (4h)
- **Semana 3**: Hands-on: Refactoring session (8h)

---

## ✅ Checklist Final

### Antes de considerar completada la migración:

```
□ Todos los módulos migrados
□ Código legacy eliminado
□ Test coverage >80%
□ Performance igual o mejor que legacy
□ Documentación actualizada
□ Equipo trained en nueva arquitectura
□ Monitoring en producción
□ Runbooks actualizados
□ Post-mortem de lecciones aprendidas
```

---

## 📞 Soporte Durante Migración

### Daily Standups (15min):
- ¿Qué hice ayer?
- ¿Qué haré hoy?
- ¿Algún blocker?

### Weekly Reviews (1h):
- Demos de progreso
- Code reviews colaborativos
- Ajustar plan si necesario

### Slack Channel: `#hexagonal-migration`
- Dudas técnicas
- Compartir hallazgos
- Celebrar wins

---

**Última actualización**: 2025-10-15
**Versión**: 1.0
**Status**: ✅ Fase 1 Completada | 🔄 Fase 2 En Progreso
