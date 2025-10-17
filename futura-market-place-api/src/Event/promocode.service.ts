import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import {
  Promocode as PromocodeSchema,
  PromocodeDocument,
} from './event.schema';

// INTERFACES
import { Promocode } from 'src/shared/interface';

@Injectable()
export class PromocodesService {

  constructor(
    @InjectModel(PromocodeSchema.name) private promocodeModel: Model<PromocodeDocument>,
  ) {}

  public async getPromocodes(): Promise<Promocode[]> {
    return await this.promocodeModel.find();
  }

  public async getPromocodesByEventId(eventId: string): Promise<Promocode[]> {
    return await this.promocodeModel.find({ eventId });
  }

  public async getEventByPromocode(code: string): Promise<Promocode | null> {
    return await this.promocodeModel.findOne({ code }).select({ _id: 0, eventId: 1, code: 1}).lean();
  }

}