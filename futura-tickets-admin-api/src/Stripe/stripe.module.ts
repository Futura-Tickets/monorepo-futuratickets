import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// CONTROLLERS
import { StripeController } from './stripe.controller';

// SERVICES
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
