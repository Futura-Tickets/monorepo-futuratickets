import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

// GOOGLE CLOUD STORAGE
import { StorageModule } from '../Storage/storage.module';
import { StorageService } from '../Storage/storage.service';

// MONGOOSE
import {
  Coupon,
  CouponSchema,
  Event,
  EventSchema,
  Invitation,
  InvitationSchema,
  Promocode,
  PromocodeSchema,
} from './event.schema';

// BULL
// import { BullModule } from '@nestjs/bull'; // Temporarily disabled - Redis not available

// CONTROLLERS
import { AdminEventController } from './admin-event.controller';
import { UserEventController } from './user-event.controller';

// MODULES
import { AbstractionModule } from '../Abstraction/abstraction.module'; // Using stub module
import { AccountModule } from '../Account/account.module';
import { AuthModule } from '../Auth/auth.module';
import { MailModule } from '../Mail/mail.module';
import { OrdersModule } from '../Orders/orders.module';
import { PromoterModule } from '../Promoter/promoter.module';
import { ProviderModule } from '../Provider/provider.module';
import { NotificationsModule } from '../Notifications/notifications.module';
import { SalesModule } from '../Sales/sales.module';
import { SocketModule } from '../Socket/socket.module';
import { StripeModule } from '../Stripe/stripe.module';
import { WalletModule } from '../Wallet/wallet.module';
// import { BlockchainModule } from '../Blockchain/blockchain.module'; // Temporarily disabled

// QUEUES
// Processors temporarily disabled - Bull/Redis not available
// import {
//   CreateTicketProcessor,
//   TicketInvitationProcessor,
//   TicketMintProcessor,
//   TicketResaleTransferProcessor,
//   TicketTransferProcessor,
// } from './event.processor';

// SERVICES
import { AdminEventService } from './admin-event.service';
import { EventService } from './event.service';
import { InvitationsService } from './invitations.service';
import { UserEventService } from './user-event.service';

@Module({
  imports: [
    AbstractionModule, // Using stub module
    AccountModule,
    AuthModule,
    StorageModule,
    // BullModule.forRootAsync({ // Temporarily disabled - Redis not available
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     redis: {
    //       username: configService.get('REDIS_USERNAME'),
    //       password: configService.get('REDIS_PASSWORD'),
    //       host: configService.get('REDIS_HOST'),
    //       port: configService.get('REDIS_PORT'),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // BullModule.registerQueue( // Temporarily disabled - Redis not available
    //   { name: 'create-order' },
    //   { name: 'ticket-mint' },
    //   { name: 'ticket-resale-transfer' },
    //   { name: 'ticket-transfer' },
    //   { name: 'ticket-invitation' },
    //   { name: 'ticket-access' },
    // ),
    ConfigModule,
    MailModule,
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema, collection: 'events' },
      {
        name: Invitation.name,
        schema: InvitationSchema,
        collection: 'invitations',
      },
      { name: Coupon.name, schema: CouponSchema, collection: 'coupons' },
      {
        name: Promocode.name,
        schema: PromocodeSchema,
        collection: 'Promocode',
      },
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('MULTER_DEST'),
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    OrdersModule,
    PromoterModule,
    ProviderModule,
    SalesModule,
    SocketModule,
    StripeModule,
    WalletModule,
    // BlockchainModule, // Temporarily disabled
  ],
  controllers: [AdminEventController, UserEventController],
  providers: [
    AdminEventService,
    StorageService,
    // CreateTicketProcessor, // Temporarily disabled - Bull/Redis not available
    EventService,
    InvitationsService,
    // TicketInvitationProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketMintProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketResaleTransferProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketTransferProcessor, // Temporarily disabled - Bull/Redis not available
    UserEventService,
  ],
  exports: [EventService],
})
export class EventModule {}
