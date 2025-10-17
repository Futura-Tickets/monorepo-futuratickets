import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

// AZURE
import { AzureStorageModule, AzureStorageService } from '@nestjs/azure-storage';

// MONGOOSE
import { Event, EventSchema, Coupon, CouponSchema, Promocode, PromocodeSchema } from './event.schema';

// BULL
import { BullModule } from '@nestjs/bull';

// CONTROLLERS
import { EventController } from './event.controller';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { MailModule } from 'src/Mail/mail.module';
import { OrdersModule } from 'src/Orders/orders.module';
import { PromoterModule } from 'src/Promoter/promoter.module';
// import { ProviderModule } from 'src/Provider/provider.module';
import { SalesModule } from 'src/Sales/sales.module';
import { SocketModule } from 'src/Socket/socket.module';
import { StripeModule } from 'src/Stripe/stripe.module';
import { NotificationModule } from 'src/Notifications/notifications.module';

// QUEUES
// import { CreateTicketProcessor, TicketMintProcessor, TicketResaleTransferProcessor, TicketTransferProcessor } from './event.processor';

// SERVICES
import { EventService } from './event.service';
import { PromocodesService } from './promocode.service';

@Module({
    imports: [
        AccountModule,
        AuthModule,
        AzureStorageModule.withConfig({
            sasKey: '?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-01T22:54:48Z&st=2024-01-01T14:54:48Z&spr=https,http&sig=2ZSvdwvKPtNdkgXPnzVsiD8v68WM%2BYEd9%2BvJ1s6Rdww%3D',
            accountName: 'lessommeliers',
            containerName: 'lessommeliers-blob-2',
        }),
        // BullModule.forRootAsync({
        //     imports: [ConfigModule],
        //     useFactory: async (configService: ConfigService) => ({
        //         redis: {
        //             username: configService.get('REDIS_USERNAME'),
        //             password: configService.get('REDIS_PASSWORD'),
        //             host: configService.get('REDIS_HOST'),
        //             port: configService.get('REDIS_PORT')
        //         },
        //       }),
        //     inject: [ConfigService],
        // }),
        // BullModule.registerQueue(
        //     { name: 'create-order' },
        //     { name: 'ticket-mint' },
        //     { name: 'ticket-resale-transfer' },
        //     { name: 'ticket-transfer' },
        //     { name: 'ticket-access' }
        // ),
        ConfigModule,
        MailModule,
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema, collection: 'events' }]),
        MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema, collection: 'coupons' }]),
        MongooseModule.forFeature([{ name: Promocode.name, schema: PromocodeSchema, collection: 'Promocode' }]),
        // MulterModule.registerAsync({
        //     imports: [ConfigModule],
        //     useFactory: async (configService: ConfigService) => ({
        //         dest: configService.get<string>('MULTER_DEST'),
        //     }),
        //     inject: [ConfigService],
        // }),
        OrdersModule,
        PromoterModule,
        // ProviderModule,
        SalesModule,
        SocketModule,
        StripeModule,
        NotificationModule,
    ],
    controllers: [
        EventController
    ],
    providers: [
        AzureStorageService,
        EventService,
        PromocodesService
    ],
    exports: [
        EventService,
        PromocodesService
    ]
})
export class EventModule {}