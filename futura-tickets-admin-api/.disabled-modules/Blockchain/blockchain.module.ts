import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { Event, EventSchema } from '../Event/event.schema';
import { Orders, OrdersSchema } from '../Orders/orders.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Orders.name, schema: OrdersSchema },
    ]),
  ],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
