import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Orders, OrdersSchema } from './orders.schema';

// BULL
import { BullModule } from '@nestjs/bull';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { MailModule } from 'src/Mail/mail.module';
// import { SocketModule } from 'src/Socket/socket.module';
import { StripeModule } from 'src/Stripe/stripe.module';

// CONTROLLERS
import { OrdersController } from './orders.controller';

// QUEUES
import { ResaleProcessor, TransferProcessor } from './orders.processor';

// SERVICES
import { OrdersService } from './orders.service';
import { SalesModule } from 'src/Sales/sales.module';

@Module({
    imports: [
        AuthModule,
        AccountModule,
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    username: configService.get('REDIS_USERNAME'),
                    password: configService.get('REDIS_PASSWORD'),
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT')
                },
              }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue(
            { name: 'resale-ticket' },
            { name: 'transfer-ticket' }
        ),
        ConfigModule,
        MailModule,
        MongooseModule.forFeature([{ name: Orders.name, schema: OrdersSchema, collection: 'orders' }]),
        SalesModule,
        // SocketModule,
        StripeModule
    ],
    controllers: [
        // AdminOrdersController,
        OrdersController
    ],
    providers: [
        OrdersService,
        ResaleProcessor,
        TransferProcessor,
    ],
    exports: [
        OrdersService
    ]
})
export class OrdersModule {}