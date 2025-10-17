import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// MONGOOSE
import { Model } from 'mongoose';

// SERVICES
import { AccountService } from 'src/Account/account.service';
import { NotificationService } from 'src/Notifications/notifications.service';
import { OrdersService } from 'src/Orders/orders.service';
import { PromoterService } from 'src/Promoter/promoter.service';
import { PromocodesService } from 'src/Event/promocode.service';
import { SalesService } from 'src/Sales/sales.service';
import { SocketService } from 'src/Socket/socket.service';
import { StripeService } from 'src/Stripe/stripe.service';

// SCHEMA
import { Event as EventSchema, EventDocument, Coupon as CouponSchema, CouponDocument} from './event.schema';

// INTERFACES
import { Coupon, Event, EventStatus, Ticket, TicketActivity, TicketStatus } from 'src/shared/interface';
import { CreateOrder, Item, ContactDetails } from 'src/Orders/orders.interface';
import { Sale, CreateSale } from 'src/Sales/sales.interface';
import { Account, Promoter } from "src/Account/account.interface";

@Injectable()
export class EventService {

    constructor(
        @InjectModel(EventSchema.name) private eventModel: Model<EventDocument>,
        @InjectModel(CouponSchema.name) private couponModel: Model<CouponDocument>,
        private accountService: AccountService,
        private salesService: SalesService,
        private ordersService: OrdersService,
        private stripeService: StripeService,
        private promoterService: PromoterService,
        private promoCodeService: PromocodesService,
        private socketService: SocketService,
        private notificationService: NotificationService,
    ) {}

    public async getOpenEvents(): Promise<Event[]> {
        const query = await this.eventModel.find({
            $and: [
              { $or: [{ status: EventStatus.LAUNCHED }, { status: EventStatus.LIVE }] }
            ]
        }).select({ isBlockchain: 0, blockNumber: 0, hash: 0, orders: 0 })
        .populate({
          path: 'promoter',
          model: 'Promoter',
          select: {
            _id: 0,
            name: 1
          }
        })
        .lean();

        const processedQuery = query.map(item => {
          const { promoter, ...rest} = item;
          return {
            promoter: promoter["name"],
            ...rest
          };
        });

        return processedQuery;
    };

    public async getEventsById(eventId: string): Promise<Event | null>{
        return this.eventModel.findOne({
          _id: eventId,
          $and: [
            { 'dateTime.startDate': { $gte: new Date().toISOString() }  },
            { $or: [{ status: EventStatus.LAUNCHED }, { status: EventStatus.LIVE}] }
          ]
        }).populate({
          path: 'promoter',
          model: 'Promoter',
          select: {
            _id: 1,
            name: 1
          }
        })
        .select({ isBlockchain: 0, blockNumber: 0, hash: 0, orders: 0 })
        .lean()
        .exec();
    }

    public async getEventsByUrl(queryId): Promise<Event | null>{
      return this.eventModel.findOne({
        url: queryId,
        $and: [
          { 'dateTime.startDate': { $gte: new Date().toISOString() }  },
          { $or: [{ status: EventStatus.LAUNCHED }, { status: EventStatus.LIVE}] }
        ]
      }).populate({
        path: 'promoter',
        model: 'Promoter',
        select: {
          _id: 1,
          name: 1
        }
      })
      .select({ isBlockchain: 0, blockNumber: 0, hash: 0, orders: 0 })
      .lean()
      .exec();
    }

    public async createOrder(createOrder: CreateOrder): Promise<{ paymentId: string; clientSecret: string } | undefined> {

        const account = await this.accountService.accountExistOrCreate(createOrder.contactDetails.name, createOrder.contactDetails.lastName, createOrder.contactDetails.email, createOrder.contactDetails.birthdate, createOrder.contactDetails.phone || '');
        if (!account) {
          console.log('Error checking your account!');
          return;
        }

        const singleOrderPromises: Promise<{ totalAmount: number, orderId: string}>[] = [];
        
        for (let i = 0; i < createOrder.orders.length; i++) {
          singleOrderPromises.push(this.createSingleOrder(account, createOrder.orders[i].event, createOrder.orders[i].items, createOrder.contactDetails, createOrder.orders[i].resaleItems, createOrder.orders[i].couponCode, createOrder.orders[i].promoCode));
        }

        const singleOrdersTotalAmounts = await Promise.all(singleOrderPromises);

        let totalAmount = 0;
        const orderIds: string[] = [];

        singleOrdersTotalAmounts.forEach((singleOrderTotalAmount: { totalAmount: number, orderId: string }) => {
          orderIds.push(singleOrderTotalAmount.orderId);
          totalAmount += singleOrderTotalAmount.totalAmount;
        });

        let stripeFee = Math.ceil(((totalAmount * 0.015) + 0.25) * 100) / 100; // Decimals rounded to highest
        
        const paymentIntent = await this.stripeService.createPaymentIntent(Math.ceil((totalAmount + stripeFee) * 100));
        await this.ordersService.updateOrdersById(orderIds, { paymentId: paymentIntent.id });

        return { paymentId: paymentIntent.id, clientSecret: paymentIntent.client_secret! };
        
    };


    private async createSingleOrder(account: Account, eventId: string, orderItems: Item[], contactDetails: ContactDetails, orderResaleItems?: Item[], couponCode?: string, promoCode?: string): Promise<{ totalAmount: number, orderId: string }> {
      
      return new Promise(async (resolve) => {

        const event = await this.getEventsById(eventId);
        if (!event) {
            console.log('Event not found!')
            return;
        }

        const accountBoughtItems = await this.salesService.getEventSalesByAccount(account._id, event._id);

        if (accountBoughtItems >= event.availableTickets) {
          console.log('Cannot buy more tickets for this event!');
          return;
        }

        // Check coupon
        let coupon;
        let validCoupon: boolean = false;
        if (couponCode) {
          coupon = await this.getCoupon(couponCode);
          let couponUses = await this.ordersService.getOrdersWithCouponCount(couponCode);
          if (!coupon || coupon.eventId != eventId || coupon.expiryDate < new Date() || coupon.maxUses <= couponUses) {
            console.log('Coupon is not valid!');
          } else {
            validCoupon = true;
            console.log('Coupon is valid!');
          }
        }

        // Check promo code
        let validPromoCode: boolean = false;
        if (promoCode) {
          const promoEvent = await this.promoCodeService.getEventByPromocode(promoCode);
          if (!promoEvent || promoEvent.eventId != eventId) {
            console.log('Promo code is not valid!');
          } else {
            validPromoCode = true;
            console.log('Promo code is valid!');
          }
        }

        let totalAmount = 0;
        let items: Item[] = [];
        let resaleItems: Item[] = [];
        
        event?.tickets.forEach((ticket: Ticket) => {
          orderItems.forEach((item: Item) => {
            if (ticket.type == item.type) {
              totalAmount += item.amount * ticket.price;
              items.push({ sale: item.sale || undefined, amount: item.amount, type: item.type, price: ticket.price });
            }
          });
        });

        // Check if there are available tickets
        let ticketsSoldOut: boolean = false;
        event?.tickets.forEach((ticket: Ticket) => {
          orderResaleItems?.forEach(async (item: Item) => {
            if(ticket.type == item.type) {
              let totalBoughtTickets = await this.salesService.getEventSalesByType(eventId, ticket.type);
              if (totalBoughtTickets + item.amount > ticket.amount) {
                ticketsSoldOut = true;
                console.log(`${ticket.type} tickets sold out!`);
              }
            }
          });
        });
        if (ticketsSoldOut) {
          return;
        }

        let totalTickets = 0;
        items.forEach((ticket: Ticket) => {
          totalTickets += ticket.amount;
        });

        if (totalTickets >= (event.availableTickets - accountBoughtItems)) {
          console.log('Order tickets exceed maximum permited for event!');
          return;
        }

        if (orderResaleItems?.length) {

          const resalesIds = orderResaleItems.map((resale: Item) => resale.sale!);
          const resales = await this.salesService.getResales(resalesIds);

          resales.forEach((resale: Sale) => {
            totalAmount += resale.resale?.resalePrice!;
            resaleItems.push({ sale: resale._id, amount: 1, price: resale.resale?.resalePrice!, type: resale.type });
          });
        }

        totalAmount += totalAmount * (event.commission / 100);

        if (validCoupon) {
          totalAmount -= totalAmount * (coupon.discount / 100);
        }

        const isNewUser = await this.promoterService.addUserToPromoter(event.promoter, account._id);
        if (isNewUser) {
            try {

                const userNotification = await this.notificationService.createNotification({
                    type: 'USER',
                    promoter: (event.promoter as unknown as Promoter)._id,
                    userId: account._id,
                });

                // Usar las mismas variables que en la creación de la notificación
                this.socketService.emitUserCreated(event.promoter, userNotification._id!);
                console.log('Notificación de usuario creada y emitida exitosamente');

            } catch (error) {
                console.error('Error al crear/emitir la notificación de usuario:', error);
            }
        }
        
        const createdOrder = await this.ordersService.createOrder({
          event: event._id,
          promoter: event.promoter,
          account: account._id,
          items: orderItems,
          resaleItems: resaleItems,
          contactDetails,
          commission: event.commission,
          couponCode: validCoupon ? couponCode : undefined,
          promoCode: validPromoCode ? promoCode : undefined,
        });
        
        if (!createdOrder) {
          console.log('Error creating your order!');
          return;
        }

        const createSales: CreateSale[] = [];
      
        createdOrder.items.forEach(async (item: Item) => {
          for (let i = 0; i <= item.amount - 1; i++) {
            createSales.push({
              event: createdOrder.event,
              promoter: createdOrder.promoter,
              order: createdOrder._id,
              client: createdOrder.account,
              type: item.type,
              price: item.price,
              history: [{
                activity: TicketActivity.PENDING,
                reason: 'Ticket not paid yet.',
                status: TicketStatus.PENDING,
                createdAt: new Date()
              }]
            });
          }
        });
        
        if (orderResaleItems) {
          createdOrder.resaleItems.forEach(async (resaleItem: Item) => {
            createSales.push({
              event: createdOrder.event,
              promoter: createdOrder.promoter,
              order: createdOrder._id,
              client: createdOrder.account,
              type: resaleItem.type,
              price: resaleItem.price,
              history: [{
                activity: TicketActivity.PENDING,
                reason: 'Ticket not paid yet.',
                status: TicketStatus.PENDING,
                createdAt: new Date()
              }],
              isResale: resaleItem.sale
            });
          });
        }

        const createdSales = await this.salesService.createSales(createSales);

        // EN VEZ DE ACTUALIZAR LAS ORDENES POR PAYMENT ID, 
        await this.ordersService.updateOrderById(createdOrder._id, { sales: createdSales.map((createdSale: Sale) => createdSale._id) });
        
        await this.accountService.addOrderToAccount(account._id, createdOrder._id);
        await this.addOrderToEvent(event?._id!, createdOrder._id);

        this.socketService.emitOrderCreated(event.promoter, createdOrder._id);

        resolve({ totalAmount, orderId: createdOrder._id });

      });

    }

    private async addOrderToEvent(event: string, order: string): Promise<void> {
      try {
        await this.eventModel.findByIdAndUpdate(event, { $push: { orders: order }});
      } catch (error) {
        
      }
    };

    public async getCoupon(coupon: string): Promise<Coupon | null> {
      return await this.couponModel.findOne({code: coupon}).select({_id: 0, eventId: 1, discount: 1}).lean();
    };

    public async createEvent(eventData: Partial<Event>): Promise<Event> {
      const newEvent = new this.eventModel(eventData);
      return await newEvent.save();
    }

    public async getAllEvents(): Promise<Event[]> {
      return await this.eventModel.find()
        .populate({
          path: 'promoter',
          model: 'Promoter',
          select: {
            _id: 1,
            name: 1
          }
        })
        .select({ isBlockchain: 0, blockNumber: 0, hash: 0 })
        .lean()
        .exec();
    }

    public async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event | null> {
      return await this.eventModel.findByIdAndUpdate(eventId, eventData, { new: true }).lean();
    }

    public async deleteEvent(eventId: string): Promise<Event | null> {
      return await this.eventModel.findByIdAndDelete(eventId).lean();
    }

}