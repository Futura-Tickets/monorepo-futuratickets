import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Orders as OrdersSchema, OrdersDocument } from './orders.schema';

// SERVICES
import { MailService } from '../Mail/mail.service';
import { StripeService } from '../Stripe/stripe.service';

// INTERFACES
import { CreateOrder, Order, UpdateOrder } from './orders.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(OrdersSchema.name) private ordersModel: Model<OrdersDocument>,
    private mailService: MailService,
    private stripeService: StripeService,
  ) {}

  public async getOrder(order: string): Promise<Order | null> {
    return this.ordersModel.findOne({ _id: order });
  }

  public async getAdminOrder(
    promoter: string,
    order: string,
  ): Promise<Order | null> {
    return this.ordersModel
      .findOne({ _id: order, promoter })
      .populate({
        path: 'account',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, phone: 1 },
      })
      .populate({
        path: 'sales',
        model: 'Sales',
        populate: {
          path: 'client',
          model: 'Account',
          select: {
            name: 1,
            lastName: 1,
            email: 1,
          },
        },
      });
  }

  public async getOrdersByPaymentId(paymentId: string): Promise<Order[]> {
    return this.ordersModel
      .find({ paymentId })
      .populate({
        path: 'event',
        model: 'Event',
        select: {
          address: 1,
          promoter: 1,
          name: 1,
          description: 1,
          image: 1,
          resale: 1,
          url: 1,
        },
      })
      .populate({
        path: 'account',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1 },
      })
      .populate({
        path: 'sales',
        model: 'Sales',
      });
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    return this.ordersModel
      .findOne({ _id: orderId })
      .populate({
        path: 'event',
        model: 'Event',
        select: {
          address: 1,
          promoter: 1,
          name: 1,
          description: 1,
          image: 1,
          resale: 1,
          url: 1,
        },
      })
      .populate({
        path: 'account',
        model: 'Account',
      })
      .populate({
        path: 'sales',
        model: 'Sales',
        populate: {
          path: 'client',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
        },
      });
  }

  public getOrderConfig(): string {
    return this.stripeService.publishableKey();
  }

  public async getOrdersByAccount(
    account: string,
  ): Promise<Order[] | undefined> {
    try {
      return this.ordersModel
        .find({ account })
        .populate({
          path: 'sales',
          model: 'Sales',
          populate: [
            {
              path: 'event',
              model: 'Event',
              select: {
                name: 1,
                promoter: 1,
                address: 1,
                ticketImage: 1,
                dateTime: 1,
              },
            },
            {
              path: 'client',
              model: 'Account',
              select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
            },
          ],
        })
        .sort({ createdAt: -1 });
    } catch (error) {}
  }

  public async resendOrder(
    orderId: string,
    promoter: string,
  ): Promise<boolean> {
    const order = await this.ordersModel
      .findOne({ _id: orderId, promoter })
      .populate({
        path: 'event',
        model: 'Event',
        select: {
          address: 1,
          promoter: 1,
          name: 1,
          description: 1,
          image: 1,
          resale: 1,
          url: 1,
        },
      })
      .populate({
        path: 'account',
        model: 'Account',
      })
      .populate({
        path: 'sales',
        model: 'Sales',
      });
    if (!order) {
      console.log('Order not found resending order!');
      return false;
    }
    // Temporarily using direct email send instead of queue
    await this.mailService.sendOrderConfirmation(order);
    return true;
  }

  public async createOrder(
    createOrder: CreateOrder,
  ): Promise<Order | undefined> {
    try {
      return this.ordersModel.create(createOrder);
    } catch (error) {}
  }

  public async updateOrderPaymentId(
    paymentId: string,
    updateOrder: UpdateOrder,
  ): Promise<void> {
    try {
      await this.ordersModel.findOneAndUpdate({ paymentId }, updateOrder);
    } catch (error) {}
  }

  public async updateOrderById(
    order: string,
    updateOrder: UpdateOrder,
  ): Promise<void> {
    try {
      await this.ordersModel.findOneAndUpdate({ _id: order }, updateOrder);
    } catch (error) {}
  }

  public async updateOrderSales(order: string, sale: string): Promise<void> {
    try {
      await this.ordersModel.findByIdAndUpdate(order, {
        $push: { sales: sale },
      });
    } catch (error) {}
  }
}
