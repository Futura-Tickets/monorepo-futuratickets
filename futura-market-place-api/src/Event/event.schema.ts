import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import { Artist, Condition, DateTime, EventStatus, Location, Resale, Ticket } from '../shared/interface';

@Schema({
  timestamps: true,
})
export class Event {

  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Promoter', required: true })
  promoter: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  ticketImage: string;

  @Prop({ required: true })
  maxQuantity: number;

  @Prop({ required: true })
  availableTickets: number;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  commission: number;

  @Prop({ required: true })
  resale: Resale;

  @Prop({ default: []})
  artists: Artist[];

  @Prop({ required: true })
  location: Location;

  @Prop({ required: true })
  dateTime: DateTime;

  @Prop({ default: []})
  conditions: Condition[];

  @Prop({ default: true })
  isBlockchain: boolean;

  @Prop({ default: 0 })
  views: number;

  @Prop()
  address: string;

  @Prop()
  blockNumber: number;

  @Prop()
  hash: string;

  @Prop()
  url: string;

  @Prop()
  tickets: Ticket[];

  @Prop([{ type: mongoose.SchemaTypes.ObjectId, ref: 'Orders', default: [] }])
  orders: string[];

  @Prop([{ type: mongoose.SchemaTypes.ObjectId, ref: 'Coupon', default: [] }])
  coupons: string[];

  @Prop({ default: EventStatus.CREATED })
  status: EventStatus;

  @Prop()
  ticketLots: TicketLot[];

};

export class TicketLot {
  type: string;
  ticketLotItems: {
    amount: number;
    price: number;
    status: boolean;
  }[]
}

export class Coupon {

  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;
  
  @Prop({ required: true })
  code: string;
  
  @Prop({ required: true })
  discount: number;
  
  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Event', required: true })
  eventId: string;
  
  @Prop({ required: true, default: Date.now })
  created: Date;
  
  @Prop({ required: true })
  expiryDate: Date;
  
  @Prop({ required: true, default: 1 })
  maxUses: number;

}

export class Promocode {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Event', required: true })
  eventId: string;

  @Prop({ required: true, default: Date.now })
  created: Date;
}

export type EventDocument = Event & mongoose.Document;
export const EventSchema = SchemaFactory.createForClass(Event);

export type CouponDocument = Coupon & mongoose.Document;
export const CouponSchema = SchemaFactory.createForClass(Coupon);

export type PromocodeDocument = Promocode & mongoose.Document;
export const PromocodeSchema = SchemaFactory.createForClass(Promocode);

EventSchema.index({ orders: 1 });