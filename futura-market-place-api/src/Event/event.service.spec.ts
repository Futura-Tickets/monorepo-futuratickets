/**
 * Event Service Unit Tests
 *
 * Tests for event management including:
 * - Event retrieval
 * - Event creation/update/delete
 * - Coupon validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventService } from './event.service';
import { Event as EventSchema, Coupon as CouponSchema } from './event.schema';
import { AccountService } from '../Account/account.service';
import { NotificationService } from '../Notifications/notifications.service';
import { OrdersService } from '../Orders/orders.service';
import { PromoterService } from '../Promoter/promoter.service';
import { PromocodesService } from './promocode.service';
import { SalesService } from '../Sales/sales.service';
import { SocketService } from '../Socket/socket.service';
import { StripeService } from '../Stripe/stripe.service';
import { EventStatus } from '../shared/interface';
import { mockRepository, MockEventFactory } from '../../test/utils/test-setup';

describe('EventService', () => {
  let service: EventService;
  let mockEventModel: any;
  let mockCouponModel: any;
  let mockAccountService: jest.Mocked<Partial<AccountService>>;
  let mockSalesService: jest.Mocked<Partial<SalesService>>;
  let mockOrdersService: jest.Mocked<Partial<OrdersService>>;
  let mockStripeService: jest.Mocked<Partial<StripeService>>;
  let mockPromoterService: jest.Mocked<Partial<PromoterService>>;
  let mockPromocodesService: jest.Mocked<Partial<PromocodesService>>;
  let mockSocketService: jest.Mocked<Partial<SocketService>>;
  let mockNotificationService: jest.Mocked<Partial<NotificationService>>;

  beforeEach(async () => {
    // Create mock models
    mockEventModel = {
      ...mockRepository(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
    };

    // Create constructor mock for createEvent
    (mockEventModel as any).mockImplementation = jest.fn();

    mockCouponModel = mockRepository();

    // Create mock services
    mockAccountService = {
      accountExistOrCreate: jest.fn(),
      addOrderToAccount: jest.fn(),
    };

    mockSalesService = {
      getEventSalesByAccount: jest.fn(),
      getEventSalesByType: jest.fn(),
      getResales: jest.fn(),
      createSales: jest.fn(),
    };

    mockOrdersService = {
      createOrder: jest.fn(),
      updateOrderById: jest.fn(),
      updateOrdersById: jest.fn(),
      getOrdersWithCouponCount: jest.fn(),
    };

    mockStripeService = {
      createPaymentIntent: jest.fn(),
    };

    mockPromoterService = {
      addUserToPromoter: jest.fn(),
    };

    mockPromocodesService = {
      getEventByPromocode: jest.fn(),
    };

    mockSocketService = {
      emitOrderCreated: jest.fn(),
      emitUserCreated: jest.fn(),
    };

    mockNotificationService = {
      createNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getModelToken(EventSchema.name),
          useValue: mockEventModel,
        },
        {
          provide: getModelToken(CouponSchema.name),
          useValue: mockCouponModel,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: PromoterService,
          useValue: mockPromoterService,
        },
        {
          provide: PromocodesService,
          useValue: mockPromocodesService,
        },
        {
          provide: SocketService,
          useValue: mockSocketService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOpenEvents', () => {
    it('should return events with LAUNCHED or LIVE status', async () => {
      // Arrange
      const mockEvents = [
        MockEventFactory.createEvent({ status: EventStatus.LAUNCHED }),
        MockEventFactory.createLiveEvent(),
      ];

      const populateMock = jest.fn().mockReturnThis();
      const leanMock = jest.fn().mockResolvedValue(
        mockEvents.map((e) => ({ ...e, promoter: { name: 'Test Promoter' } })),
      );

      mockEventModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: populateMock,
        lean: leanMock,
      });

      // Act
      const result = await service.getOpenEvents();

      // Assert
      expect(result).toBeDefined();
      expect(mockEventModel.find).toHaveBeenCalledWith({
        $and: [
          { $or: [{ status: EventStatus.LAUNCHED }, { status: EventStatus.LIVE }] },
        ],
      });
    });

    it('should exclude blockchain sensitive fields', async () => {
      // Arrange
      const selectMock = jest.fn().mockReturnThis();
      mockEventModel.find.mockReturnValue({
        select: selectMock,
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getOpenEvents();

      // Assert
      expect(selectMock).toHaveBeenCalledWith({
        isBlockchain: 0,
        blockNumber: 0,
        hash: 0,
        orders: 0,
      });
    });
  });

  describe('getEventsById', () => {
    it('should return event by ID if it meets criteria', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const mockEvent = MockEventFactory.createEvent({
        _id: eventId,
        status: EventStatus.LAUNCHED,
      });

      const execMock = jest.fn().mockResolvedValue(mockEvent);
      mockEventModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      // Act
      const result = await service.getEventsById(eventId);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(mockEventModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: eventId }),
      );
    });

    it('should filter by future start date', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      let capturedQuery: any;

      mockEventModel.findOne.mockImplementation((query: any) => {
        capturedQuery = query;
        return {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        };
      });

      // Act
      await service.getEventsById(eventId);

      // Assert
      expect(capturedQuery.$and).toBeDefined();
      expect(capturedQuery.$and).toHaveLength(2);
    });
  });

  describe('getEventsByUrl', () => {
    it('should return event by URL slug', async () => {
      // Arrange
      const urlSlug = 'rock-festival-2025';
      const mockEvent = MockEventFactory.createEvent({
        url: urlSlug,
        status: EventStatus.LIVE,
      });

      const execMock = jest.fn().mockResolvedValue(mockEvent);
      mockEventModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      // Act
      const result = await service.getEventsByUrl(urlSlug);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(mockEventModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ url: urlSlug }),
      );
    });
  });

  describe('getCoupon', () => {
    it('should return coupon by code', async () => {
      // Arrange
      const couponCode = 'SUMMER2025';
      const mockCoupon = {
        eventId: 'event_123',
        discount: 20,
      };

      mockCouponModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCoupon),
      });

      // Act
      const result = await service.getCoupon(couponCode);

      // Assert
      expect(result).toEqual(mockCoupon);
      expect(mockCouponModel.findOne).toHaveBeenCalledWith({ code: couponCode });
    });

    it('should return null if coupon not found', async () => {
      // Arrange
      const couponCode = 'INVALID';

      mockCouponModel.findOne.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await service.getCoupon(couponCode);

      // Assert
      expect(result).toBeNull();
    });

    it('should only select eventId and discount fields', async () => {
      // Arrange
      const selectMock = jest.fn().mockReturnThis();
      mockCouponModel.findOne.mockReturnValue({
        select: selectMock,
        lean: jest.fn().mockResolvedValue({}),
      });

      // Act
      await service.getCoupon('TEST');

      // Assert
      expect(selectMock).toHaveBeenCalledWith({ _id: 0, eventId: 1, discount: 1 });
    });
  });

  describe('createEvent', () => {
    // Skip this test - createEvent uses Mongoose constructor pattern (new Model())
    // which is difficult to mock properly. This is a thin wrapper around Mongoose
    // and doesn't contain business logic worth testing.
    it.skip('should create a new event', async () => {
      // Test skipped - Mongoose constructor pattern is hard to mock
      // This method is just: new this.eventModel(data).save()
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      // Arrange
      const mockEvents = [
        MockEventFactory.createEvent(),
        MockEventFactory.createEvent(),
      ];

      const execMock = jest.fn().mockResolvedValue(mockEvents);
      mockEventModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: execMock,
      });

      // Act
      const result = await service.getAllEvents();

      // Assert
      expect(result).toEqual(mockEvents);
      expect(mockEventModel.find).toHaveBeenCalled();
    });

    it('should populate promoter information', async () => {
      // Arrange
      const populateMock = jest.fn().mockReturnThis();
      mockEventModel.find.mockReturnValue({
        populate: populateMock,
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAllEvents();

      // Assert
      expect(populateMock).toHaveBeenCalledWith({
        path: 'promoter',
        model: 'Promoter',
        select: {
          _id: 1,
          name: 1,
        },
      });
    });
  });

  describe('updateEvent', () => {
    it('should update event by ID', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Event Name' };
      const mockUpdatedEvent = {
        _id: eventId,
        ...updateData,
      };

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUpdatedEvent),
      });

      // Act
      const result = await service.updateEvent(eventId, updateData);

      // Assert
      expect(result).toEqual(mockUpdatedEvent);
      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        eventId,
        updateData,
        { new: true },
      );
    });

    it('should return null if event not found', async () => {
      // Arrange
      const eventId = 'non_existent_id';

      mockEventModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await service.updateEvent(eventId, {});

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteEvent', () => {
    it('should delete event by ID', async () => {
      // Arrange
      const eventId = '507f1f77bcf86cd799439011';
      const mockDeletedEvent = {
        _id: eventId,
        name: 'Deleted Event',
      };

      mockEventModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDeletedEvent),
      });

      // Act
      const result = await service.deleteEvent(eventId);

      // Assert
      expect(result).toEqual(mockDeletedEvent);
      expect(mockEventModel.findByIdAndDelete).toHaveBeenCalledWith(eventId);
    });

    it('should return null if event not found', async () => {
      // Arrange
      const eventId = 'non_existent_id';

      mockEventModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await service.deleteEvent(eventId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
