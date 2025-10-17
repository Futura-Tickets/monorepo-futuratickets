import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// MONGOOSE
import { Model, UpdateWriteOpResult } from 'mongoose';

// SCHEMA
import { Sales as SalesSchema, SalesDocument } from './sales.schema';

// INTERFACES
import { Sale, SaleHistory, UpdateSale } from './sales.interface';
import { TicketStatus } from 'src/shared/interface';

@Injectable()
export class SalesService {

  constructor(
    @InjectModel(SalesSchema.name) private salesModel: Model<SalesDocument>
  ) {}

  public async getSale(promoter: string, saleId: string): Promise<Sale | null> {
    return await this.salesModel.findOne({ _id: saleId, promoter }).populate({
      path: 'client',
      model: 'Account',
      select: {
        name: 1, lastName: 1, email: 1, phone: 1
      }
    }).populate({
      path: 'event',
      model: 'Event',
      select: {
        name: 1, promoter: 1, address: 1, ticketImage: 1, dateTime: 1
      }
    });
  };

  public async getResales(sales: string[]): Promise<Sale[]> {
    return await this.salesModel.find({ _id: sales });
  };

  public async findSale(sale: string, client: string, status: TicketStatus): Promise<Sale | null> {
    return await this.salesModel.findOne({ _id: sale , client, status }).populate({
      path: 'client',
      model: 'Account'
    }).populate({
      path: 'event',
      model: 'Event'
    });
  }

  public async getSales(promoter: string): Promise<Sale[]> {
    return await this.salesModel.find({ promoter }).populate({
      path: 'event',
      model: 'Event',
      select: {
        name: 1, promoter: 1
      }
    }).populate({
      path: 'client',
      model: 'Account',
      select: { name: 1, lastName: 1, email: 1 },
    }).sort({ createdAt: 'desc' });

  };

  public async getEventResales(event: string): Promise<Sale[]> {
    return await this.salesModel.find({ event, status: TicketStatus.SALE }).populate({
      path: 'client',
      model: 'Account',
      select: { name: 1, lastName: 1, email: 1 },
    }).sort({ createdAt: 'desc' });
  };

  public async getAccessEvent(promoter: string, event: string): Promise<Sale[]> {
    return this.salesModel.find({ promoter, event, $or:[ { status: TicketStatus.CLOSED }, { status: TicketStatus.OPEN } ] });
  }

  public async updateSale(saleId: string, updateSale: UpdateSale): Promise<Sale | null> {
    return this.salesModel.findByIdAndUpdate({ _id: saleId }, updateSale);
  };

  public async updateSalesStatus(event: string, history: SaleHistory, status: TicketStatus): Promise<UpdateWriteOpResult> {
    return this.salesModel.updateMany({ event, $or: [{ status: TicketStatus.OPEN }, { status: TicketStatus.SALE }] }, { $push: {history, status }});
  };

  public async accessEvent(promoter: string, sale: string): Promise<void | null> {
    return this.salesModel.findOne({ _id: sale, promoter }, { status: TicketStatus.CLOSED });
  };

  public async checkTicketStatus(promoter: string, sale: string): Promise<Sale | null> {
    return this.salesModel.findOne({ _id: sale, promoter }).populate({
      path: 'client',
      model: 'Account',
      select: {
        name: 1, lastName: 1, email: 1
      }
    });
  };

}
