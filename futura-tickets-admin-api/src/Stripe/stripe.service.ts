import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// STRIPE
import { Stripe } from 'stripe';

@Injectable()
export class StripeService {
  private stripePublicKey: string;
  private stripeSecretKey: string;
  private stripeEndpointSecret: string;
  public stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripePublicKey = configService.get('STRIPE_PUBLIC_KEY') || '';
    this.stripeSecretKey = configService.get('STRIPE_PRIVATE_KEY') || '';
    this.stripeEndpointSecret = configService.get('STRIPE_ENDPOINT_SECRET') || '';

    // Only initialize Stripe if secret key is provided
    if (this.stripeSecretKey) {
      this.stripe = new Stripe(this.stripeSecretKey, {
        apiVersion: '2024-11-20.acacia',
      });
    } else {
      console.warn('⚠️  STRIPE_PRIVATE_KEY not configured. Payment processing will be disabled.');
    }
  }

  public publishableKey(): string {
    return this.stripePublicKey;
  }

  public async createPaymentIntent(amount: number): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    return await this.stripe.paymentIntents.create({
      currency: 'eur',
      amount,
      capture_method: 'automatic',
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  public registerEvents(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, this.stripeEndpointSecret);
  }
}
