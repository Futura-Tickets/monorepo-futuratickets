import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// CONTROLLERS
import { PaymentsController } from './payments.controller';
import { PaymentMethodsController } from './payment-methods.controller';

// MONGOOSE
import {
  Payment,
  PaymentSchema,
  PaymentMethod,
  PaymentMethodSchema,
} from './payments.schema';
import { AccountSchema } from '../Account/account.schema';

// MODULES
import { AuthModule } from '../Auth/auth.module';
import { AccountModule } from '../Account/account.module';

// SERVICES
import { PaymentsService } from './payments.service';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  imports: [
    AccountModule,
    AuthModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema, collection: 'payments' },
      {
        name: PaymentMethod.name,
        schema: PaymentMethodSchema,
        collection: 'payment-methods',
      },
      { name: 'Account', schema: AccountSchema, collection: 'accounts' },
    ]),
  ],
  controllers: [PaymentsController, PaymentMethodsController],
  providers: [PaymentsService, PaymentMethodsService],
  exports: [PaymentsService, PaymentMethodsService],
})
export class PaymentsModule {}
