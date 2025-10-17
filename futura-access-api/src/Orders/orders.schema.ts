import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import { Item, ContactDetails, OrderStatus } from './orders.interface';

@Schema({
  timestamps: true,
})
export class Orders {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Account', required: true })
  account: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Event', required: true })
  event: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Promoter',
    required: true,
  })
  promoter: string;

  @Prop({ default: [] })
  items: Item[];

  @Prop({ default: [] })
  resaleItems: Item[];

  @Prop([{ type: mongoose.SchemaTypes.ObjectId, ref: 'Sales', default: [] }])
  sales: string[];

  @Prop()
  paymentId: string;

  @Prop({ required: true })
  contactDetails: ContactDetails;

  @Prop({ required: true, default: OrderStatus.PENDING })
  status: OrderStatus;
}

export type OrdersDocument = Orders & mongoose.Document;
export const OrdersSchema = SchemaFactory.createForClass(Orders);
