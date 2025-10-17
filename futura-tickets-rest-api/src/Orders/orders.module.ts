import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Orders, OrdersSchema } from './orders.schema';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';

// SERVICES
import { SalesModule } from 'src/Sales/sales.module';

@Module({
    imports: [
        AuthModule,
        AccountModule,
        ConfigModule,
        MongooseModule.forFeature([{ name: Orders.name, schema: OrdersSchema, collection: 'orders' }]),
        SalesModule,
    ],
    controllers: []
})
export class OrdersModule {}