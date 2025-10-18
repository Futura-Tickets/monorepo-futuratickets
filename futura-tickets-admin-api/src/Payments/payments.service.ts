import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Payment, PaymentDocument, PaymentMethod, PaymentMethodDocument } from './payments.schema';

// INTERFACES
import { CreatePayment, Payment as IPayment } from './payments.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentMethod.name)
    private paymentMethodModel: Model<PaymentMethodDocument>,
    @InjectModel('Account') private accountModel: Model<any>,
  ) {}

  public async createPayment(createPaymentData: CreatePayment, promoter: string, account: string): Promise<IPayment> {
    const createPayment = { ...createPaymentData };

    const newPayment = new this.paymentModel({
      ...createPayment,
      promoter,
      account,
      date: createPayment.date,
    });

    return await newPayment.save();
  }

  public async getPayments(promoter: string): Promise<IPayment[]> {
    return await this.paymentModel
      .find({ promoter })
      .populate({
        path: 'account',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1 },
      })
      .populate({
        path: 'paymentMethod',
        model: 'PaymentMethod',
        select: { name: 1, type: 1, number: 1 },
      })
      .sort({ date: -1 });
  }

  public async getPayment(paymentId: string, promoter: string): Promise<IPayment | null> {
    try {
      return await this.paymentModel
        .findOne({ _id: paymentId, promoter })
        .populate({
          path: 'account',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1 },
        })
        .populate({
          path: 'paymentMethod',
          model: 'PaymentMethod',
          select: { name: 1, type: 1, number: 1 },
        });
    } catch (error) {
      return null;
    }
  }

  public async deletePayment(paymentId: string, promoter: string): Promise<boolean> {
    try {
      const result = await this.paymentModel.deleteOne({
        _id: paymentId,
        promoter,
      });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }
}
