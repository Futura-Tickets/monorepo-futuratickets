import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import { Resale, SaleHistory, BlockchainInfo } from './sales.interface';
import { TicketStatus } from 'src/shared/interface';

@Schema({
  timestamps: true,
})
export class Sales {
  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Account', required: true })
  client: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Event', required: true })
  event: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Order', required: true })
  order: string;

  @Prop({
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Promoter',
    required: true,
  })
  promoter: string;

  @Prop()
  tokenId: number;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  resale: Resale;

  @Prop()
  signature: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Sales' })
  isResale: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Sales' })
  isTransfer: string;

  @Prop({ default: false })
  isInvitation: boolean;

  @Prop()
  blockNumber: number;

  @Prop()
  hash: string;

  @Prop()
  qrCode: string;

  @Prop()
  history: SaleHistory[];

  @Prop({ required: true, default: TicketStatus.PENDING })
  status: TicketStatus;

  @Prop({ type: Object })
  blockchain: BlockchainInfo; // Complete blockchain transaction info
}

export type SalesDocument = Sales & mongoose.Document;
export const SalesSchema = SchemaFactory.createForClass(Sales);
