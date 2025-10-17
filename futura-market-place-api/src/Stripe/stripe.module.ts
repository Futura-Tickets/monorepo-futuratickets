import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// CONTROLLERS
import { StripeController } from './stripe.controller';

// SERVICES
import { StripeService } from './stripe.service';

// MODULES
import { OrdersModule } from '../Orders/orders.module';
import { SalesModule } from '../Sales/sales.module';
import { MailModule } from '../Mail/mail.module';

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => OrdersModule),
        forwardRef(() => SalesModule),
        forwardRef(() => MailModule)
    ],
    controllers: [StripeController],
    providers: [
        StripeService
    ],
    exports: [
        StripeService
    ]
})
export class StripeModule {}