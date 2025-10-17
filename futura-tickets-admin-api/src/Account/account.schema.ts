import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import { AccountConfig, Gender, Payment, Roles } from './account.interface';

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

  @Prop({ type: String })
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
  smartAddress: string; // Smart Account address (Account Abstraction)

  @Prop()
  key: string; // Encrypted private key

  @Prop()
  mnemonic: string; // Encrypted mnemonic

  @Prop()
  walletAddress: string; // EOA wallet address (derived from key)

  @Prop({ default: false })
  isBlockchainEnabled: boolean; // Flag if user has blockchain features enabled

  @Prop({ type: String, required: true })
  role: Roles;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: Object })
  config: AccountConfig;

  @Prop()
  birthdate: Date;

  @Prop()
  phone: string;

  @Prop({ type: Object })
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
