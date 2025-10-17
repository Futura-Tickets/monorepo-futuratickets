import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model, UpdateWriteOpResult } from 'mongoose';

// SCHEMA
import { Sales as SalesSchema, SalesDocument } from './sales.schema';

// INTERFACES
import { CreateSale, Sale, SaleHistory, UpdateSale } from './sales.interface';
import { TicketStatus } from 'src/shared/interface';

@Injectable()
export class SalesService {

  constructor(
    @InjectModel(SalesSchema.name) private salesModel: Model<SalesDocument>
  ) {}

  public async getSale(promoter: string, saleId: string): Promise<Sale | null> {
    return await this.salesModel.findOne({ _id: saleId, promoter })
  };

  public async getSalesByIds(saleIds: string[]): Promise<Sale[] | null> {
    return await this.salesModel.find({ _id: { $in: saleIds } }).lean().populate({
      path: 'sales',
      model: 'Sales',
      options: {
        sort: {
          createdAt: 'desc'
        }
      }
    });
  }
  
  public async getSalesByEventId(skip: number, limit: number, eventId: string): Promise<any[] | null> {
    const startTime = performance.now();
    const query = await this.salesModel.find({ event: eventId }).populate(
      [{
        path: 'client',
        model: 'Account',
        select: {
          name: 1,
          lastName: 1,
          email: 1,
          _id: 0
        }
      },{
        path: 'event',
        model: 'Event',
        select: {
          name: 1,
          _id: 0
        }
      },{
        path: 'order',
        model: 'Orders',
        select: {
          status: 1,
          _id: 0
        }
      },{
        path: 'promoter',
        model: 'Promoter',
        select: {
          name: 1,
          _id: 0
        }
      }]
    ).select({
      __v: 0,
      _id: 0,
      history: 0,
      qrCode: 0,
      blockNumber: 0,
      hash: 0,
      tokenId: 0
    }).sort({createdAt: 'desc' })
    .skip(skip)
    .limit(limit)
    .lean();

    const totalSales = await this.salesModel.where({ event: eventId }).countDocuments();

    const flattenedSales = await query.map(item => {
      const { client, event, order, promoter, ...rest } = item;
      if (client != null) {
        return {
          client_name: client["name"],
          client_lastName: client["lastName"],
          client_email: client["email"],
          event: event["name"],
          promoter: promoter["name"],
          ...rest
        };
      } else {
        return {
          client_name: 'undefined',
          client_lastName: 'undefined',
          client_email: 'undefined',
          event: event["name"],
          promoter: promoter["name"],
          ...rest
        };
      }
    });

    const endTime = performance.now();
    console.log(`Time: ${endTime - startTime} ms`);
    return [flattenedSales, totalSales];
  }

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
    })
    .populate({
      path: 'event',
      model: 'Event',
      select: {
        orders: 0,
        __v: 0,
        blockNumber: 0,
        hash: 0,
        isBlockchain: 0
      }
    })
    .sort({ createdAt: 'desc' });
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

  public async createSale(createSale: CreateSale): Promise<Sale> {
    return this.salesModel.create(createSale);
  };

  public async createSales(createSale: CreateSale[]): Promise<Sale[]> {
    return this.salesModel.create(createSale);
  };

  public async accessEvent(promoter: string, sale: string): Promise<Sale | null> {
    return this.salesModel.findOneAndUpdate(
      { _id: sale, promoter },
      { status: TicketStatus.CLOSED },
      { new: true }
    );
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

  public async getEventSales(eventId: string): Promise<number> {
    return await this.salesModel.where({ event: eventId }).countDocuments();
  };

  public async getEventSalesByType(eventId: string, type: string): Promise<number> {
    return await this.salesModel.find({ $and: [{ event: eventId }, { type }] }).countDocuments();
  }

  public async getEventSalesByAccount(account: string, eventId: string): Promise<number> {
    return await this.salesModel.where({ $and: [{ client: account }, { event: eventId }] }).countDocuments();
  };

  public async getAccountSales(accountId: string): Promise<Sale[]> {
    return await this.salesModel.find({ client: accountId, status: { $nin: 'PENDING' } }).populate({
      path: 'event',
      model: 'Event',
      select: {
        _id: 1,
        name: 1,
        location: 1,
        image: 1,
        resale: 1
      }
    }).populate({
      path: 'promoter',
      model: 'Promoter',
      select: {
        _id: 0,
        name: 1
      }
    }).select({
      _id: 1,
      type: 1,
      price: 1,
      qrCode: 1,
      status: 1,
      tokenId: 1,
      createdAt: 1
    }).sort({ createdAt: 'desc' });
  }

}