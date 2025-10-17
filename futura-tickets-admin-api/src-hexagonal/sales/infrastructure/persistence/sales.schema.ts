import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

/**
 * MongoDB Schema para Sales
 * Infrastructure Layer
 */

export type SalesDocument = Sales & Document;

@Schema({ timestamps: true })
export class Sales {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Orders', required: true })
  order: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  event: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account', required: true })
  client: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Promoter', required: true })
  promoter: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: null })
  qrCode: string | null;

  @Prop({ required: true, default: 'PENDING' })
  status: string;

  @Prop({ required: true, default: 'PENDING' })
  activity: string;

  @Prop({
    type: {
      isResale: { type: Boolean, default: false },
      resalePrice: { type: Number },
      resaleDate: { type: Date },
    },
    default: { isResale: false },
  })
  resale: {
    isResale: boolean;
    resalePrice?: number;
    resaleDate?: Date;
  };

  @Prop({
    type: {
      from: { type: String },
      to: { type: String },
      toEmail: { type: String },
      date: { type: Date },
    },
    default: null,
  })
  transfer: {
    from: string;
    to: string;
    toEmail?: string;
    date?: Date;
  } | null;

  @Prop({
    type: [
      {
        status: { type: String },
        activity: { type: String },
        date: { type: Date },
        description: { type: String },
      },
    ],
    default: [],
  })
  history: Array<{
    status: string;
    activity: string;
    date: Date;
    description?: string;
  }>;

  @Prop({ default: false })
  isInvitation: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const SalesSchema = SchemaFactory.createForClass(Sales);
