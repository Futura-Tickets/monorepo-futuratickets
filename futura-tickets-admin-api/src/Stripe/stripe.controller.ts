import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// SERVICES
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  private publishableKey: string;

  constructor(
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {
    this.publishableKey = this.configService.get('STRIPE_PUBLIC_KEY')!;
  }

  @Get('/config')
  getStripeConfig(): { config: string } {
    return { config: this.stripeService.publishableKey() };
  }
}
