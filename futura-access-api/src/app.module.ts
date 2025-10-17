import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// MODULES
import { AccountModule } from './Account/account.module';
import { EventModule } from './Event/event.module';
import { HealthModule } from './Health/health.module';
import { LoggerModule } from './Logger/logger.module';
import { PromoterModule } from './Promoter/promoter.module';
import { NotificationsModule } from './Notifications/notifications.module';
import { OrdersModule } from './Orders/orders.module';

@Module({
  imports: [
    AccountModule,
    ConfigModule.forRoot(),
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // @ts-ignore
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
