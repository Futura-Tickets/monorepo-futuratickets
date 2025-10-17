import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Sales as SalesSchema, SalesDocument } from './sales.schema';

// INTERFACES
import { Sale, UpdateSale } from './sales.interface';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(SalesSchema.name) private salesModel: Model<SalesDocument>,
  ) {}

  public async updateSale(
    saleId: string,
    updateSale: UpdateSale,
  ): Promise<Sale | null> {
    return this.salesModel.findByIdAndUpdate({ _id: saleId }, updateSale);
  }

  public async checkTicketStatus(
    promoter: string,
    sale: string,
  ): Promise<Sale | null> {
    return this.salesModel.findOne({ _id: sale, promoter }).populate({
      path: 'client',
      model: 'Account',
      select: {
        name: 1,
        lastName: 1,
        email: 1,
      },
    });
  }
}
