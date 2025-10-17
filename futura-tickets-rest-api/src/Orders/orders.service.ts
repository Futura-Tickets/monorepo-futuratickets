import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Orders as OrdersSchema, OrdersDocument } from './orders.schema';

// INTERFACES
import { Order } from './orders.interface';

@Injectable()
export class OrdersService {

  constructor(
    @InjectModel(OrdersSchema.name) private ordersModel: Model<OrdersDocument>
  ) {}

  public async getOrder(promoter: string, order: string): Promise<Order | null> {
    return this.ordersModel.findOne({ _id: order, promoter }).populate({
      path: 'account',
      model: 'Account',
      select: { name: 1, lastName: 1, email: 1, phone: 1 }
    }).populate({
      path: 'sales',
      model: 'Sales',
      populate: {
        path: 'client',
        model: 'Account',
        select: {
          name: 1, lastName: 1, email: 1
        }
      }
    });
  };

  public async getOrderByPaymentId(paymentId: string): Promise<Order | null> {
    return this.ordersModel.findOne({ paymentId }).populate({
      path: 'event',
      model: 'Event',
      select: { address: 1, promoter: 1, name: 1, description: 1, image: 1, resale: 1, url: 1 }
    }).populate({
      path: 'account',
      model: 'Account',
      select: { name: 1, lastName: 1, email: 1 }
    }).populate({
      path: 'sales',
      model: 'Sales'
    });
  };

  public async getOrdersByAccount(promoter: string): Promise<Order[] | undefined> {
    try {
      return this.ordersModel.find({ promoter }).populate({
        path: 'sales',
        model: 'Sales',
        populate: [
          {
            path: 'event',
            model: 'Event',
            select: {
              name: 1, promoter: 1, address: 1, ticketImage: 1, dateTime: 1
            }
          },
          {
            path: 'client',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1 }
          }
        ],
      }).sort({ createdAt: -1 });
    } catch (error) {
      
    }
  };


  public async updateOrderSales(order: string, sale: string): Promise<void> {
    try {
      await this.ordersModel.findByIdAndUpdate(order, { $push: { sales: sale }});
    } catch (error) {
      
    }
  }

}
