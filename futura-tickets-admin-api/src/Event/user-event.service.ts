import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// ETHERS
import { ethers, Interface } from 'ethers';
import { encodeFunctionData } from 'viem';

// BULL - Temporarily disabled - Bull/Redis not available
// import { Job, Queue } from 'bull';
// import { InjectQueue } from '@nestjs/bull';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Event as EventSchema, EventDocument } from './event.schema';

// QRCODE
import QRCode from 'qrcode';

// ABI
import * as EventAbi from '../abis/Event.json';

// SERVICES
import {
  AbstractionService,
  FuturaAccountClient,
} from '../Abstraction/abstraction.service';
import { AccountService } from 'src/Account/account.service';
import { OrdersService } from 'src/Orders/orders.service';
import { MailService } from 'src/Mail/mail.service';
import { NotificationService } from 'src/Notifications/notifications.service';
import { PromoterService } from 'src/Promoter/promoter.service';
import { ProviderService } from 'src/Provider/provider.service';
import { SalesService } from 'src/Sales/sales.service';
import { SocketService } from 'src/Socket/socket.service';
import { StripeService } from 'src/Stripe/stripe.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import {
  Event,
  EventStatus,
  Ticket,
  TicketActivity,
  TicketStatus,
  TransferTicket,
  TransferToTicket,
  TransferToUpdate,
  UpdateEvent,
} from '../shared/interface';
import { TransferFromEmail, TransferToEmail } from 'src/Mail/mail.interface';
import { CreateOrder, Item, OrderStatus } from 'src/Orders/orders.interface';
import {
  CreateSale,
  Sale,
  SaleHistory,
  TransferAccount,
} from 'src/Sales/sales.interface';

@Injectable()
export class UserEventService {
  constructor(
    @InjectModel(EventSchema.name) private eventModel: Model<EventDocument>,
    // @InjectQueue('ticket-transfer') private ticketTransferQueue: Queue, // Temporarily disabled - Bull/Redis not available
    private abstractionService: AbstractionService,
    private accountService: AccountService,
    private mailService: MailService,
    private notificationService: NotificationService,
    private ordersService: OrdersService,
    private promoterService: PromoterService,
    private providerService: ProviderService,
    private salesService: SalesService,
    private socketService: SocketService,
    private stripeService: StripeService,
  ) {}

  // Temporarily disabled - Bull/Redis not available
  // private async addTransferTicketQueue(
  //   transferTicket: TransferTicket,
  // ): Promise<Job<{ mintTicket: MintTicket }>> {
  //   return this.ticketTransferQueue.add({ transferTicket });
  // }

  public async getEvents(): Promise<Event[]> {
    return await this.eventModel.find({ status: EventStatus.LAUNCHED });
  }

  public async getEvent(eventId: string): Promise<Event | null> {
    return await this.eventModel.findById(eventId).populate('promoter');
  }

  private async getEventById(event: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event });
  }

  public async createOrder(
    createOrder: CreateOrder,
  ): Promise<{ paymentId: string; clientSecret: string } | undefined> {
    try {
      const event = await this.getEventById(createOrder.event);
      if (!event) {
        console.log('Event not found!');
        return;
      }

      const account = await this.accountService.accountExistOrCreate(
        createOrder.contactDetails.name,
        createOrder.contactDetails.lastName,
        createOrder.contactDetails.email,
        createOrder.contactDetails.birthdate,
        createOrder.contactDetails.phone || '',
      );
      if (!account) {
        console.log('Error checking your account!');
        return;
      }

      let totalAmount = 0;
      const items: Item[] = [];
      const resaleItems: Item[] = [];

      event?.tickets.forEach((ticket: Ticket) => {
        createOrder.items.forEach((item: Item) => {
          if (ticket.type == item.type) {
            totalAmount += item.amount * ticket.price;
            items.push({
              sale: item.sale || undefined,
              amount: item.amount,
              type: item.type,
              price: ticket.price,
            });
          }
        });
      });

      const resalesIds =
        createOrder.resaleItems?.map((resale: Item) => resale.sale!) || [];
      const resales = await this.salesService.getResales(resalesIds);

      resales.forEach((resale: Sale) => {
        totalAmount += resale.resale?.resalePrice!;
        resaleItems.push({
          sale: resale._id,
          amount: 1,
          price: resale.resale?.resalePrice!,
          type: resale.type,
        });
      });

      totalAmount += totalAmount * (event.commission / 100);

      await this.promoterService.addUserToPromoter(
        createOrder.promoter,
        account._id,
      );
      const paymentIntent = await this.stripeService.createPaymentIntent(
        Number((totalAmount * 100).toFixed(0)),
      );

      const createdOrder = await this.ordersService.createOrder({
        ...createOrder,
        account: account._id,
        items,
        resaleItems,
        paymentId: paymentIntent.id,
      });
      if (!createdOrder) {
        console.log('Error creating your order!');
        return;
      }

      const createSales: CreateSale[] = [];

      createdOrder.items.forEach((item: Item) => {
        for (let i = 0; i <= item.amount - 1; i++) {
          createSales.push({
            event: event._id,
            promoter: event.promoter,
            order: createdOrder._id,
            client: createdOrder.account,
            type: item.type,
            price: item.price,
            history: [
              {
                activity: TicketActivity.PENDING,
                reason: 'Ticket not paid yet.',
                status: TicketStatus.PENDING,
                createdAt: new Date(),
              },
            ],
          });
        }
      });

      createdOrder.resaleItems.forEach(async (resaleItem: Item) => {
        createSales.push({
          event: event._id,
          promoter: event.promoter,
          order: createdOrder._id,
          client: createdOrder.account,
          type: resaleItem.type,
          price: resaleItem.price,
          history: [
            {
              activity: TicketActivity.PENDING,
              reason: 'Ticket not paid yet.',
              status: TicketStatus.PENDING,
              createdAt: new Date(),
            },
          ],
          isResale: resaleItem.sale,
        });
      });

      const createdSales = await this.salesService.createSales(createSales);

      await this.ordersService.updateOrderPaymentId(createdOrder.paymentId, {
        sales: createdSales.map((createdSale: Sale) => createdSale._id),
      });
      await this.accountService.addOrderToAccount(
        account._id,
        createdOrder._id,
      );
      await this.addOrderToEvent(event?._id!, createdOrder._id);

      const emitOrder: string = createdOrder._id;

      this.socketService.emitOrderCreated(event.promoter, emitOrder);

      return {
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
      };
    } catch (error) {
      console.log('There was an error creating your order.');
    }
  }

  private async addOrderToEvent(event: string, order: string): Promise<void> {
    try {
      await this.eventModel.findByIdAndUpdate(event, {
        $push: { orders: order },
      });
    } catch (error) {}
  }

  public async resale(
    sale: string,
    client: string,
    price: number,
  ): Promise<void> {
    const ticket = await this.salesService.findSale(
      sale,
      client,
      TicketStatus.OPEN,
    );
    if (!ticket) {
      console.log('Ticket resale not found!');
      return;
    }

    const ticketEvent = ticket.event as unknown as Event;
    const ticketClient = ticket.client as unknown as Account;

    const history = [
      ...ticket.history,
      {
        reason: 'Processing ticket resale ...',
        activity: TicketActivity.PROCESSING,
        status: TicketStatus.PROCESSING,
        createdAt: new Date(),
      },
    ];

    await this.salesService.updateSale(sale, {
      status: TicketStatus.PROCESSING,
      history,
    });
    this.socketService.emitTicketResale(ticket.promoter, ticket.order);

    const resale = await this.salesService.setResale(
      ticketClient.key as `0x${string}`,
      ticketEvent.address as `0x${string}`,
      ticket.tokenId,
      price,
    );

    await this.salesService.updateSale(sale, {
      status: TicketStatus.SALE,
      resale: { resalePrice: Number(price), resaleDate: new Date() },
      history: [
        ...history,
        {
          reason: 'Ticket resale processed.',
          blockNumber: resale.blockNumber,
          hash: resale.hash,
          activity: TicketActivity.PROCESSED,
          status: TicketStatus.SALE,
          createdAt: new Date(),
        },
      ],
    });

    await this.notificationService.createNotification({
      orderId: ticket.order,
      type: 'RESALE',
      promoter: ticket.promoter,
    });

    this.socketService.emitTicketResale(ticket.promoter, ticket.order);

    // Temporarily using direct email send instead of queue
    await this.mailService.sendResaleConfirmation(ticket, price);
  }

  public async cancelResale(sale: string, client: string): Promise<void> {
    const ticketResale = await this.salesService.findSale(
      sale,
      client,
      TicketStatus.SALE,
    );
    if (!ticketResale) {
      console.log('Ticket cancel resale not found!');
      return;
    }

    await this.salesService.updateSale(sale, {
      status: TicketStatus.OPEN,
      history: [
        ...ticketResale.history,
        {
          reason: 'Resale Canceled.',
          activity: TicketActivity.PROCESSED,
          status: TicketStatus.OPEN,
          createdAt: new Date(),
        },
      ],
    });

    this.socketService.emitCancelResale(
      ticketResale.promoter,
      ticketResale.order,
    );

    await this.mailService.sendCancelResaleConfirmation(ticketResale);
  }

  public async transferTicket(
    sale: string,
    client: string,
    transferToTicket: TransferToTicket,
  ): Promise<void> {
    const ticket = await this.salesService.findSale(
      sale,
      client,
      TicketStatus.OPEN,
    );
    if (!ticket) return;

    const account = await this.accountService.accountExistOrCreate(
      transferToTicket.name,
      transferToTicket.lastName,
      transferToTicket.email,
      transferToTicket.birthdate,
      transferToTicket.phone || '',
    );
    if (!account) {
      console.log('Error checking your account!');
      return;
    }

    const ticketEvent = ticket.event as unknown as Event;
    const ticketClient = ticket.client as unknown as Account;

    const transferOrder: CreateOrder = {
      event: ticketEvent._id,
      promoter: ticket.promoter,
      account: account._id,
      items: [
        {
          type: ticket.type,
          price: ticket.price,
          amount: 1,
        },
      ],
      contactDetails: {
        name: account.name,
        lastName: account.lastName,
        email: account.email,
        birthdate: account.birthdate!,
        phone: account.phone || '',
      },
      sales: [],
      status: OrderStatus.SUCCEEDED,
    };

    const from: TransferAccount = {
      _id: ticketClient._id,
      name: ticketClient.name,
      lastName: ticketClient.lastName,
      address: ticketClient.address,
    };

    const to: TransferAccount = {
      _id: account._id,
      name: account.name,
      lastName: account.lastName,
      address: account.address,
    };

    const createdOrder = await this.ordersService.createOrder(transferOrder);
    if (!createdOrder) {
      console.log('Error creating order transfer!');
      return;
    }

    await this.addOrderToEvent(ticketEvent._id, createdOrder._id);
    await this.accountService.addOrderToAccount(account._id, createdOrder._id);
    await this.promoterService.addUserToPromoter(
      createdOrder.promoter,
      account._id,
    );

    const history: SaleHistory[] = [
      {
        activity: TicketActivity.TRANSFERING,
        reason: 'Transfering ticket ...',
        status: TicketStatus.PROCESSING,
        from,
        to,
        createdAt: new Date(),
      },
    ];

    const transferSale: CreateSale = {
      event: ticketEvent._id,
      client: account._id,
      promoter: ticket.promoter,
      order: createdOrder?._id!,
      type: ticket.type,
      price: ticket.price,
      history,
      status: TicketStatus.PROCESSING,
      isTransfer: ticket._id,
    };

    const createdSale = await this.salesService.createSale(transferSale);
    if (!createdSale) return;

    await this.salesService.updateSale(ticket._id, {
      history,
      status: TicketStatus.PROCESSING,
    });
    await this.ordersService.updateOrderSales(
      createdOrder?._id!,
      createdSale._id!,
    );

    this.socketService.emitTicketMinted(ticket.promoter, ticket.order);
    this.socketService.emitOrderCreated(ticket.promoter, createdOrder._id);

    const transferFromEmail: TransferFromEmail = {
      account: ticketClient,
      event: {
        name: ticketEvent.name,
        description: ticketEvent.description,
        image: ticketEvent.image,
      },
      ticket: {
        tokenId: ticket.tokenId,
        type: ticket.type,
        price: ticket.price,
      },
      transferToAccount: {
        name: account.name,
        lastName: account.lastName,
        email: account.email,
      },
    };

    const transferToEmail: TransferToEmail = {
      account: account,
      event: {
        name: ticketEvent.name,
        description: ticketEvent.description,
        image: ticketEvent.image,
      },
      ticket: {
        tokenId: ticket.tokenId,
        type: ticket.type,
        price: ticket.price,
      },
      transferFromAccount: {
        name: ticketClient.name,
        lastName: ticketClient.lastName,
        email: ticketClient.email,
      },
    };

    if (ticketEvent.isBlockchain) {
      const transferTicket: TransferTicket = {
        tokenId: ticket.tokenId,
        ticket,
        createdOrder,
        createdSale,
        ticketEvent,
        ticketClient,
        account,
        history,
        from,
        to,
        transferFromEmail,
        transferToEmail,
      };

      // Temporarily calling processTicketTransfer directly instead of queue
      await this.processTicketTransfer(transferTicket);

      return;
    }

    // DONT FORGET TO GENERATE NEW QR CODE
    const qrCode = await QRCode.toDataURL(
      `${ticketEvent.url}/verify/${createdSale._id.toString()}`,
    );

    await this.salesService.updateSale(createdSale._id, {
      history: [
        ...history,
        {
          activity: TicketActivity.TRANSFERED,
          reason: 'Ticket transfered.',
          from,
          to,
          status: TicketStatus.OPEN,
          createdAt: new Date(),
        },
      ],
      qrCode,
      status: TicketStatus.OPEN,
    });
    await this.salesService.updateSale(ticket._id, {
      history: [
        ...ticket.history,
        ...history,
        {
          activity: TicketActivity.TRANSFERED,
          reason: 'Ticket transfered.',
          from,
          to,
          status: TicketStatus.TRANSFERED,
          createdAt: new Date(),
        },
      ],
      status: TicketStatus.TRANSFERED,
    });

    // Temporarily using direct email send instead of queue
    await this.mailService.sendTransferFromConfirmation(transferFromEmail);
    await this.mailService.sendTransferToConfirmation(transferToEmail);
  }

  public async processTicketTransfer(
    transferTicket: TransferTicket,
  ): Promise<void> {
    console.log('Transfer ticket transaction started!');

    const smartAcountClient =
      await this.abstractionService.getSmartAccountClient(
        transferTicket.ticketClient.key as `0x${string}`,
      );

    const ownerKey = await this.accountService.getAccountPrivateKeyByAddress(
      transferTicket.account.address as string,
    );
    const ownerSmartAcountClient =
      await this.abstractionService.getSmartAccountClient(
        ownerKey!.key as `0x${string}`,
      );

    const nftTicketTransferTx = await this.transferNftTicket(
      smartAcountClient,
      transferTicket.ticketEvent.address as `0x${string}`,
      transferTicket.tokenId,
      ownerSmartAcountClient.account?.address as `0x${string}`,
    );

    console.log('Transfer ticket transaction done!');
    const provider = this.providerService.getProvider();
    const nftTicketTransferReceipt = await provider.waitForTransaction(
      nftTicketTransferTx,
      1,
    );

    const contract = new ethers.Contract(
      transferTicket.ticketEvent.address as `0x${string}`,
      EventAbi.abi,
      this.providerService.getWssProvider(),
    );

    const transferToUpdate: TransferToUpdate = await new Promise((resolve) => {
      contract
        .queryFilter('Transfer', nftTicketTransferReceipt?.blockNumber)
        .then((data) => {
          data.filter((log: ethers.Log | ethers.EventLog) => {
            const iface = new Interface([
              'event Transfer(address indexed from, address indexed to, uint256 indexed value)',
            ]);
            const decodeResult = iface.decodeEventLog(
              'Transfer',
              log.data,
              log.topics,
            );

            if (Number(decodeResult[2]) == transferTicket.tokenId) {
              resolve({
                blockNumber: nftTicketTransferReceipt!.blockNumber,
                hash: nftTicketTransferReceipt!.hash,
                from: decodeResult[0],
                to: decodeResult[1],
                tokenId: Number(decodeResult[2]),
              });
            }
          });
        });
    });

    // DONT FORGET TO GENERATE NEW QR CODE
    const qrCode = await QRCode.toDataURL(
      `${transferTicket.ticketEvent.url}/verify/${transferTicket.createdSale._id.toString()}`,
    );

    await this.salesService.updateSale(transferTicket.createdSale._id, {
      history: [
        ...transferTicket.history,
        {
          activity: TicketActivity.TRANSFERED,
          reason: 'Ticket transfered.',
          from: transferTicket.from,
          to: transferTicket.to,
          blockNumber: transferToUpdate.blockNumber,
          hash: transferToUpdate.hash,
          status: TicketStatus.OPEN,
          createdAt: new Date(),
        },
      ],
      qrCode,
      tokenId: transferToUpdate.tokenId,
      blockNumber: transferToUpdate.blockNumber,
      hash: transferToUpdate.hash,
      status: TicketStatus.OPEN,
    });
    await this.salesService.updateSale(transferTicket.ticket._id, {
      history: [
        ...transferTicket.ticket.history,
        ...transferTicket.history,
        {
          activity: TicketActivity.TRANSFERED,
          reason: 'Ticket transfered.',
          from: transferTicket.from,
          to: transferTicket.to,
          blockNumber: transferToUpdate.blockNumber,
          hash: transferToUpdate.hash,
          status: TicketStatus.TRANSFERED,
          createdAt: new Date(),
        },
      ],
      status: TicketStatus.TRANSFERED,
    });

    await this.notificationService.createNotification({
      orderId: transferTicket.createdOrder._id,
      type: 'TRANSFERED',
      promoter: transferTicket.createdOrder.promoter,
    });

    this.socketService.emitTicketTransfer(
      transferTicket.createdOrder.promoter,
      transferTicket.ticket.order,
    );
    this.socketService.emitTicketTransfer(
      transferTicket.createdOrder.promoter,
      transferTicket.createdOrder._id,
    );

    // Temporarily using direct email send instead of queue
    await this.mailService.sendTransferFromConfirmation(
      transferTicket.transferFromEmail,
    );
    await this.mailService.sendTransferToConfirmation(
      transferTicket.transferToEmail,
    );
  }

  private async transferNftTicket(
    smartAccountClient: FuturaAccountClient,
    eventAddress: `0x${string}`,
    tokenId: number,
    owner: `0x${string}`,
  ): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'transferNFT',
      args: [tokenId, owner],
    });

    return this.abstractionService.sendTransaction(
      smartAccountClient,
      eventAddress,
      callData,
    );
  }

  public async updateEvent(
    eventId: string,
    promoter: string,
    event: UpdateEvent,
  ): Promise<void | null> {
    return await this.eventModel.findOneAndUpdate(
      { _id: eventId, promoter },
      event,
    );
  }
}
