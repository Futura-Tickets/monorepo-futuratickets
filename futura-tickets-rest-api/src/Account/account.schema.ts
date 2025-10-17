import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import { Gender, Payment, Roles } from './account.interface';

@Schema({
  timestamps: true,
})
export class Account {

  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  lastName: string;

  @Prop()
  gender: Gender;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Promoter' })
  promoter: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Event', required: false })
  accessEvent: string;

  @Prop()
  accessPass: string;

  @Prop()
  address: string;

  @Prop()
  key: string;

  @Prop()
  mnemonic: string;

  @Prop({ required: true })
  role: Roles;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  payment: Payment;

  @Prop([{ type: mongoose.SchemaTypes.ObjectId, ref: 'Order', default: [] }])
  orders: string[];

  @Prop()
  password: string;

  @Prop({ default: true })
  registered: boolean;

  @Prop({ default: false })
  active: boolean;

}

export type AccountDocument = Account & mongoose.Document;
export const AccountSchema = SchemaFactory.createForClass(Account);
