import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { PaymentMethod, PaymentMethodDocument } from './payments.schema';

// INTERFACES
import { CreatePaymentMethod, PaymentMethod as IPaymentMethod } from './payments.interface';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethodDocument>,
  ) {}

  public async createPaymentMethod(
    createPaymentMethod: CreatePaymentMethod,
    promoter: string,
  ): Promise<IPaymentMethod> {
    const newPaymentMethod = new this.paymentMethodModel({
      ...createPaymentMethod,
      promoter,
    });
    return await newPaymentMethod.save();
  }

  public async getPaymentMethods(promoter: string): Promise<IPaymentMethod[]> {
    return await this.paymentMethodModel.find({ promoter }).sort({ createdAt: -1 });
  }

  public async getPaymentMethod(paymentMethodId: string, promoter: string): Promise<IPaymentMethod | null> {
    try {
      return await this.paymentMethodModel.findOne({
        _id: paymentMethodId,
        promoter,
      });
    } catch (error) {
      return null;
    }
  }

  public async deletePaymentMethod(paymentMethodId: string, promoter: string): Promise<boolean> {
    try {
      const result = await this.paymentMethodModel.deleteOne({
        _id: paymentMethodId,
        promoter,
      });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }
}
