import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { DeleteResult, Model } from 'mongoose';

// SCHEMA
import {
  Coupon as CouponSchema,
  CouponDocument,
  Invitation as InvitationSchema,
  InvitationDocument,
  Promocode as PromocodeSchema,
  PromocodeDocument,
} from './event.schema';

// INTERFACES
import { Coupon, Promocode } from '../shared/interface';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(CouponSchema.name) private couponModel: Model<CouponDocument>,
    @InjectModel(InvitationSchema.name)
    private invitationModel: Model<InvitationDocument>,
    @InjectModel(PromocodeSchema.name)
    private promocodeModel: Model<PromocodeDocument>,
  ) {}

  // COUPON METHODS
  public async createCoupon(coupon: Coupon): Promise<Coupon> {
    const newCoupon = new this.couponModel(coupon);
    return await newCoupon.save();
  }

  public async getCoupons(): Promise<Coupon[]> {
    return await this.couponModel.find();
  }

  public async getCouponsByEventId(eventId: string): Promise<Coupon[]> {
    return await this.couponModel.find({ eventId });
  }

  public async deleteCoupon(eventId: string, code: string): Promise<DeleteResult> {
    return await this.couponModel.deleteOne({ eventId, code });
  }
  // PROMOCODE METHODS
  public async getPromocodes(): Promise<Promocode[]> {
    return await this.promocodeModel.find();
  }

  public async getPromocodesByEventId(eventId: string): Promise<Promocode[]> {
    return await this.promocodeModel.find({ eventId });
  }

  public async createPromocode(promocode: Promocode): Promise<Promocode> {
    const newPromocode = new this.promocodeModel(promocode);
    return await newPromocode.save();
  }

  public async deletePromocode(eventId: string, code: string): Promise<boolean> {
    const result = await this.promocodeModel.deleteOne({ eventId, code });
    return result.deletedCount > 0;
  }
}
