import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// MONGO
import { MongooseModule } from '@nestjs/mongoose';

// MODULES
import { AbstractionModule } from './Abstraction/abstraction.module';
import { AccountModule } from './Account/account.module';
import { EventModule } from './Event/event.module';
import { OrdersModule } from './Orders/orders.module';
import { PromoterModule } from './Promoter/promoter.module';

@Module({
  imports: [
    AbstractionModule,
    AccountModule,
    ConfigModule.forRoot(),
    EventModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URL')
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
    PromoterModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // @ts-ignore
      useFactory: (config: ConfigService) => [{
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
