import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

// INTERFACES
import { NotificationType } from './notifications.interface';

@Schema({
  timestamps: true,
})
export class Notification {

  @Prop({ type: mongoose.SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  type: NotificationType;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Promoter', required: true })
  promoter: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Account', required: true })
  userId: string;

  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Order' })
  orderId: string;
  
  @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Event' })
  eventId: string;

  @Prop({ default: [], required: true })
  readBy: string[];

  @Prop({ default: false, required: true })
  read: boolean;
}

export type NotificationDocument = Notification & mongoose.Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
