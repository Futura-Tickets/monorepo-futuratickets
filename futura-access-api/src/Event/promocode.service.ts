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
    @InjectModel(PromocodeSchema.name)
    private promocodeModel: Model<PromocodeDocument>,
  ) {}

  public async createPromocode(promocode: Promocode): Promise<Promocode> {
    const newPromocode = new this.promocodeModel(promocode);
    return await newPromocode.save();
  }

  public async getPromocodes(): Promise<Promocode[]> {
    return await this.promocodeModel.find();
  }

  public async getPromocodesByEventId(eventId: string): Promise<Promocode[]> {
    return await this.promocodeModel.find({ eventId });
  }

  public async deletePromocode(
    eventId: string,
    code: string,
  ): Promise<boolean> {
    const result = await this.promocodeModel.deleteOne({ eventId, code });
    return result.deletedCount > 0;
  }
}
