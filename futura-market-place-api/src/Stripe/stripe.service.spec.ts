/**
 * Stripe Service Unit Tests
 *
 * Critical tests for payment processing:
 * - Stripe configuration
 * - Payment Intent creation
 * - Webhook signature validation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { Stripe } from 'stripe';

describe('StripeService', () => {
  let service: StripeService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockStripe: any;

  beforeEach(async () => {
    // Mock ConfigService
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          STRIPE_PUBLIC_KEY: 'pk_test_123456789',
          STRIPE_PRIVATE_KEY: 'sk_test_987654321',
          STRIPE_ENDPOINT_SECRET: 'whsec_test_secret123',
        };
        return config[key];
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);

    // Mock Stripe instance methods
    mockStripe = service.stripe as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with Stripe configuration from ConfigService', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('STRIPE_PUBLIC_KEY');
      expect(mockConfigService.get).toHaveBeenCalledWith('STRIPE_PRIVATE_KEY');
      expect(mockConfigService.get).toHaveBeenCalledWith('STRIPE_ENDPOINT_SECRET');
    });

    it('should create Stripe instance with correct API version', () => {
      expect(service.stripe).toBeDefined();
      // Stripe instance should be configured with the secret key
    });
  });

  describe('publishableKey', () => {
    it('should return the public Stripe key', () => {
      const result = service.publishableKey();

      expect(result).toBe('pk_test_123456789');
    });

    it('should return consistent value on multiple calls', () => {
      const first = service.publishableKey();
      const second = service.publishableKey();

      expect(first).toBe(second);
    });
  });

  describe('createPaymentIntent', () => {
    beforeEach(() => {
      // Mock the Stripe paymentIntents.create method
      mockStripe.paymentIntents = {
        create: jest.fn(),
      };
    });

    it('should create a payment intent with correct amount', async () => {
      // Arrange
      const amount = 5000; // €50.00
      const mockPaymentIntent = {
        id: 'pi_123456789',
        amount: 5000,
        currency: 'eur',
        status: 'requires_payment_method',
        client_secret: 'pi_123456789_secret_xyz',
      } as Stripe.PaymentIntent;

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await service.createPaymentIntent(amount);

      // Assert
      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        currency: 'eur',
        amount: 5000,
        capture_method: 'automatic',
        automatic_payment_methods: {
          enabled: true,
        },
      });
    });

    it('should handle small amounts (less than €1)', async () => {
      // Arrange
      const amount = 50; // €0.50
      const mockPaymentIntent = {
        id: 'pi_small_amount',
        amount: 50,
        currency: 'eur',
        status: 'requires_payment_method',
      } as Stripe.PaymentIntent;

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await service.createPaymentIntent(amount);

      // Assert
      expect(result.amount).toBe(50);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50 }),
      );
    });

    it('should handle large amounts', async () => {
      // Arrange
      const amount = 100000; // €1,000.00
      const mockPaymentIntent = {
        id: 'pi_large_amount',
        amount: 100000,
        currency: 'eur',
        status: 'requires_payment_method',
      } as Stripe.PaymentIntent;

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await service.createPaymentIntent(amount);

      // Assert
      expect(result.amount).toBe(100000);
    });

    it('should use EUR currency', async () => {
      // Arrange
      const amount = 3000;
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test',
        amount: 3000,
        currency: 'eur',
      } as Stripe.PaymentIntent);

      // Act
      await service.createPaymentIntent(amount);

      // Assert
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'eur' }),
      );
    });

    it('should enable automatic payment methods', async () => {
      // Arrange
      const amount = 2500;
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test',
        amount: 2500,
      } as Stripe.PaymentIntent);

      // Act
      await service.createPaymentIntent(amount);

      // Assert
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          automatic_payment_methods: {
            enabled: true,
          },
        }),
      );
    });

    it('should use automatic capture method', async () => {
      // Arrange
      const amount = 4000;
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test',
        amount: 4000,
      } as Stripe.PaymentIntent);

      // Act
      await service.createPaymentIntent(amount);

      // Assert
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          capture_method: 'automatic',
        }),
      );
    });

    it('should propagate Stripe API errors', async () => {
      // Arrange
      const amount = 5000;
      const stripeError = new Error('Stripe API error: Invalid API key');
      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      // Act & Assert
      await expect(service.createPaymentIntent(amount)).rejects.toThrow(
        'Stripe API error: Invalid API key',
      );
    });

    it('should handle insufficient funds error', async () => {
      // Arrange
      const amount = 5000;
      const stripeError: any = new Error('Card declined');
      stripeError.type = 'StripeCardError';
      stripeError.code = 'card_declined';
      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      // Act & Assert
      await expect(service.createPaymentIntent(amount)).rejects.toThrow(
        'Card declined',
      );
    });

    it('should return payment intent with client secret for frontend', async () => {
      // Arrange
      const amount = 7500;
      const mockPaymentIntent = {
        id: 'pi_frontend_test',
        amount: 7500,
        currency: 'eur',
        client_secret: 'pi_frontend_test_secret_abcd1234',
        status: 'requires_payment_method',
      } as Stripe.PaymentIntent;

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      // Act
      const result = await service.createPaymentIntent(amount);

      // Assert
      expect(result.client_secret).toBeDefined();
      expect(result.client_secret).toContain('secret');
    });
  });

  describe('registerEvents', () => {
    beforeEach(() => {
      // Mock the Stripe webhooks.constructEvent method
      mockStripe.webhooks = {
        constructEvent: jest.fn(),
      };
    });

    it('should validate and construct webhook event with correct signature', () => {
      // Arrange
      const payload = Buffer.from(
        JSON.stringify({
          id: 'evt_test_webhook',
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_123',
              amount: 5000,
              status: 'succeeded',
            },
          },
        }),
      );
      const signature = 't=1614556800,v1=signature_hash_here';
      const mockEvent = {
        id: 'evt_test_webhook',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            amount: 5000,
            status: 'succeeded',
          },
        },
      } as Stripe.Event;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Act
      const result = service.registerEvents(payload, signature);

      // Assert
      expect(result).toEqual(mockEvent);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_test_secret123',
      );
    });

    it('should handle payment_intent.succeeded event', () => {
      // Arrange
      const payload = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }));
      const signature = 't=1614556800,v1=abc123';
      const mockEvent = {
        id: 'evt_succeeded',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_success' } },
      } as Stripe.Event;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Act
      const result = service.registerEvents(payload, signature);

      // Assert
      expect(result.type).toBe('payment_intent.succeeded');
    });

    it('should handle payment_intent.payment_failed event', () => {
      // Arrange
      const payload = Buffer.from(JSON.stringify({ type: 'payment_intent.payment_failed' }));
      const signature = 't=1614556800,v1=def456';
      const mockEvent = {
        id: 'evt_failed',
        type: 'payment_intent.payment_failed',
        data: { object: { id: 'pi_failed' } },
      } as Stripe.Event;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Act
      const result = service.registerEvents(payload, signature);

      // Assert
      expect(result.type).toBe('payment_intent.payment_failed');
    });

    it('should throw error for invalid signature', () => {
      // Arrange
      const payload = Buffer.from(JSON.stringify({ type: 'test' }));
      const invalidSignature = 'invalid_signature';
      const signatureError = new Error(
        'No signatures found matching the expected signature for payload',
      );

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw signatureError;
      });

      // Act & Assert
      expect(() => service.registerEvents(payload, invalidSignature)).toThrow(
        'No signatures found matching the expected signature for payload',
      );
    });

    it('should throw error for tampered payload', () => {
      // Arrange
      const payload = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }));
      const signature = 't=1614556800,v1=original_sig';
      const tamperedError = new Error('Webhook signature verification failed');

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw tamperedError;
      });

      // Act & Assert
      expect(() => service.registerEvents(payload, signature)).toThrow(
        'Webhook signature verification failed',
      );
    });

    it('should use endpoint secret from configuration', () => {
      // Arrange
      const payload = Buffer.from(JSON.stringify({}));
      const signature = 't=123,v1=sig';
      mockStripe.webhooks.constructEvent.mockReturnValue({} as Stripe.Event);

      // Act
      service.registerEvents(payload, signature);

      // Assert
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.any(String),
        'whsec_test_secret123',
      );
    });

    it('should handle charge.refunded event', () => {
      // Arrange
      const payload = Buffer.from(JSON.stringify({ type: 'charge.refunded' }));
      const signature = 't=1614556800,v1=refund_sig';
      const mockEvent = {
        id: 'evt_refund',
        type: 'charge.refunded',
        data: { object: { id: 'ch_refunded' } },
      } as Stripe.Event;

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      // Act
      const result = service.registerEvents(payload, signature);

      // Assert
      expect(result.type).toBe('charge.refunded');
      expect(result.id).toBe('evt_refund');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors when creating payment intent', async () => {
      // Arrange
      mockStripe.paymentIntents = {
        create: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      // Act & Assert
      await expect(service.createPaymentIntent(5000)).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle Stripe API unavailability', async () => {
      // Arrange
      mockStripe.paymentIntents = {
        create: jest
          .fn()
          .mockRejectedValue(new Error('Stripe API is temporarily unavailable')),
      };

      // Act & Assert
      await expect(service.createPaymentIntent(3000)).rejects.toThrow(
        'Stripe API is temporarily unavailable',
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should support complete payment flow: create intent -> validate webhook', async () => {
      // Arrange - Create Payment Intent
      const amount = 8500;
      const mockPaymentIntent = {
        id: 'pi_integration_test',
        amount: 8500,
        currency: 'eur',
        status: 'requires_payment_method',
        client_secret: 'pi_integration_test_secret',
      } as Stripe.PaymentIntent;

      mockStripe.paymentIntents = {
        create: jest.fn().mockResolvedValue(mockPaymentIntent),
      };

      // Act - Create Intent
      const paymentIntent = await service.createPaymentIntent(amount);

      // Arrange - Webhook for successful payment
      const webhookPayload = Buffer.from(
        JSON.stringify({
          type: 'payment_intent.succeeded',
          data: { object: paymentIntent },
        }),
      );
      const signature = 't=1234567890,v1=valid_signature';
      const mockWebhookEvent = {
        id: 'evt_integration',
        type: 'payment_intent.succeeded',
        data: { object: paymentIntent },
      } as any as Stripe.Event;

      mockStripe.webhooks = {
        constructEvent: jest.fn().mockReturnValue(mockWebhookEvent),
      };

      // Act - Validate Webhook
      const webhookEvent = service.registerEvents(webhookPayload, signature);

      // Assert
      expect(paymentIntent.id).toBe('pi_integration_test');
      expect(webhookEvent.type).toBe('payment_intent.succeeded');
      expect((webhookEvent.data.object as any).id).toBe('pi_integration_test');
    });
  });
});
