import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { APISettings } from './promoter.interface';

@Schema({
  timestamps: true,
})
export class Promoter {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  mnemonic: string;

  @Prop()
  image: string;

  @Prop()
  icon: string;

  @Prop([{ type: mongoose.SchemaTypes.ObjectId, ref: 'Event', default: [] }])
  events: string[];

  @Prop([
    { type: mongoose.SchemaTypes.ObjectId, ref: 'PromoterClient', default: [] },
  ])
  clients: string[];

  @Prop()
  api: APISettings;
}

export type PromoterDocument = Promoter & mongoose.Document;
export const PromoterSchema = SchemaFactory.createForClass(Promoter);

@Schema({
  timestamps: true,
})
export class PromoterClient {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Account', required: true })
  client: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Promoter',
    required: true,
  })
  promoter: string;
}

export type PromoterClientDocument = PromoterClient & mongoose.Document;
export const PromoterClientSchema =
  SchemaFactory.createForClass(PromoterClient);
