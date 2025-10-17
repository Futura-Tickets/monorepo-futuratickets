import { ValidateTicketEntryUseCase } from './ValidateTicketEntryUseCase';
import { ISalesRepository } from '../../domain/repositories/ISalesRepository';
import { Sale } from '../../domain/entities/Sale';
import { SaleId } from '../../domain/value-objects/SaleId';
import { Money } from '../../domain/value-objects/Money';
import { QRCode } from '../../domain/value-objects/QRCode';

/**
 * Unit Tests for ValidateTicketEntryUseCase
 * Application Layer - Use Case Testing
 *
 * Mock del repositorio para aislar lógica de negocio
 */
describe('ValidateTicketEntryUseCase', () => {
  let useCase: ValidateTicketEntryUseCase;
  let mockRepository: jest.Mocked<ISalesRepository>;

  beforeEach(() => {
    // Mock del repositorio
    mockRepository = {
      save: jest.fn(),
      saveMany: jest.fn(),
      findById: jest.fn(),
      findByIdWithDetails: jest.fn(),
      findOne: jest.fn(),
      findByPromoter: jest.fn(),
      findByEvent: jest.fn(),
      findResalesByEvent: jest.fn(),
      findByEventForAccess: jest.fn(),
      findInvitationsByEvent: jest.fn(),
      updateManyStatus: jest.fn(),
      checkTicketStatus: jest.fn(),
    };

    useCase = new ValidateTicketEntryUseCase(mockRepository);
  });

  it('should validate entry successfully for valid ticket', async () => {
    // Arrange: Crear un ticket válido
    const sale = Sale.create({
      orderId: 'order-123',
      eventId: 'event-456',
      clientId: 'client-789',
      promoterId: 'promoter-001',
      type: 'VIP',
      price: new Money(100),
    });

    const qrCode = new QRCode('QR-DATA-12345');
    sale.generateQRCode(qrCode);

    mockRepository.checkTicketStatus.mockResolvedValue(sale);
    mockRepository.save.mockResolvedValue();

    // Act: Ejecutar caso de uso
    const result = await useCase.execute({
      saleId: sale.id.value,
      promoterId: 'promoter-001',
    });

    // Assert: Verificar resultado
    expect(result.success).toBe(true);
    expect(result.message).toContain('granted successfully');
    expect(mockRepository.save).toHaveBeenCalledWith(sale);
  });

  it('should deny entry for already used ticket', async () => {
    // Arrange: Crear un ticket ya usado
    const sale = Sale.create({
      orderId: 'order-123',
      eventId: 'event-456',
      clientId: 'client-789',
      promoterId: 'promoter-001',
      type: 'VIP',
      price: new Money(100),
    });

    const qrCode = new QRCode('QR-DATA-12345');
    sale.generateQRCode(qrCode);
    sale.validateEntry(); // Ya validado

    mockRepository.checkTicketStatus.mockResolvedValue(sale);
    mockRepository.save.mockResolvedValue();

    // Act
    const result = await useCase.execute({
      saleId: sale.id.value,
      promoterId: 'promoter-001',
    });

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toContain('denied');
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw error if ticket not found', async () => {
    // Arrange
    mockRepository.checkTicketStatus.mockResolvedValue(null);

    // Act & Assert
    await expect(
      useCase.execute({
        saleId: 'non-existent',
        promoterId: 'promoter-001',
      }),
    ).rejects.toThrow('Ticket not found');
  });
});
