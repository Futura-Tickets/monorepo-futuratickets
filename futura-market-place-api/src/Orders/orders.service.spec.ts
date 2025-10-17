/**
 * Orders Service Unit Tests
 *
 * Tests for order management including:
 * - Creating orders
 * - Fetching orders by account/paymentId
 * - Updating orders
 * - Coupon validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { Orders as OrdersSchema } from './orders.schema';
import { StripeService } from '../Stripe/stripe.service';
import { OrderStatus, CreateNewOrder, UpdateOrder } from './orders.interface';
import { mockRepository, MockOrderFactory } from '../../test/utils/test-setup';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrdersModel: any;
  let mockStripeService: jest.Mocked<Partial<StripeService>>;

  beforeEach(async () => {
    // Create mock Stripe service
    mockStripeService = {
      publishableKey: jest.fn().mockReturnValue('pk_test_123456'),
    };

    // Create mock Orders model
    mockOrdersModel = {
      ...mockRepository(),
      findOneAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(OrdersSchema.name),
          useValue: mockOrdersModel,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderConfig', () => {
    it('should return Stripe publishable key', () => {
      const result = service.getOrderConfig();

      expect(result).toBe('pk_test_123456');
      expect(mockStripeService.publishableKey).toHaveBeenCalled();
    });
  });

  describe('getOrdersByAccount', () => {
    it('should return orders for a specific account', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const mockOrders = [
        MockOrderFactory.createOrder({ account: accountId }),
        MockOrderFactory.createOrder({ account: accountId }),
      ];

      mockOrdersModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockOrders),
        }),
      });

      // Act
      const result = await service.getOrdersByAccount(accountId);

      // Assert
      expect(result).toEqual(mockOrders);
      expect(mockOrdersModel.find).toHaveBeenCalledWith({ account: accountId });
    });

    it('should return undefined and handle errors gracefully', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      mockOrdersModel.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      const result = await service.getOrdersByAccount(accountId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should populate sales with event and client details', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const populateMock = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });
      mockOrdersModel.find.mockReturnValue({
        populate: populateMock,
      });

      // Act
      await service.getOrdersByAccount(accountId);

      // Assert
      expect(populateMock).toHaveBeenCalledWith({
        path: 'sales',
        model: 'Sales',
        populate: [
          {
            path: 'event',
            model: 'Event',
            select: {
              name: 1,
              promoter: 1,
              address: 1,
              ticketImage: 1,
              dateTime: 1,
            },
          },
          {
            path: 'client',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1 },
          },
        ],
      });
    });

    it('should sort orders by createdAt descending', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const sortMock = jest.fn().mockResolvedValue([]);
      mockOrdersModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: sortMock,
        }),
      });

      // Act
      await service.getOrdersByAccount(accountId);

      // Assert
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      // Arrange
      const createOrderData: CreateNewOrder = {
        event: '507f1f77bcf86cd799439011',
        promoter: '507f1f77bcf86cd799439012',
        account: '507f1f77bcf86cd799439013',
        paymentId: 'pi_123456',
        items: [
          {
            type: 'General',
            amount: 2,
            price: 5000,
          },
        ],
        resaleItems: [],
        contactDetails: {
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthdate: new Date('1990-01-01'),
          phone: '+1234567890',
        },
        commission: 500,
        status: OrderStatus.PENDING,
      };

      const mockCreatedOrder = MockOrderFactory.createOrder(createOrderData);
      mockOrdersModel.create.mockResolvedValue(mockCreatedOrder);

      // Act
      const result = await service.createOrder(createOrderData);

      // Assert
      expect(result).toEqual(mockCreatedOrder);
      expect(mockOrdersModel.create).toHaveBeenCalledWith(createOrderData);
    });

    it('should return undefined when creation fails', async () => {
      // Arrange
      const createOrderData: CreateNewOrder = {
        event: '507f1f77bcf86cd799439011',
        promoter: '507f1f77bcf86cd799439012',
        items: [],
        contactDetails: {
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          birthdate: new Date('1990-01-01'),
        },
        commission: 0,
      };

      mockOrdersModel.create.mockImplementation(() => {
        throw new Error('Validation error');
      });

      // Act
      const result = await service.createOrder(createOrderData);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should create order with resale items', async () => {
      // Arrange
      const createOrderData: CreateNewOrder = {
        event: '507f1f77bcf86cd799439011',
        promoter: '507f1f77bcf86cd799439012',
        items: [],
        resaleItems: [
          {
            sale: '507f1f77bcf86cd799439020',
            type: 'VIP',
            amount: 1,
            price: 15000,
          },
        ],
        contactDetails: {
          name: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          birthdate: new Date('1992-05-15'),
        },
        commission: 1500,
      };

      const mockCreatedOrder = {
        ...MockOrderFactory.createOrder(createOrderData),
        resaleItems: createOrderData.resaleItems,
      };
      mockOrdersModel.create.mockResolvedValue(mockCreatedOrder);

      // Act
      const result = await service.createOrder(createOrderData);

      // Assert
      expect(result).toEqual(mockCreatedOrder);
      expect(mockOrdersModel.create).toHaveBeenCalledWith(createOrderData);
    });
  });

  describe('updateOrderById', () => {
    it('should update order status to SUCCEEDED', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const updateData: UpdateOrder = {
        status: OrderStatus.SUCCEEDED,
      };

      mockOrdersModel.findOneAndUpdate.mockResolvedValue({
        _id: orderId,
        status: OrderStatus.SUCCEEDED,
      });

      // Act
      await service.updateOrderById(orderId, updateData);

      // Assert
      expect(mockOrdersModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: orderId },
        updateData,
      );
    });

    it('should update order with payment ID', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const updateData: UpdateOrder = {
        paymentId: 'pi_987654321',
      };

      mockOrdersModel.findOneAndUpdate.mockResolvedValue({
        _id: orderId,
        paymentId: 'pi_987654321',
      });

      // Act
      await service.updateOrderById(orderId, updateData);

      // Assert
      expect(mockOrdersModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: orderId },
        updateData,
      );
    });

    it('should update order with sales array', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const updateData: UpdateOrder = {
        sales: ['sale1', 'sale2', 'sale3'],
      };

      mockOrdersModel.findOneAndUpdate.mockResolvedValue({
        _id: orderId,
        sales: ['sale1', 'sale2', 'sale3'],
      });

      // Act
      await service.updateOrderById(orderId, updateData);

      // Assert
      expect(mockOrdersModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: orderId },
        updateData,
      );
    });

    it('should handle update errors gracefully', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const updateData: UpdateOrder = {
        status: OrderStatus.SUCCEEDED,
      };

      mockOrdersModel.findOneAndUpdate.mockRejectedValue(
        new Error('Update failed'),
      );

      // Act & Assert
      await expect(
        service.updateOrderById(orderId, updateData),
      ).resolves.not.toThrow();
    });
  });

  describe('updateOrdersById', () => {
    it('should update multiple orders at once', async () => {
      // Arrange
      const orderIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
        '507f1f77bcf86cd799439013',
      ];
      const updateData: UpdateOrder = {
        status: OrderStatus.SUCCEEDED,
      };

      mockOrdersModel.updateMany.mockResolvedValue({
        modifiedCount: 3,
        matchedCount: 3,
      });

      // Act
      await service.updateOrdersById(orderIds, updateData);

      // Assert
      expect(mockOrdersModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: orderIds } },
        updateData,
      );
    });

    it('should handle empty order IDs array', async () => {
      // Arrange
      const orderIds: string[] = [];
      const updateData: UpdateOrder = {
        status: OrderStatus.SUCCEEDED,
      };

      mockOrdersModel.updateMany.mockResolvedValue({
        modifiedCount: 0,
        matchedCount: 0,
      });

      // Act
      await service.updateOrdersById(orderIds, updateData);

      // Assert
      expect(mockOrdersModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [] } },
        updateData,
      );
    });

    it('should handle bulk update errors gracefully', async () => {
      // Arrange
      const orderIds = ['507f1f77bcf86cd799439011'];
      const updateData: UpdateOrder = {
        status: OrderStatus.SUCCEEDED,
      };

      mockOrdersModel.updateMany.mockRejectedValue(
        new Error('Bulk update failed'),
      );

      // Act & Assert
      await expect(
        service.updateOrdersById(orderIds, updateData),
      ).resolves.not.toThrow();
    });
  });

  describe('getOrdersByPaymentId', () => {
    it('should return orders by Stripe payment ID', async () => {
      // Arrange
      const paymentId = 'pi_123456789';
      const mockOrders = [
        MockOrderFactory.createOrder({ paymentId }),
        MockOrderFactory.createOrder({ paymentId }),
      ];

      // Mock chain: find().populate().populate().populate()
      const thirdPopulate = jest.fn().mockResolvedValue(mockOrders);
      const secondPopulate = jest.fn().mockReturnValue({
        populate: thirdPopulate,
      });
      const firstPopulate = jest.fn().mockReturnValue({
        populate: secondPopulate,
      });

      mockOrdersModel.find.mockReturnValue({
        populate: firstPopulate,
      });

      // Act
      const result = await service.getOrdersByPaymentId(paymentId);

      // Assert
      expect(mockOrdersModel.find).toHaveBeenCalledWith({ paymentId });
      expect(result).toEqual(mockOrders);
    });

    it('should populate event with promoter details', async () => {
      // Arrange
      const paymentId = 'pi_123456789';

      // Mock chain: find().populate().populate().populate()
      const thirdPopulate = jest.fn().mockResolvedValue([]);
      const secondPopulate = jest.fn().mockReturnValue({
        populate: thirdPopulate,
      });
      const firstPopulateMock = jest.fn().mockReturnValue({
        populate: secondPopulate,
      });

      mockOrdersModel.find.mockReturnValue({
        populate: firstPopulateMock,
      });

      // Act
      await service.getOrdersByPaymentId(paymentId);

      // Assert
      expect(firstPopulateMock).toHaveBeenCalledWith({
        path: 'event',
        model: 'Event',
        select: {
          address: 1,
          promoter: 1,
          name: 1,
          description: 1,
          image: 1,
          resale: 1,
          url: 1,
          commission: 1,
        },
        populate: {
          path: 'promoter',
          model: 'Promoter',
          select: { name: 1 },
        },
      });
    });
  });

  describe('getAccountOrders', () => {
    it('should return orders for account with populated sales and event', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const mockOrders = [MockOrderFactory.createOrder({ account: accountId })];

      mockOrdersModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockOrders),
      });

      // Act
      const result = await service.getAccountOrders(accountId);

      // Assert
      expect(result).toEqual(mockOrders);
      expect(mockOrdersModel.find).toHaveBeenCalledWith({ account: accountId });
    });

    it('should sort orders by createdAt descending', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const sortMock = jest.fn().mockResolvedValue([]);
      mockOrdersModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: sortMock,
      });

      // Act
      await service.getAccountOrders(accountId);

      // Assert
      expect(sortMock).toHaveBeenCalledWith({ createdAt: 'desc' });
    });

    it('should exclude sensitive fields from event population', async () => {
      // Arrange
      const accountId = '507f1f77bcf86cd799439011';
      const populateMock = jest.fn().mockReturnThis();
      mockOrdersModel.find.mockReturnValue({
        populate: populateMock,
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAccountOrders(accountId);

      // Assert
      expect(populateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'event',
          model: 'Event',
          select: {
            orders: 0,
            __v: 0,
            blockNumber: 0,
            hash: 0,
            isBlockchain: 0,
          },
        }),
      );
    });
  });

  describe('getOrdersWithCoupon', () => {
    it('should return succeeded orders with coupon', async () => {
      // Arrange
      const couponCode = 'SUMMER2025';
      const mockOrders = [
        MockOrderFactory.createOrder({
          status: OrderStatus.SUCCEEDED,
          couponCode,
        }),
      ];

      mockOrdersModel.find.mockResolvedValue(mockOrders);

      // Act
      const result = await service.getOrdersWithCoupon(couponCode);

      // Assert
      expect(result).toEqual(mockOrders);
      expect(mockOrdersModel.find).toHaveBeenCalledWith({
        status: 'SUCCEEDED',
        couponCode: { $exists: true },
      });
    });

    it('should only return succeeded orders', async () => {
      // Arrange
      const couponCode = 'DISCOUNT10';

      mockOrdersModel.find.mockResolvedValue([]);

      // Act
      await service.getOrdersWithCoupon(couponCode);

      // Assert
      const callArg = mockOrdersModel.find.mock.calls[0][0];
      expect(callArg.status).toBe('SUCCEEDED');
    });
  });

  describe('getOrdersWithCouponCount', () => {
    it('should return count of succeeded orders with coupon', async () => {
      // Arrange
      const couponCode = 'EARLYBIRD';
      const expectedCount = 42;

      mockOrdersModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(expectedCount),
      });

      // Act
      const result = await service.getOrdersWithCouponCount(couponCode);

      // Assert
      expect(result).toBe(expectedCount);
      expect(mockOrdersModel.find).toHaveBeenCalledWith({
        status: 'SUCCEEDED',
        couponCode: { $exists: true },
      });
    });

    it('should return 0 if no orders with coupon exist', async () => {
      // Arrange
      const couponCode = 'INVALID';

      mockOrdersModel.find.mockReturnValue({
        countDocuments: jest.fn().mockResolvedValue(0),
      });

      // Act
      const result = await service.getOrdersWithCouponCount(couponCode);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders with populated data', async () => {
      // Arrange
      const mockOrders = [
        MockOrderFactory.createOrder(),
        MockOrderFactory.createOrder(),
        MockOrderFactory.createOrder(),
      ];

      mockOrdersModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      // Act
      const result = await service.getAllOrders();

      // Assert
      expect(result).toEqual(mockOrders);
      expect(mockOrdersModel.find).toHaveBeenCalledWith();
    });

    it('should populate account with minimal fields', async () => {
      // Arrange
      const populateMock = jest.fn().mockReturnThis();
      mockOrdersModel.find.mockReturnValue({
        populate: populateMock,
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAllOrders();

      // Assert
      expect(populateMock).toHaveBeenCalledWith({
        path: 'account',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1 },
      });
    });

    it('should populate event with specific fields', async () => {
      // Arrange
      const populateMock = jest.fn().mockReturnThis();
      mockOrdersModel.find.mockReturnValue({
        populate: populateMock,
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAllOrders();

      // Assert
      expect(populateMock).toHaveBeenCalledWith({
        path: 'event',
        model: 'Event',
        select: { name: 1, dateTime: 1, location: 1 },
      });
    });

    it('should sort by createdAt descending', async () => {
      // Arrange
      const sortMock = jest.fn().mockReturnThis();
      mockOrdersModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: sortMock,
        exec: jest.fn().mockResolvedValue([]),
      });

      // Act
      await service.getAllOrders();

      // Assert
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
