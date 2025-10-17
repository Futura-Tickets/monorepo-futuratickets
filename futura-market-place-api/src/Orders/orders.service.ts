import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SERVICES
import { StripeService } from 'src/Stripe/stripe.service';

// SCHEMA
import { Orders as OrdersSchema, OrdersDocument } from './orders.schema';

// INTERFACES
import { CreateNewOrder, Order, UpdateOrder } from './orders.interface';

@Injectable()
export class OrdersService {

  constructor(
    @InjectModel(OrdersSchema.name) private ordersModel: Model<OrdersDocument>,
    private stripeService: StripeService
  ) {}

  public getOrderConfig(): string {
    return this.stripeService.publishableKey();
  };

  public async getOrdersByAccount(account: string): Promise<Order[] | undefined> {
    try {
      return this.ordersModel.find({ account }).populate({
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

  public async createOrder(createOrder: CreateNewOrder): Promise<Order | undefined> {
    try {
      return this.ordersModel.create(createOrder);
    } catch (error) {
      
    }
  }


  public async updateOrderById(orderId: string, updateOrder: UpdateOrder): Promise<void> {
    try {
      await this.ordersModel.findOneAndUpdate({ _id: orderId }, updateOrder);
    } catch (error) {
      
    }
  }

  public async updateOrdersById(orders: string[], updateOrder: UpdateOrder): Promise<void> {
    try {
      await this.ordersModel.updateMany({ _id: { $in: orders } }, updateOrder);
    } catch (error) {
    }
  }

  public async getOrdersByPaymentId(paymentId: string): Promise<Order[]> {
    return this.ordersModel.find({ paymentId }).populate({
      path: 'event',
      model: 'Event',
      select: { address: 1, promoter: 1, name: 1, description: 1, image: 1, resale: 1, url: 1, commission: 1 },
      populate: {
        path: 'promoter',
        model: 'Promoter',
        select: { name: 1 }
      }
    }).populate({
      path: 'account',
      model: 'Account',
      select: { name: 1, lastName: 1, email: 1 }
    }).populate({
      path: 'sales',
      model: 'Sales'
    });
  };

  public async getAccountOrders(accountId: string): Promise<Order[]> {
      return await this.ordersModel.find({ account: accountId }).populate({
        path: 'sales',
        model: 'Sales',
        select: {
          _id: 1,
          qrCode: 1,
          status: 1,
          tokenId: 1
        }
      }).populate({
        path: 'event',
          model: 'Event',
          select: {
            orders: 0,
            __v: 0,
            blockNumber: 0,
            hash: 0,
            isBlockchain: 0
          }
      }).sort({createdAt: 'desc'});
  }

  public async getOrdersWithCoupon(couponCode): Promise<Order[]> {
    return await this.ordersModel.find({ status: 'SUCCEEDED', couponCode: { $exists: true } });
  }

  public async getOrdersWithCouponCount(couponCode): Promise<number> {
    return await this.ordersModel.find({ status: 'SUCCEEDED', couponCode: { $exists: true } }).countDocuments();
  }

  public async getAllOrders(): Promise<Order[]> {
    return await this.ordersModel.find()
      .populate({
        path: 'account',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1 }
      })
      .populate({
        path: 'event',
        model: 'Event',
        select: { name: 1, dateTime: 1, location: 1 }
      })
      .populate({
        path: 'sales',
        model: 'Sales'
      })
      .sort({ createdAt: -1 })
      .exec();
  }

}