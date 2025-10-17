import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PaymentStatus, PaymentMethodType } from './payments.interface';

@Schema({
  timestamps: true,
})
export class Payment {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Promoter',
    required: true,
  })
  promoter: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Account', required: true })
  account: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'PaymentMethod',
    required: true,
  })
  paymentMethod: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

export type PaymentDocument = Payment & mongoose.Document;
export const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema({
  timestamps: true,
})
export class PaymentMethod {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Promoter',
    required: true,
  })
  promoter: string;

  @Prop({ required: true })
  type: PaymentMethodType;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  number: string;

  @Prop({ type: Date })
  expiryDate: Date;
}

export type PaymentMethodDocument = PaymentMethod & mongoose.Document;
export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
