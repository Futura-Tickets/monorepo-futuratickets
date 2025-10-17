import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { SalesModule } from 'src/Sales/sales.module';
import { SocketModule } from 'src/Socket/socket.module';

// CONTROLLERS
import { EventController } from './event.controller';

// SERVICES
import { EventService } from './event.service';
import { PromocodesService } from './promocode.service';

// SCHEMAS
import {
  Event,
  EventSchema,
  Invitation,
  InvitationSchema,
  Coupon,
  CouponSchema,
  Promocode,
  PromocodeSchema,
} from './event.schema';

@Module({
  controllers: [EventController],
  imports: [
    AccountModule,
    AuthModule,
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
        collection: 'promocodes',
      },
    ]),
    SalesModule,
    SocketModule,
  ],
  providers: [EventService, PromocodesService],
  exports: [EventService, PromocodesService],
})
export class EventModule {}
