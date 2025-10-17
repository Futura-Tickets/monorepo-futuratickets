import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// MONGO
import { MongooseModule } from '@nestjs/mongoose';

// MODULES
// import { AbstractionModule } from './Abstraction/abstraction.module'; // Temporarily disabled due to TypeScript errors
import { AccountModule } from './Account/account.module';
import { CronJobsModule } from './CronJobs/cron-jobs.module';
import { EventModule } from './Event/event.module';
import { HealthModule } from './Health/health.module';
import { LoggerModule } from './Logger/logger.module';
import { NotificationsModule } from './Notifications/notifications.module';
import { OrdersModule } from './Orders/orders.module';
import { PaymentsModule } from './Payments/payments.module';
import { PromoterModule } from './Promoter/promoter.module';
import { SocketModule } from './Socket/socket.module';
import { StripeModule } from './Stripe/stripe.module';

// HEXAGONAL MODULES (New Architecture)
import { SalesHexagonalModule } from '../src-hexagonal/sales/sales-hexagonal.module';

// FEATURE FLAGS
import { featureFlagsConfig } from './config/feature-flags.config';

// CONTROLLERS
import { AppController } from './app.controller';

// SERVICES
import { AppService } from './app.service';

@Module({
  imports: [
    // AbstractionModule, // Temporarily disabled due to TypeScript errors
    AccountModule,
    ConfigModule.forRoot({
      load: [featureFlagsConfig],
      isGlobal: true,
    }),
    CronJobsModule,
    EventModule,
    HealthModule,
    LoggerModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    OrdersModule,
    PromoterModule,
    PaymentsModule,
    SocketModule,
    StripeModule,

    // ============================================
    // HEXAGONAL ARCHITECTURE MODULES
    // ============================================
    // Durante la migración, ambos módulos (legacy y hexagonal)
    // coexisten. Los feature flags determinan cuál se usa.
    // Una vez completada la migración, se elimina el legacy.
    SalesHexagonalModule,

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
