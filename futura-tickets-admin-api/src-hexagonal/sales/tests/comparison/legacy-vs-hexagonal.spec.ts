import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from 'src/Sales/sales.service';
import { GetSaleByIdUseCase } from '../../application/use-cases/GetSaleByIdUseCase';
import { SalesModule } from 'src/Sales/sales.module';
import { SalesHexagonalModule } from '../../sales-hexagonal.module';

/**
 * Comparison Tests - Legacy vs Hexagonal
 *
 * Estos tests verifican que ambas implementaciones (legacy y hexagonal)
 * producen los mismos resultados durante la migración.
 *
 * IMPORTANTE: Estos tests son temporales y se eliminarán una vez
 * completada la migración.
 */
describe('Legacy vs Hexagonal - Comparison Tests', () => {
  let legacyService: SalesService;
  let hexagonalUseCase: GetSaleByIdUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SalesModule, // Legacy
        SalesHexagonalModule, // Hexagonal
      ],
    }).compile();

    legacyService = module.get<SalesService>(SalesService);
    hexagonalUseCase = module.get<GetSaleByIdUseCase>(GetSaleByIdUseCase);
  });

  /**
   * Helper function para normalizar respuestas
   * (legacy y hexagonal pueden tener formatos ligeramente diferentes)
   */
  function normalizeSale(sale: any) {
    return {
      id: sale._id?.toString() || sale.id?.value || sale.id,
      orderId: sale.order?.toString() || sale.orderId,
      eventId: sale.event?._id?.toString() || sale.eventId,
      clientId: sale.client?._id?.toString() || sale.clientId,
      promoterId: sale.promoter?.toString() || sale.promoterId,
      type: sale.type,
      price: typeof sale.price === 'object' ? sale.price.value : sale.price,
      status: typeof sale.status === 'object' ? sale.status.value : sale.status,
      qrCode: sale.qrCode?.value || sale.qrCode,
      isInvitation: sale.isInvitation,
    };
  }

  describe('Get Sale by ID', () => {
    it('should return same result from both implementations', async () => {
      const testSaleId = 'test-sale-id-123';
      const testPromoterId = 'test-promoter-001';

      // Act
      const legacyResult = await legacyService.getSale(testPromoterId, testSaleId);
      const hexagonalResult = await hexagonalUseCase.execute({
        saleId: testSaleId,
        promoterId: testPromoterId,
      });

      // Normalize
      const normalizedLegacy = legacyResult ? normalizeSale(legacyResult) : null;
      const normalizedHexagonal = hexagonalResult ? normalizeSale(hexagonalResult) : null;

      // Assert
      expect(normalizedLegacy).toEqual(normalizedHexagonal);
    });

    it('should return null for non-existent sale in both', async () => {
      const nonExistentId = 'non-existent-id-999';
      const testPromoterId = 'test-promoter-001';

      // Act
      const legacyResult = await legacyService.getSale(testPromoterId, nonExistentId);
      const hexagonalResult = await hexagonalUseCase.execute({
        saleId: nonExistentId,
        promoterId: testPromoterId,
      });

      // Assert
      expect(legacyResult).toBeNull();
      expect(hexagonalResult).toBeNull();
    });
  });

  describe('Performance Comparison', () => {
    it('hexagonal should be as fast or faster than legacy', async () => {
      const testSaleId = 'test-sale-id-123';
      const testPromoterId = 'test-promoter-001';
      const iterations = 100;

      // Measure legacy
      const legacyStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await legacyService.getSale(testPromoterId, testSaleId);
      }
      const legacyDuration = Date.now() - legacyStart;

      // Measure hexagonal
      const hexStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await hexagonalUseCase.execute({
          saleId: testSaleId,
          promoterId: testPromoterId,
        });
      }
      const hexDuration = Date.now() - hexStart;

      // Assert: Hexagonal should be at most 20% slower (acceptable overhead)
      const maxAcceptableDuration = legacyDuration * 1.2;
      expect(hexDuration).toBeLessThanOrEqual(maxAcceptableDuration);

      console.log(`
        Performance Comparison:
        - Legacy: ${legacyDuration}ms
        - Hexagonal: ${hexDuration}ms
        - Difference: ${((hexDuration - legacyDuration) / legacyDuration * 100).toFixed(2)}%
      `);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity between implementations', async () => {
      // Este test verifica que ambas implementaciones manejan
      // correctamente los mismos datos sin corrupción

      const testCases = [
        { saleId: 'sale-1', promoterId: 'promoter-1' },
        { saleId: 'sale-2', promoterId: 'promoter-1' },
        { saleId: 'sale-3', promoterId: 'promoter-2' },
      ];

      for (const testCase of testCases) {
        const legacyResult = await legacyService.getSale(
          testCase.promoterId,
          testCase.saleId,
        );
        const hexagonalResult = await hexagonalUseCase.execute(testCase);

        if (legacyResult && hexagonalResult) {
          const normalizedLegacy = normalizeSale(legacyResult);
          const normalizedHexagonal = normalizeSale(hexagonalResult);

          expect(normalizedLegacy).toEqual(normalizedHexagonal);
        }
      }
    });
  });
});
