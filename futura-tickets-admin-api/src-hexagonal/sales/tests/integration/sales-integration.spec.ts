import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SalesHexagonalModule } from '../../sales-hexagonal.module';
import { GetSaleByIdUseCase } from '../../application/use-cases/GetSaleByIdUseCase';
import { CreateSalesForOrderUseCase } from '../../application/use-cases/CreateSalesForOrderUseCase';
import { ValidateTicketEntryUseCase } from '../../application/use-cases/ValidateTicketEntryUseCase';
import { Sale } from '../../domain/entities/Sale';
import { Money } from '../../domain/value-objects/Money';

/**
 * Integration Tests - Sales Hexagonal Module
 *
 * Estos tests verifican la integración entre capas:
 * - Application Layer → Infrastructure Layer
 * - Infrastructure Layer → MongoDB
 * - End-to-End flows
 */
describe('Sales Hexagonal Integration Tests', () => {
  let module: TestingModule;
  let getSaleUseCase: GetSaleByIdUseCase;
  let createSalesUseCase: CreateSalesForOrderUseCase;
  let validateTicketUseCase: ValidateTicketEntryUseCase;

  // Test data
  const testOrderId = 'test-order-123';
  const testEventId = 'test-event-456';
  const testClientId = 'test-client-789';
  const testPromoterId = 'test-promoter-001';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot(process.env.MONGO_TEST_URL || 'mongodb://localhost:27017/futura-tickets-test'),
        SalesHexagonalModule,
      ],
    }).compile();

    getSaleUseCase = module.get<GetSaleByIdUseCase>(GetSaleByIdUseCase);
    createSalesUseCase = module.get<CreateSalesForOrderUseCase>(CreateSalesForOrderUseCase);
    validateTicketUseCase = module.get<ValidateTicketEntryUseCase>(ValidateTicketEntryUseCase);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Create Sales Flow', () => {
    it('should create multiple sales for an order', async () => {
      // Arrange
      const items = [
        { type: 'VIP', price: 150, quantity: 2 },
        { type: 'General', price: 50, quantity: 3 },
      ];

      // Act
      const sales = await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items,
      });

      // Assert
      expect(sales).toHaveLength(5); // 2 VIP + 3 General
      expect(sales[0].price.value).toBe(150);
      expect(sales[0].qrCode).toBeDefined();
      expect(sales[0].status.value).toBe('OPEN');
    });
  });

  describe('Get Sale Flow', () => {
    it('should retrieve a sale by ID', async () => {
      // Arrange: Create a sale first
      const sales = await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items: [{ type: 'VIP', price: 100, quantity: 1 }],
      });

      const saleId = sales[0].id.value;

      // Act
      const retrievedSale = await getSaleUseCase.execute({
        saleId,
        promoterId: testPromoterId,
      });

      // Assert
      expect(retrievedSale).toBeDefined();
      expect(retrievedSale?.id.value).toBe(saleId);
      expect(retrievedSale?.price.value).toBe(100);
    });

    it('should return null for non-existent sale', async () => {
      // Act
      const sale = await getSaleUseCase.execute({
        saleId: 'non-existent-id',
        promoterId: testPromoterId,
      });

      // Assert
      expect(sale).toBeNull();
    });
  });

  describe('Validate Ticket Flow', () => {
    it('should validate ticket entry successfully', async () => {
      // Arrange: Create a sale
      const sales = await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items: [{ type: 'VIP', price: 100, quantity: 1 }],
      });

      const saleId = sales[0].id.value;

      // Act
      const result = await validateTicketUseCase.execute({
        saleId,
        promoterId: testPromoterId,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('granted');
      expect(result.sale.status.value).toBe('CLOSED');
    });

    it('should deny entry for already used ticket', async () => {
      // Arrange: Create and validate once
      const sales = await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items: [{ type: 'VIP', price: 100, quantity: 1 }],
      });

      const saleId = sales[0].id.value;
      await validateTicketUseCase.execute({ saleId, promoterId: testPromoterId });

      // Act: Try to validate again
      const result = await validateTicketUseCase.execute({
        saleId,
        promoterId: testPromoterId,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('denied');
    });
  });

  describe('Business Rules Validation', () => {
    it('should enforce ticket status rules', async () => {
      // Arrange
      const sales = await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items: [{ type: 'VIP', price: 100, quantity: 1 }],
      });

      const sale = sales[0];

      // Assert: New ticket should be OPEN
      expect(sale.status.value).toBe('OPEN');

      // Assert: Should be able to resell
      expect(sale.canBeResold()).toBe(true);

      // Act: Validate entry
      await validateTicketUseCase.execute({
        saleId: sale.id.value,
        promoterId: testPromoterId,
      });

      // Assert: After validation, should not be resellable
      const closedSale = await getSaleUseCase.execute({
        saleId: sale.id.value,
        promoterId: testPromoterId,
      });

      expect(closedSale?.status.value).toBe('CLOSED');
      expect(closedSale?.canBeResold()).toBe(false);
    });

    it('should handle invitation tickets correctly', async () => {
      // Arrange
      const sales = await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items: [{ type: 'VIP', price: 0, quantity: 1, isInvitation: true }],
      });

      const invitationSale = sales[0];

      // Assert
      expect(invitationSale.isInvitation).toBe(true);
      expect(invitationSale.price.value).toBe(0);
      expect(invitationSale.canBeResold()).toBe(false); // Invitations can't be resold
    });
  });

  describe('Performance Tests', () => {
    it('should create 100 tickets in less than 2 seconds', async () => {
      const startTime = Date.now();

      // Act: Create 100 tickets
      await createSalesUseCase.execute({
        orderId: testOrderId,
        eventId: testEventId,
        clientId: testClientId,
        promoterId: testPromoterId,
        items: [{ type: 'General', price: 50, quantity: 100 }],
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      expect(duration).toBeLessThan(2000); // Less than 2 seconds
    });
  });
});
