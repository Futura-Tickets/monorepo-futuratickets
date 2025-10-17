/**
 * Sales Service Unit Tests
 *
 * Tests for ticket/sales management including:
 * - Creating tickets
 * - Fetching tickets by event/account
 * - Updating ticket status
 * - Resale operations
 * - Transfer operations
 * - Access control
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SalesService } from './sales.service';
import { Sales as SalesSchema } from './sales.schema';
import { TicketStatus, TicketActivity } from '../shared/interface';
import { mockRepository, MockSaleFactory } from '../../test/utils/test-setup';

describe('SalesService', () => {
  let service: SalesService;
  let mockSalesModel: any;

  beforeEach(async () => {
    // Create mock Sales model
    mockSalesModel = {
      ...mockRepository(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getModelToken(SalesSchema.name),
          useValue: mockSalesModel,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSale', () => {
    it('should return a sale by promoter and saleId', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const saleId = '507f1f77bcf86cd799439012';
      const mockSale = MockSaleFactory.createSale({
        _id: saleId,
        promoter: promoterId,
      });

      mockSalesModel.findOne.mockResolvedValue(mockSale);

      // Act
      const result = await service.getSale(promoterId, saleId);

      // Assert
      expect(result).toEqual(mockSale);
      expect(mockSalesModel.findOne).toHaveBeenCalledWith({
        _id: saleId,
        promoter: promoterId,
      });
    });

    it('should return null if sale not found', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const saleId = '507f1f77bcf86cd799439999';

      mockSalesModel.findOne.mockResolvedValue(null);

      // Act
      const result = await service.getSale(promoterId, saleId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createSale', () => {
    it('should create a new sale successfully', async () => {
      // Arrange
      const createSaleData = {
        event: '507f1f77bcf86cd799439011',
        client: '507f1f77bcf86cd799439012',
        promoter: '507f1f77bcf86cd799439013',
        order: '507f1f77bcf86cd799439014',
        type: 'General',
        price: 5000,
        status: TicketStatus.PENDING,
        history: [
          {
            activity: TicketActivity.PENDING,
            reason: 'Payment pending',
            status: TicketStatus.PENDING,
            createdAt: new Date(),
          },
        ],
      };

      const mockCreatedSale = MockSaleFactory.createSale(createSaleData);
      mockSalesModel.create.mockResolvedValue(mockCreatedSale);

      // Act
      const result = await service.createSale(createSaleData);

      // Assert
      expect(result).toEqual(mockCreatedSale);
      expect(mockSalesModel.create).toHaveBeenCalledWith(createSaleData);
    });

    it('should create sale with default PENDING status', async () => {
      // Arrange
      const createSaleData = {
        event: '507f1f77bcf86cd799439011',
        client: '507f1f77bcf86cd799439012',
        promoter: '507f1f77bcf86cd799439013',
        order: '507f1f77bcf86cd799439014',
        type: 'VIP',
        price: 15000,
        history: [],
      };

      mockSalesModel.create.mockResolvedValue(
        MockSaleFactory.createSale(createSaleData),
      );

      // Act
      await service.createSale(createSaleData);

      // Assert
      expect(mockSalesModel.create).toHaveBeenCalledWith(createSaleData);
    });
  });

  describe('createSales', () => {
    it('should create multiple sales at once', async () => {
      // Arrange
      const createSalesData = [
        {
          event: '507f1f77bcf86cd799439011',
          client: '507f1f77bcf86cd799439012',
          promoter: '507f1f77bcf86cd799439013',
          order: '507f1f77bcf86cd799439014',
          type: 'General',
          price: 5000,
          history: [],
        },
        {
          event: '507f1f77bcf86cd799439011',
          client: '507f1f77bcf86cd799439012',
          promoter: '507f1f77bcf86cd799439013',
          order: '507f1f77bcf86cd799439014',
          type: 'VIP',
          price: 15000,
          history: [],
        },
      ];

      const mockCreatedSales = createSalesData.map((data) =>
        MockSaleFactory.createSale(data),
      );
      mockSalesModel.create.mockResolvedValue(mockCreatedSales);

      // Act
      const result = await service.createSales(createSalesData);

      // Assert
      expect(result).toEqual(mockCreatedSales);
      expect(mockSalesModel.create).toHaveBeenCalledWith(createSalesData);
    });
  });

  describe('findSale', () => {
    it('should find sale by id, client, and status with populated data', async () => {
      // Arrange
      const saleId = '507f1f77bcf86cd799439011';
      const clientId = '507f1f77bcf86cd799439012';
      const status = TicketStatus.OPEN;

      const mockSale = MockSaleFactory.createSale({
        _id: saleId,
        client: clientId,
        status,
      });

      mockSalesModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockSale),
        }),
      });

      // Act
      const result = await service.findSale(saleId, clientId, status);

      // Assert
      expect(result).toEqual(mockSale);
      expect(mockSalesModel.findOne).toHaveBeenCalledWith({
        _id: saleId,
        client: clientId,
        status,
      });
    });

    it('should populate client and event details', async () => {
      // Arrange
      const saleId = '507f1f77bcf86cd799439011';
      const clientId = '507f1f77bcf86cd799439012';
      const status = TicketStatus.SALE;

      const secondPopulate = jest.fn().mockResolvedValue(null);
      const firstPopulate = jest.fn().mockReturnValue({
        populate: secondPopulate,
      });

      mockSalesModel.findOne.mockReturnValue({
        populate: firstPopulate,
      });

      // Act
      await service.findSale(saleId, clientId, status);

      // Assert
      expect(firstPopulate).toHaveBeenCalledWith({
        path: 'client',
        model: 'Account',
      });
      expect(secondPopulate).toHaveBeenCalledWith({
        path: 'event',
        model: 'Event',
      });
    });
  });

  describe('getSales', () => {
    it('should return all sales for a promoter', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const mockSales = MockSaleFactory.createSales(3, {
        promoter: promoterId,
      });

      mockSalesModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockSales),
          }),
        }),
      });

      // Act
      const result = await service.getSales(promoterId);

      // Assert
      expect(result).toEqual(mockSales);
      expect(mockSalesModel.find).toHaveBeenCalledWith({ promoter: promoterId });
    });

    it('should populate event and client with selected fields', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';

      const sortMock = jest.fn().mockResolvedValue([]);
      const secondPopulate = jest.fn().mockReturnValue({
        sort: sortMock,
      });
      const firstPopulate = jest.fn().mockReturnValue({
        populate: secondPopulate,
      });

      mockSalesModel.find.mockReturnValue({
        populate: firstPopulate,
      });

      // Act
      await service.getSales(promoterId);

      // Assert
      expect(firstPopulate).toHaveBeenCalledWith({
        path: 'event',
        model: 'Event',
        select: {
          name: 1,
          promoter: 1,
        },
      });
      expect(secondPopulate).toHaveBeenCalledWith({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1 },
      });
    });

    it('should sort sales by createdAt descending', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const sortMock = jest.fn().mockResolvedValue([]);

      mockSalesModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: sortMock,
          }),
        }),
      });

      // Act
      await service.getSales(promoterId);

      // Assert
      expect(sortMock).toHaveBeenCalledWith({ createdAt: 'desc' });
    });
  });

  describe('getEventResales', () => {
    it('should return tickets in resale status for an event', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const mockResales = [
        MockSaleFactory.createResaleSale({ event: eventId }),
        MockSaleFactory.createResaleSale({ event: eventId }),
      ];

      mockSalesModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockResales),
          }),
        }),
      });

      // Act
      const result = await service.getEventResales(eventId);

      // Assert
      expect(result).toEqual(mockResales);
      expect(mockSalesModel.find).toHaveBeenCalledWith({
        event: eventId,
        status: TicketStatus.SALE,
      });
    });

    it('should exclude sensitive fields from event data', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';

      const sortMock = jest.fn().mockResolvedValue([]);
      const secondPopulate = jest.fn().mockReturnValue({
        sort: sortMock,
      });
      const firstPopulate = jest.fn().mockReturnValue({
        populate: secondPopulate,
      });

      mockSalesModel.find.mockReturnValue({
        populate: firstPopulate,
      });

      // Act
      await service.getEventResales(eventId);

      // Assert
      expect(secondPopulate).toHaveBeenCalledWith({
        path: 'event',
        model: 'Event',
        select: {
          orders: 0,
          __v: 0,
          blockNumber: 0,
          hash: 0,
          isBlockchain: 0,
        },
      });
    });
  });

  describe('updateSale', () => {
    it('should update sale status to OPEN', async () => {
      // Arrange
      const saleId = '507f1f77bcf86cd799439011';
      const updateData = {
        status: TicketStatus.OPEN,
      };

      mockSalesModel.findByIdAndUpdate.mockResolvedValue({
        _id: saleId,
        status: TicketStatus.OPEN,
      });

      // Act
      await service.updateSale(saleId, updateData);

      // Assert
      expect(mockSalesModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: saleId },
        updateData,
      );
    });

    it('should update sale with QR code', async () => {
      // Arrange
      const saleId = '507f1f77bcf86cd799439011';
      const updateData = {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      };

      mockSalesModel.findByIdAndUpdate.mockResolvedValue({
        _id: saleId,
        qrCode: updateData.qrCode,
      });

      // Act
      await service.updateSale(saleId, updateData);

      // Assert
      expect(mockSalesModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: saleId },
        updateData,
      );
    });

    it('should update sale with resale information', async () => {
      // Arrange
      const saleId = '507f1f77bcf86cd799439011';
      const updateData = {
        status: TicketStatus.SALE,
        resale: {
          resalePrice: 7500,
          resaleDate: new Date(),
        },
      };

      mockSalesModel.findByIdAndUpdate.mockResolvedValue({
        _id: saleId,
        ...updateData,
      });

      // Act
      await service.updateSale(saleId, updateData);

      // Assert
      expect(mockSalesModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: saleId },
        updateData,
      );
    });
  });

  describe('updateSalesStatus', () => {
    it('should update status for all tickets of an event', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const history = {
        activity: TicketActivity.EXPIRED,
        reason: 'Event ended',
        status: TicketStatus.EXPIRED,
        createdAt: new Date(),
      };
      const status = TicketStatus.EXPIRED;

      mockSalesModel.updateMany.mockResolvedValue({
        modifiedCount: 10,
        matchedCount: 10,
      });

      // Act
      await service.updateSalesStatus(eventId, history, status);

      // Assert
      expect(mockSalesModel.updateMany).toHaveBeenCalledWith(
        {
          event: eventId,
          $or: [{ status: TicketStatus.OPEN }, { status: TicketStatus.SALE }],
        },
        {
          $push: { history, status },
        },
      );
    });

    it('should only update OPEN and SALE tickets', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const history = {
        activity: TicketActivity.EXPIRED,
        reason: 'Event cancelled',
        status: TicketStatus.EXPIRED,
        createdAt: new Date(),
      };

      mockSalesModel.updateMany.mockResolvedValue({
        modifiedCount: 5,
        matchedCount: 5,
      });

      // Act
      await service.updateSalesStatus(eventId, history, TicketStatus.EXPIRED);

      // Assert
      const callArg = mockSalesModel.updateMany.mock.calls[0][0];
      expect(callArg.$or).toEqual([
        { status: TicketStatus.OPEN },
        { status: TicketStatus.SALE },
      ]);
    });
  });

  describe('accessEvent', () => {
    it('should mark ticket as CLOSED when accessed', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const saleId = '507f1f77bcf86cd799439012';

      const mockUpdatedSale = MockSaleFactory.createSale({
        _id: saleId,
        promoter: promoterId,
        status: TicketStatus.CLOSED,
      });

      mockSalesModel.findOneAndUpdate.mockResolvedValue(mockUpdatedSale);

      // Act
      const result = await service.accessEvent(promoterId, saleId);

      // Assert
      expect(result).toEqual(mockUpdatedSale);
      expect(mockSalesModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: saleId, promoter: promoterId },
        { status: TicketStatus.CLOSED },
        { new: true },
      );
    });

    it('should return updated sale with new status', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const saleId = '507f1f77bcf86cd799439012';

      mockSalesModel.findOneAndUpdate.mockResolvedValue(
        MockSaleFactory.createClosedSale({
          _id: saleId,
          promoter: promoterId,
        }),
      );

      // Act
      const result = await service.accessEvent(promoterId, saleId);

      // Assert
      expect(result?.status).toBe('CLOSED');
      expect(mockSalesModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { new: true }, // Should return updated document
      );
    });
  });

  describe('checkTicketStatus', () => {
    it('should return ticket status with client details', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const saleId = '507f1f77bcf86cd799439012';

      const mockSale = MockSaleFactory.createSale({
        _id: saleId,
        promoter: promoterId,
      });

      mockSalesModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSale),
      });

      // Act
      const result = await service.checkTicketStatus(promoterId, saleId);

      // Assert
      expect(result).toEqual(mockSale);
      expect(mockSalesModel.findOne).toHaveBeenCalledWith({
        _id: saleId,
        promoter: promoterId,
      });
    });

    it('should populate client with selected fields only', async () => {
      // Arrange
      const promoterId = '507f1f77bcf86cd799439011';
      const saleId = '507f1f77bcf86cd799439012';

      const populateMock = jest.fn().mockResolvedValue(null);
      mockSalesModel.findOne.mockReturnValue({
        populate: populateMock,
      });

      // Act
      await service.checkTicketStatus(promoterId, saleId);

      // Assert
      expect(populateMock).toHaveBeenCalledWith({
        path: 'client',
        model: 'Account',
        select: {
          name: 1,
          lastName: 1,
          email: 1,
        },
      });
    });
  });

  describe('getEventSales', () => {
    it('should return count of sales for an event', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const expectedCount = 50;

      mockSalesModel.where.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(expectedCount),
      });

      // Act
      const result = await service.getEventSales(eventId);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockSalesModel.where).toHaveBeenCalledWith({ event: eventId });
    });

    it('should return 0 if event has no sales', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439999';

      mockSalesModel.where.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(0),
      });

      // Act
      const result = await service.getEventSales(eventId);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getEventSalesByType', () => {
    it('should return count of sales by ticket type', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const ticketType = 'VIP';
      const expectedCount = 20;

      mockSalesModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(expectedCount),
      });

      // Act
      const result = await service.getEventSalesByType(eventId, ticketType);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockSalesModel.find).toHaveBeenCalledWith({
        $and: [{ event: eventId }, { type: ticketType }],
      });
    });

    it('should work for General tickets', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const ticketType = 'General';

      mockSalesModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(30),
      });

      // Act
      const result = await service.getEventSalesByType(eventId, ticketType);

      // Assert
      expect(result).toBe(30);
    });
  });

  describe('getAccountSales', () => {
    it('should return all tickets for a user account', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const mockSales = MockSaleFactory.createSales(5, { client: accountId });

      mockSalesModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockSales),
            }),
          }),
        }),
      });

      // Act
      const result = await service.getAccountSales(accountId);

      // Assert
      expect(result).toEqual(mockSales);
      expect(mockSalesModel.find).toHaveBeenCalledWith({
        client: accountId,
        status: { $nin: 'PENDING' },
      });
    });

    it('should exclude PENDING tickets', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';

      mockSalesModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAccountSales(accountId);

      // Assert
      const callArg = mockSalesModel.find.mock.calls[0][0];
      expect(callArg.status).toEqual({ $nin: 'PENDING' });
    });

    it('should populate event with necessary fields', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const firstPopulate = jest.fn().mockReturnThis();

      mockSalesModel.find.mockReturnValue({
        populate: firstPopulate,
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAccountSales(accountId);

      // Assert
      expect(firstPopulate).toHaveBeenCalledWith({
        path: 'event',
        model: 'Event',
        select: {
          _id: 1,
          name: 1,
          location: 1,
          image: 1,
          resale: 1,
        },
      });
    });

    it('should select only necessary sale fields', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const selectMock = jest.fn().mockReturnThis();

      mockSalesModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: selectMock,
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAccountSales(accountId);

      // Assert
      expect(selectMock).toHaveBeenCalledWith({
        _id: 1,
        type: 1,
        price: 1,
        qrCode: 1,
        status: 1,
        tokenId: 1,
        createdAt: 1,
      });
    });
  });
});
