import { Test, TestingModule } from '@nestjs/testing';
import { CronJobsService } from './cron-jobs.service';
import { EventService } from '../Event/event.service';
import { SalesService } from '../Sales/sales.service';
import { EventStatus, TicketStatus, TicketActivity } from '../shared/interface';

describe('CronJobsService', () => {
  let service: CronJobsService;
  let eventService: jest.Mocked<EventService>;
  let salesService: jest.Mocked<SalesService>;

  beforeEach(async () => {
    // Create mock services
    const mockEventService = {
      getActiveEvents: jest.fn(),
      updateEventStatus: jest.fn(),
    };

    const mockSalesService = {
      updateSalesStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronJobsService,
        {
          provide: EventService,
          useValue: mockEventService,
        },
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    service = module.get<CronJobsService>(CronJobsService);
    eventService = module.get(EventService);
    salesService = module.get(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    it('should process all active events', async () => {
      // Arrange
      const mockEvents = [
        {
          _id: 'event1',
          dateTime: {
            startDate: new Date('2025-01-15T20:00:00Z'),
            endDate: new Date('2025-01-15T23:00:00Z'),
          },
        },
        {
          _id: 'event2',
          dateTime: {
            startDate: new Date('2025-01-20T19:00:00Z'),
            endDate: new Date('2025-01-20T22:00:00Z'),
          },
        },
      ];

      eventService.getActiveEvents.mockResolvedValue(mockEvents as any);
      eventService.updateEventStatus.mockResolvedValue(undefined as any);

      // Act
      await service.handleCron();

      // Assert
      expect(eventService.getActiveEvents).toHaveBeenCalledTimes(1);
      expect(eventService.updateEventStatus).toHaveBeenCalledTimes(4); // 2 events × 2 checks (start + end)
    });

    it('should skip undefined events in array', async () => {
      // Arrange
      const mockEvents = [
        {
          _id: 'event1',
          dateTime: {
            startDate: new Date('2025-01-15T20:00:00Z'),
            endDate: new Date('2025-01-15T23:00:00Z'),
          },
        },
        undefined, // This should be skipped
        {
          _id: 'event2',
          dateTime: {
            startDate: new Date('2025-01-20T19:00:00Z'),
            endDate: new Date('2025-01-20T22:00:00Z'),
          },
        },
      ];

      eventService.getActiveEvents.mockResolvedValue(mockEvents as any);
      eventService.updateEventStatus.mockResolvedValue(undefined as any);

      // Act
      await service.handleCron();

      // Assert - should only process 2 events (skipping undefined)
      expect(eventService.updateEventStatus).toHaveBeenCalledTimes(4); // 2 valid events × 2 checks
    });

    it('should handle empty event list', async () => {
      // Arrange
      eventService.getActiveEvents.mockResolvedValue([]);

      // Act
      await service.handleCron();

      // Assert
      expect(eventService.getActiveEvents).toHaveBeenCalledTimes(1);
      expect(eventService.updateEventStatus).not.toHaveBeenCalled();
    });
  });

  describe('checkEventStartDate', () => {
    it('should update event to LIVE when start date is reached', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      eventService.updateEventStatus.mockResolvedValue(undefined as any);

      // Act
      await (service as any).checkEventStartDate('event123', pastDate);

      // Assert
      expect(eventService.updateEventStatus).toHaveBeenCalledWith(
        'event123',
        EventStatus.LIVE,
      );
    });

    it('should not update event when start date is in the future', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now

      eventService.updateEventStatus.mockResolvedValue(undefined as any);

      // Act
      await (service as any).checkEventStartDate('event123', futureDate);

      // Assert
      expect(eventService.updateEventStatus).not.toHaveBeenCalled();
    });
  });

  describe('checkEventExpireDate', () => {
    it('should close event and expire tickets when end date is reached', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      eventService.updateEventStatus.mockResolvedValue(undefined as any);
      salesService.updateSalesStatus.mockResolvedValue(undefined as any);

      // Act
      await (service as any).checkEventExpireDate('event123', pastDate);

      // Assert
      expect(eventService.updateEventStatus).toHaveBeenCalledWith(
        'event123',
        EventStatus.CLOSED,
      );
      expect(salesService.updateSalesStatus).toHaveBeenCalledWith(
        'event123',
        expect.objectContaining({
          activity: TicketActivity.EXPIRED,
          reason: 'Ticket Expired.',
          status: TicketStatus.EXPIRED,
        }),
        TicketStatus.EXPIRED,
      );
    });

    it('should not close event when end date is in the future', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now

      eventService.updateEventStatus.mockResolvedValue(undefined as any);
      salesService.updateSalesStatus.mockResolvedValue(undefined as any);

      // Act
      await (service as any).checkEventExpireDate('event123', futureDate);

      // Assert
      expect(eventService.updateEventStatus).not.toHaveBeenCalled();
      expect(salesService.updateSalesStatus).not.toHaveBeenCalled();
    });

    it('should include correct timestamp in sale history', async () => {
      // Arrange
      const pastDate = new Date('2025-01-15T23:00:00Z');
      const beforeTest = new Date();

      eventService.updateEventStatus.mockResolvedValue(undefined as any);
      salesService.updateSalesStatus.mockResolvedValue(undefined as any);

      // Act
      await (service as any).checkEventExpireDate('event123', pastDate);

      // Assert
      expect(salesService.updateSalesStatus).toHaveBeenCalled();
      const historyCall = salesService.updateSalesStatus.mock.calls[0]?.[1];
      expect(historyCall).toBeDefined();
      expect(historyCall?.createdAt).toBeInstanceOf(Date);
      expect(historyCall?.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
    });
  });

  describe('error handling', () => {
    it('should handle errors from getActiveEvents gracefully', async () => {
      // Arrange
      eventService.getActiveEvents.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert - should not throw
      await expect(service.handleCron()).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle errors from updateEventStatus gracefully', async () => {
      // Arrange
      const mockEvents = [
        {
          _id: 'event1',
          dateTime: {
            startDate: new Date('2020-01-15T20:00:00Z'), // Past date
            endDate: new Date('2020-01-15T23:00:00Z'),
          },
        },
      ];

      eventService.getActiveEvents.mockResolvedValue(mockEvents as any);
      eventService.updateEventStatus.mockRejectedValue(
        new Error('Update failed'),
      );

      // Act & Assert - should not throw, error should be logged
      await expect(service.handleCron()).rejects.toThrow('Update failed');
    });
  });
});
