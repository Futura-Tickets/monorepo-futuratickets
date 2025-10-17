import { Sale } from './Sale';
import { Money } from '../value-objects/Money';
import { QRCode } from '../value-objects/QRCode';
import { TicketStatus } from '../value-objects/TicketStatus';

/**
 * Unit Tests for Sale Entity
 * Domain Layer - Business Logic Testing
 */
describe('Sale Entity', () => {
  describe('create', () => {
    it('should create a new sale with PENDING status', () => {
      const sale = Sale.create({
        orderId: 'order-123',
        eventId: 'event-456',
        clientId: 'client-789',
        promoterId: 'promoter-001',
        type: 'VIP',
        price: new Money(100),
      });

      expect(sale.status).toEqual(TicketStatus.PENDING);
      expect(sale.price.value).toBe(100);
      expect(sale.isInvitation).toBe(false);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code and set status to OPEN', () => {
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

      expect(sale.qrCode).toEqual(qrCode);
      expect(sale.status).toEqual(TicketStatus.OPEN);
    });

    it('should throw error if QR code already generated', () => {
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

      expect(() => sale.generateQRCode(qrCode)).toThrow(
        'QR Code already generated',
      );
    });
  });

  describe('putForResale', () => {
    it('should put ticket for resale with valid price', () => {
      const sale = Sale.create({
        orderId: 'order-123',
        eventId: 'event-456',
        clientId: 'client-789',
        promoterId: 'promoter-001',
        type: 'VIP',
        price: new Money(100),
      });

      // Simular que el ticket está abierto
      const qrCode = new QRCode('QR-DATA-12345');
      sale.generateQRCode(qrCode);

      const resalePrice = new Money(120);
      const maxResalePrice = new Money(150);

      sale.putForResale(resalePrice, maxResalePrice);

      expect(sale.status).toEqual(TicketStatus.SALE);
      expect(sale.resale.isResale).toBe(true);
      expect(sale.resale.resalePrice?.value).toBe(120);
    });

    it('should throw error if resale price exceeds maximum', () => {
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

      const resalePrice = new Money(200);
      const maxResalePrice = new Money(150);

      expect(() => sale.putForResale(resalePrice, maxResalePrice)).toThrow(
        'Resale price cannot exceed',
      );
    });

    it('should throw error if ticket is not in valid status', () => {
      const sale = Sale.create({
        orderId: 'order-123',
        eventId: 'event-456',
        clientId: 'client-789',
        promoterId: 'promoter-001',
        type: 'VIP',
        price: new Money(100),
      });

      // No generamos QR, el ticket está en PENDING
      const resalePrice = new Money(120);
      const maxResalePrice = new Money(150);

      expect(() => sale.putForResale(resalePrice, maxResalePrice)).toThrow(
        'Ticket cannot be resold in current status',
      );
    });
  });

  describe('validateEntry', () => {
    it('should validate entry and close ticket', () => {
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

      sale.validateEntry();

      expect(sale.status).toEqual(TicketStatus.CLOSED);
    });

    it('should throw error if ticket already used', () => {
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

      sale.validateEntry(); // Primera validación

      expect(() => sale.validateEntry()).toThrow('Ticket already used');
    });
  });

  describe('canBeResold', () => {
    it('should return true for OPEN ticket', () => {
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

      expect(sale.canBeResold()).toBe(true);
    });

    it('should return false for invitation', () => {
      const sale = Sale.create({
        orderId: 'order-123',
        eventId: 'event-456',
        clientId: 'client-789',
        promoterId: 'promoter-001',
        type: 'VIP',
        price: new Money(0),
        isInvitation: true,
      });

      const qrCode = new QRCode('QR-DATA-12345');
      sale.generateQRCode(qrCode);

      expect(sale.canBeResold()).toBe(false);
    });
  });
});
