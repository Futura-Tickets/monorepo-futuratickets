import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import {
  Artist,
  Condition,
  DateTime,
  EventStatus,
  Location,
  Resale,
  Ticket,
} from '../shared/interface';

@Schema({
  timestamps: true,
})
export class Event {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Promoter',
    required: true,
  })
  promoter: string;

  @Prop([{ type: mongoose.SchemaTypes.ObjectId, ref: 'Coupon', default: [] }])
  coupons: string[];

  @Prop([
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Invitation',
      default: [],
    },
  ])
  invitations: string[];

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
  capacity: number;

  @Prop({ required: true })
  commission: number;

  @Prop({ required: true })
  resale: Resale;

  @Prop({ default: [] })
  artists: Artist[];

  @Prop({ required: true })
  location: Location;

  @Prop({ required: true })
  dateTime: DateTime;

  @Prop({ default: [] })
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

  @Prop({ default: EventStatus.CREATED })
  status: EventStatus;
}

export type EventDocument = Event & mongoose.Document;
export const EventSchema = SchemaFactory.createForClass(Event);

@Schema({
  timestamps: true,
})
export class Invitation {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true, default: Date.now })
  created: Date;
}

export type InvitationDocument = Invitation & mongoose.Document;
export const InvitationSchema = SchemaFactory.createForClass(Invitation);

@Schema({
  timestamps: true,
})
export class Coupon {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true, unique: true })
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

export type CouponDocument = Coupon & mongoose.Document;
export const CouponSchema = SchemaFactory.createForClass(Coupon);

@Schema({
  timestamps: true,
})
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

export type PromocodeDocument = Promocode & mongoose.Document;
export const PromocodeSchema = SchemaFactory.createForClass(Promocode);
