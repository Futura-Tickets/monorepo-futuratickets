import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Orders, OrdersSchema } from './orders.schema';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { SocketModule } from 'src/Socket/socket.module';

// SERVICES
import { SalesModule } from 'src/Sales/sales.module';

@Module({
  imports: [
    AuthModule,
    AccountModule,

    ConfigModule,
    MongooseModule.forFeature([{ name: Orders.name, schema: OrdersSchema, collection: 'orders' }]),
    SalesModule,
    SocketModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class OrdersModule {}
