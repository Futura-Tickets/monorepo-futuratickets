import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// ETHERS
import { ethers, Interface } from 'ethers';
import { encodeFunctionData } from 'viem';

// QRCODE
import QRCode from 'qrcode';

// MONGOOSE
import { DeleteResult, Model } from 'mongoose';

// SCHEMA
import { Event as EventSchema, EventDocument } from './event.schema';

// SERVICES
import { ProviderService } from '../Provider/provider.service';
import { AbstractionService, FuturaAccountClient } from '../Abstraction/abstraction.service';
import { AccountService } from '../Account/account.service';
import { OrdersService } from '../Orders/orders.service';
import { MailService } from '../Mail/mail.service';
import { NotificationService } from '../Notifications/notifications.service';
import { PromoterService } from '../Promoter/promoter.service';
import { SalesService } from '../Sales/sales.service';
import { SocketService } from '../Socket/socket.service';
import { StripeService } from '../Stripe/stripe.service';
import { WalletService } from '../Wallet/wallet.service';

// INTERFACES
import {
  Event,
  CreateEvent,
  UpdateEvent,
  EventStatus,
  TicketStatus,
  MintTicket,
  TicketActivity,
  CreatedTicket,
  TransferResaleTicket,
  EditEvent,
} from '../shared/interface';
import { Account } from '../Account/account.interface';
import { CreateSale, EmitAccess, EmitOrder, Sale, TransferAccount } from '../Sales/sales.interface';
import { CreateInvitation, CreateOrder, Item, Order, OrderStatus } from '../Orders/orders.interface';

// ABI
import * as EventFactoryAbi from '../abis/EventFactory.json';
import * as EventAbi from '../abis/Event.json';

@Injectable()
export class AdminEventService {
  private eventFactoryAddress: `0x${string}`;
  private dashboardUrl: string;

  constructor(
    @InjectModel(EventSchema.name) private eventModel: Model<EventDocument>,
    // @InjectQueue('ticket-mint') private ticketMintQueue: Queue, // Temporarily disabled - Bull/Redis not available
    // @InjectQueue('ticket-resale-transfer') // Temporarily disabled - Bull/Redis not available
    // private ticketResaleTransferQueue: Queue, // Temporarily disabled - Bull/Redis not available
    // @InjectQueue('ticket-invitation') private ticketInvitationQueue: Queue, // Temporarily disabled - Bull/Redis not available
    // @InjectQueue('create-order') private createOrderQueue: Queue, // Temporarily disabled - Bull/Redis not available
    private abstractionService: AbstractionService,
    private accountService: AccountService,
    private configService: ConfigService,
    private mailService: MailService,
    private notificationService: NotificationService,
    private promoterService: PromoterService,
    private providerService: ProviderService,
    private ordersService: OrdersService,
    private salesService: SalesService,
    private socketService: SocketService,
    private stripeService: StripeService,
    private walletService: WalletService,
  ) {
    this.eventFactoryAddress = configService.get('EVENT_FACTORY_ADDRESS')!;
    this.dashboardUrl = configService.get('DASHBOARD_URL') as string;
  }

  // Temporarily disabled - Bull/Redis not available
  // private async addMintTicketQueue(
  //   mintTicket: MintTicket,
  // ): Promise<Job<{ mintTicket: MintTicket }>> {
  //   return this.ticketMintQueue.add({ mintTicket });
  // }

  // private async addTransferResaleTicketQueue(
  //   transferResaleTicket: TransferResaleTicket,
  // ): Promise<Job<{ mintTicket: MintTicket }>> {
  //   return this.ticketResaleTransferQueue.add({ transferResaleTicket });
  // }

  // private async addInvitationTicketQueue(
  //   mintInvitationTicket: MintTicket,
  // ): Promise<Job<{ mintInvitationTicket: MintTicket }>> {
  //   return this.ticketInvitationQueue.add({ mintInvitationTicket });
  // }

  // private async addCreateOrderQueue(
  //   paymentId: string,
  // ): Promise<Job<{ paymentId: string }>> {
  //   return this.createOrderQueue.add({ paymentId });
  // }

  public async getEvents(promoter: string): Promise<Event[]> {
    return await this.eventModel
      .find({ promoter })
      .populate({
        path: 'orders',
        model: 'Orders',
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
        populate: {
          path: 'sales',
          model: 'Sales',
          options: {
            sort: {
              createdAt: 'desc',
            },
          },
          populate: {
            path: 'client',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
          },
        },
      })
      .sort({ createdAt: 'desc' });
  }

  public async deleteEvent(event: string, promoter: string): Promise<DeleteResult> {
    return await this.eventModel.deleteOne({ event, promoter });
  }

  public async getEvent(promoter: string, event: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event, promoter }).populate([
      {
        path: 'orders',
        model: 'Orders',
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
        populate: [
          {
            path: 'account',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1, birthdate: 1, genre: 1 },
          },
          {
            path: 'sales',
            model: 'Sales',
            select: { history: 0 },
            options: {
              sort: {
                createdAt: 'desc',
              },
            },
            populate: {
              path: 'client',
              model: 'Account',
              select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
            },
          },
        ],
      },
      {
        path: 'promoter',
        model: 'Promoter',
      },
    ]);
  }

  public async createEvent(event: CreateEvent, promoter: string): Promise<Event | undefined> {
    const createdEvent = await this.eventModel.create({ ...event, promoter });
    if (!createdEvent.isBlockchain) return createdEvent;

    const promoterAccount = await this.promoterService.getPromoterPrivateKeyById(promoter);
    if (!promoterAccount) {
      console.log('Promoter account not found!');
      return;
    }

    const smartAcountClient = await this.abstractionService.getSmartAccountClient(promoterAccount.key as `0x${string}`);
    const tx = await this.createNftEvent(smartAcountClient, createdEvent.name);

    const provider = this.providerService.getProvider();
    const transactionReceipt = await provider.waitForTransaction(tx, 1);
    const contract = new ethers.Contract(
      this.eventFactoryAddress,
      EventFactoryAbi.abi,
      this.providerService.getWssProvider(),
    );

    const createdEventNft = await new Promise((resolve) => {
      contract.queryFilter('FuturaEventCreated').then((data) => {
        data.filter((log) => {
          if (log.blockNumber == transactionReceipt?.blockNumber) {
            const iface = new Interface(['event FuturaEventCreated(address indexed _address)']);
            const decodeResult = iface.decodeEventLog('FuturaEventCreated', log.data, log.topics);

            resolve({
              blockNumber: transactionReceipt.blockNumber,
              hash: transactionReceipt.hash,
              address: decodeResult[0],
              status: EventStatus.HOLD,
            });
          }
        });
      });
    });

    await this.updateEvent(
      createdEvent._id,
      createdEvent.promoter,
      createdEventNft as {
        blockNumber: number;
        hash: string;
        address: string;
        status: EventStatus;
      },
    );
    return createdEvent;
  }

  public async editEvent(promoter: string, event: string, editEvent: EditEvent): Promise<Event | null> {
    return await this.eventModel.findOneAndUpdate({ _id: event, promoter }, editEvent, { new: true });
  }

  public async updateEvent(eventId: string, promoter: string, event: UpdateEvent): Promise<void | null> {
    return await this.eventModel.findOneAndUpdate({ _id: eventId, promoter }, event);
  }

  public async updateResaleEvent(promoter: string, eventId: string, resaleStatus: boolean): Promise<void | null> {
    return await this.eventModel.findOneAndUpdate(
      { _id: eventId, promoter },
      { $set: { 'resale.isActive': resaleStatus } },
    );
  }

  private async createNftEvent(smartAccountClient: FuturaAccountClient, eventName: string): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: EventFactoryAbi.abi,
      functionName: 'createNew',
      args: [smartAccountClient?.account?.address, eventName],
    });

    return this.abstractionService.sendTransaction(smartAccountClient, this.eventFactoryAddress, callData);
  }

  public async createNftTicket(
    smartAccountClient: FuturaAccountClient,
    clientAddress: `0x${string}`,
    eventAddress: `0x${string}`,
    price: number,
    ticketRoyalty: number,
    timeStamp: number,
  ): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'mintNFT',
      args: [price, clientAddress, ticketRoyalty, timeStamp],
    });

    return this.abstractionService.sendTransaction(smartAccountClient, eventAddress, callData);
  }

  public async transferNftTicket(
    smartAccountClient: FuturaAccountClient,
    tokenId: number,
    clientAddress: `0x${string}`,
    eventAddress: `0x${string}`,
  ): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'transferNFT',
      args: [tokenId, clientAddress],
    });

    return this.abstractionService.sendTransaction(smartAccountClient, eventAddress, callData);
  }

  public async generateTicketQrCode(hash: string): Promise<string> {
    return await QRCode.toDataURL(hash);
  }

  public async createOrder(paymentId: string): Promise<EmitOrder | void> {
    // const order = await this.getOrderByPaymentId(stripeEvent.data.object['id']);
    const orders = await this.ordersService.getOrdersByPaymentId(paymentId);
    if (orders.length == 0) {
      console.log('We couldnt find your orders ' + paymentId);
      return;
    }

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      console.log('We found your order ' + orders[i]._id);

      const orderEvent = order.event as unknown as Event;
      const clientAccount = order.account as unknown as Account;
      const orderSales: Sale[] = order.sales as unknown as Sale[];

      // Temporarily changed from Job types to direct Promise types
      const ticketQueues: Promise<void>[] = [];
      const transferQueues: Promise<void | EmitOrder>[] = [];

      const createdTickets: CreatedTicket[] = [];

      for (let i = 0; i < orderSales.length; i++) {
        const createdSaleId = orderSales[i]._id.toString();

        const qrCode = await QRCode.toDataURL(`${this.dashboardUrl}/verify/${createdSaleId.toString()}`);
        await this.salesService.updateSale(createdSaleId.toString(), {
          qrCode,
          history: [
            ...orderSales[i].history,
            {
              activity: TicketActivity.PROCESSING,
              reason: 'Processing ticket ...',
              status: TicketStatus.PROCESSING,
              createdAt: new Date(),
            },
          ],
          status: TicketStatus.PROCESSING,
        });

        const createdTicket: CreatedTicket = {
          sale: createdSaleId,
          event: orderEvent,
          order: order._id!,
          promoter: orderEvent.promoter,
          client: clientAccount,
          type: orderSales[i].type,
          tokenId: orderSales[i].isResale ? orderSales[i].tokenId : undefined,
          price: orderSales[i].price,
          history: [
            ...orderSales[i].history,
            {
              activity: TicketActivity.PROCESSING,
              reason: 'Processing ticket ...',
              status: TicketStatus.PROCESSING,
              createdAt: new Date(),
            },
          ],
          qrCode,
          paymentId,
          timeStamp: Math.floor(Math.random() * 100000000),
          createdAt: orderSales[i].createdAt!,
          isResale: orderSales[i].isResale || undefined,
        };

        createdTickets.push(createdTicket);

        // Temporarily calling mintTicket directly instead of queue
        !createdTicket.isResale && ticketQueues.push(this.mintTicket(createdTicket));
        // Temporarily calling transferResaleTicket directly instead of queue
        createdTicket.isResale && transferQueues.push(this.transferResaleTicket(createdTicket));
      }

      await this.ordersService.updateOrderPaymentId(paymentId, {
        status: OrderStatus.SUCCEEDED,
      });
      // Temporarily using direct email send instead of queue
      await this.mailService.sendOrderConfirmation(order);

      await Promise.all(ticketQueues);

      await this.notificationService.createNotification({
        orderId: order._id,
        type: 'ORDER',
        promoter: orderEvent.promoter,
      });

      this.socketService.emitOrderCreated(orderEvent.promoter, order._id);
    }
  }

  public async mintTicket(mintTicket: MintTicket): Promise<void> {
    console.log('🎫 Creating ticket transaction started!');

    try {
      // Get event
      const event = await this.eventModel.findById(mintTicket.event._id);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if blockchain is enabled for this event
      if (event.isBlockchain && event.address) {
        console.log(`🔗 Minting NFT for event "${event.name}" at ${event.address}`);

        try {
          // Get or create user wallet using WalletService
          const wallet = await this.walletService.getOrCreateUserWallet(mintTicket.client._id!.toString());

          console.log(`👛 User wallet: ${wallet.address}`);

          // Get Smart Account Client from user's private key
          const smartAccountClient = await this.abstractionService.getSmartAccountClient(
            wallet.privateKey as `0x${string}`,
          );

          const smartAddress = smartAccountClient.account.address;
          console.log(`🔐 Smart Account: ${smartAddress}`);

          // Update user's smartAddress if not set
          if (!wallet.smartAddress) {
            await this.walletService.updateSmartAddress(mintTicket.client._id!.toString(), smartAddress);
          }

          // Encode mintNFT call using viem
          const callData = encodeFunctionData({
            abi: EventAbi.abi,
            functionName: 'mintNFT',
            args: [
              ethers.parseEther(mintTicket.price.toString()),
              smartAddress, // Mint to Smart Account
              event.resale?.royalty || 5, // Default 5% royalty
              mintTicket.timeStamp,
              0, // TicketStatus.OPEN
            ],
          });

          console.log('📤 Sending transaction via Account Abstraction...');

          // Send transaction via Account Abstraction
          const txHash = await this.abstractionService.sendTransaction(
            smartAccountClient,
            event.address as `0x${string}`,
            callData,
          );

          console.log(`✅ NFT minted! TX Hash: ${txHash}`);

          // Update sale with blockchain info (without tokenId yet)
          await this.salesService.updateSale(mintTicket.sale, {
            blockchain: {
              transactionHash: txHash,
              contractAddress: event.address,
              confirmed: false,
              expectedTimestamp: mintTicket.timeStamp,
            },
            history: [
              ...mintTicket.history,
              {
                activity: TicketActivity.PROCESSED,
                reason: 'Ticket minted on blockchain.',
                status: TicketStatus.OPEN,
                hash: txHash,
                createdAt: new Date(),
              },
            ],
            status: TicketStatus.OPEN,
          });

          console.log(`✅ Sale ${mintTicket.sale} updated with blockchain info`);

          // Emit socket event
          this.socketService.emitTicketMinted(mintTicket.promoter, mintTicket.order);

          // Note: tokenId will be automatically filled by BlockchainService
          // when it catches the TokenMinted event
          console.log('⏳ Waiting for blockchain confirmation (via BlockchainService)...');

          return;
        } catch (blockchainError) {
          console.error('❌ Blockchain mint failed:', blockchainError);
          console.log('⚠️  Falling back to non-blockchain ticket');
          // Continue below to create regular ticket
        }
      }

      // ========================================================================
      // FALLBACK: Regular ticket without blockchain
      // ========================================================================
      console.log('📝 Creating regular ticket (no blockchain)');

      await this.salesService.updateSale(mintTicket.sale, {
        history: [
          ...mintTicket.history,
          {
            activity: TicketActivity.PROCESSED,
            reason: 'Ticket processed.',
            status: TicketStatus.OPEN,
            createdAt: new Date(),
          },
        ],
        status: TicketStatus.OPEN,
      });

      this.socketService.emitTicketMinted(mintTicket.promoter, mintTicket.order);

      console.log(`✅ Regular ticket created: ${mintTicket.sale}`);
    } catch (error) {
      console.error('❌ Error minting ticket:', error);

      // Update sale with error
      await this.salesService.updateSale(mintTicket.sale, {
        history: [
          ...mintTicket.history,
          {
            activity: TicketActivity.DENIED,
            reason: `Error: ${error.message}`,
            status: TicketStatus.PENDING,
            createdAt: new Date(),
          },
        ],
        status: TicketStatus.PENDING,
      });

      throw error;
    }
  }

  public async transferResaleTicket(transferResaleTicket: TransferResaleTicket): Promise<EmitOrder | void> {
    const ticketToTransfer = await this.salesService.getSale(
      transferResaleTicket.promoter,
      transferResaleTicket.isResale!,
    );
    if (!ticketToTransfer) {
      console.log('Ticket resale transfer not found!');
      return;
    }

    const owner = await this.accountService.getAccountPrivateKeyById(ticketToTransfer.client);
    const client = await this.accountService.getAccountPrivateKeyById(transferResaleTicket.client._id);

    const from: TransferAccount = {
      _id: owner!._id,
      name: owner!.name,
      lastName: owner!.lastName,
      address: owner!.address,
    };

    const to: TransferAccount = {
      _id: client!._id,
      name: client!.name,
      lastName: client!.lastName,
      address: client!.address,
    };

    console.log('Ticket transfer transaction started!');
    await this.salesService.updateSale(ticketToTransfer._id, {
      history: [
        ...ticketToTransfer.history,
        {
          activity: TicketActivity.TRANSFERING,
          reason: 'Transfering ticket ...',
          from,
          to,
          createdAt: new Date(),
        },
      ],
      status: TicketStatus.PROCESSING,
    });
    await this.salesService.updateSale(transferResaleTicket.sale, {
      history: [
        ...transferResaleTicket.history,
        {
          activity: TicketActivity.TRANSFERING,
          reason: 'Transfering ticket ...',
          from,
          createdAt: new Date(),
        },
      ],
      status: TicketStatus.PROCESSING,
    });

    const ownerSmartAcountClient = await this.abstractionService.getSmartAccountClient(owner?.key as `0x${string}`);
    const clientSmartAccountClient = await this.abstractionService.getSmartAccountClient(client?.key as `0x${string}`);

    const createTicketTx = await this.transferNftTicket(
      ownerSmartAcountClient,
      ticketToTransfer.tokenId,
      clientSmartAccountClient.account?.address!,
      transferResaleTicket.event.address as `0x${string}`,
    );

    console.log('Ticket transfer transaction done!');
    const provider = this.providerService.getProvider();
    const createTicketReceipt = await provider.waitForTransaction(createTicketTx, 1);

    const contract = new ethers.Contract(
      transferResaleTicket.event.address,
      EventAbi.abi,
      this.providerService.getWssProvider(),
    );

    const transferToUpdate: {
      blockNumber: number;
      hash: string;
      from: string;
      to: string;
      tokenId: number;
    } = await new Promise((resolve) => {
      contract.queryFilter('Transfer', createTicketReceipt?.blockNumber).then((data) => {
        data.filter((log: ethers.Log | ethers.EventLog) => {
          const iface = new Interface([
            'event Transfer(address indexed from, address indexed to, uint256 indexed value)',
          ]);
          const decodeResult = iface.decodeEventLog('Transfer', log.data, log.topics);

          if (Number(decodeResult[2]) == ticketToTransfer.tokenId) {
            resolve({
              blockNumber: createTicketReceipt!.blockNumber,
              hash: createTicketReceipt!.hash,
              from: decodeResult[0],
              to: decodeResult[1],
              tokenId: Number(decodeResult[2]),
            });
          }
        });
      });
    });

    const ticketToTransferUpdated = await this.salesService.getSale(
      transferResaleTicket.promoter,
      transferResaleTicket.isResale!,
    );
    const transferTicketUpdated = await this.salesService.getSale(
      transferResaleTicket.promoter,
      transferResaleTicket.sale,
    );

    if (!ticketToTransferUpdated || !transferTicketUpdated) return;

    await this.salesService.updateSale(transferResaleTicket.isResale!, {
      history: [
        ...ticketToTransferUpdated.history,
        {
          activity: TicketActivity.TRANSFERED,
          blockNumber: transferToUpdate.blockNumber,
          hash: transferToUpdate.hash,
          reason: 'Ticket transfer processed.',
          from,
          to,
          createdAt: new Date(),
        },
      ],
      status: TicketStatus.SOLD,
    });
    await this.salesService.updateSale(transferResaleTicket.sale, {
      blockNumber: transferToUpdate.blockNumber,
      hash: transferToUpdate.hash,
      history: [
        ...transferTicketUpdated.history,
        {
          activity: TicketActivity.TRANSFERED,
          reason: 'Ticket transfer processed.',
          from,
          createdAt: new Date(),
        },
      ],
      price: ticketToTransfer.resale!.resalePrice,
      tokenId: transferToUpdate.tokenId,
      status: TicketStatus.OPEN,
    });

    this.socketService.emitTicketMinted(transferResaleTicket.promoter, transferResaleTicket.order);
  }

  public async getInvitationsByEventId(event: string, promoter: string): Promise<Sale[]> {
    return await this.salesService.getInvitationsByEventId(event, promoter);
  }

  public async createInvitation(promoter: string, createInvitation: CreateInvitation): Promise<Order | void> {
    const event = await this.getEventById(createInvitation.event);
    if (!event) {
      console.log('Event not found!');
      return;
    }

    const account = await this.accountService.accountExistOrCreate(
      createInvitation.contactDetails.name,
      createInvitation.contactDetails.lastName,
      createInvitation.contactDetails.email,
      createInvitation.contactDetails.birthdate,
      createInvitation.contactDetails.phone || '',
    );
    if (!account) {
      console.log('Error checking your account!');
      return;
    }

    const createInvitationOrder: CreateOrder = {
      event: createInvitation.event,
      promoter,
      account: account._id,
      items: [
        {
          type: createInvitation.item.type,
          price: createInvitation.item.price,
          amount: createInvitation.item.amount,
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

    const createdInvitationOrder = await this.ordersService.createOrder(createInvitationOrder);
    if (!createdInvitationOrder) {
      console.log('Error creating invitation order!');
      return;
    }

    const createInvitationSales: CreateSale[] = [];

    createdInvitationOrder.items.forEach((item: Item) => {
      for (let i = 0; i <= item.amount - 1; i++) {
        createInvitationSales.push({
          event: createInvitation.event,
          promoter: promoter,
          order: createdInvitationOrder._id,
          client: createdInvitationOrder.account,
          type: item.type,
          price: 0,
          history: [
            {
              activity: TicketActivity.PROCESSING,
              reason: 'Processing invitation ticket ...',
              status: TicketStatus.PROCESSING,
              createdAt: new Date(),
            },
          ],
          status: TicketStatus.PROCESSING,
          isInvitation: true,
        });
      }
    });

    const createdSales = await this.salesService.createSales(createInvitationSales);

    await this.ordersService.updateOrderById(createdInvitationOrder._id, {
      sales: createdSales.map((createdSale: Sale) => createdSale._id),
    });
    await this.accountService.addOrderToAccount(account._id, createdInvitationOrder._id);
    await this.addOrderToEvent(createInvitation.event!, createdInvitationOrder._id);
    await this.promoterService.addUserToPromoter(createdInvitationOrder.promoter, account._id);

    this.socketService.emitOrderCreated(event.promoter, createdInvitationOrder._id);

    const invitationOrder = await this.ordersService.getOrderById(createdInvitationOrder._id);
    if (!invitationOrder) {
      console.log('No invitation order found!');
      return;
    }

    // Temporarily changed from Job type to direct Promise type
    const ticketQueues: Promise<void>[] = [];

    const orderEvent = invitationOrder.event as unknown as Event;
    const clientAccount = invitationOrder.account as unknown as Account;
    const orderSales: Sale[] = invitationOrder.sales as unknown as Sale[];

    const createdInvitationTickets: CreatedTicket[] = [];

    for (let i = 0; i < orderSales.length; i++) {
      const createdSaleId = orderSales[i]._id.toString();

      const qrCode = await QRCode.toDataURL(`${orderEvent.url}/verify/${createdSaleId.toString()}`);
      await this.salesService.updateSale(createdSaleId.toString(), { qrCode });

      const createdTicket: CreatedTicket = {
        sale: createdSaleId,
        event: orderEvent,
        order: invitationOrder._id!,
        promoter: orderEvent.promoter,
        client: clientAccount,
        type: orderSales[i].type,
        tokenId: orderSales[i].isResale ? orderSales[i].tokenId : undefined,
        price: orderSales[i].price,
        history: orderSales[i].history,
        qrCode,
        timeStamp: Math.floor(Math.random() * 100000000),
        createdAt: orderSales[i].createdAt!,
        isInvitation: true,
      };

      createdInvitationTickets.push(createdTicket);
      // Temporarily calling mintTicket directly instead of queue
      ticketQueues.push(this.mintTicket(createdTicket));
    }

    await Promise.all(ticketQueues);
    // Temporarily using direct email send instead of queue
    await this.mailService.sendInvitationToConfirmation(invitationOrder);

    return invitationOrder;
  }

  private async getEventById(event: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event });
  }

  public async handleStripeEvent(payload: Buffer, signature: string): Promise<void> {
    const stripeEvent = this.stripeService.registerEvents(payload, signature);
    if (stripeEvent.type.toString() == 'payment_intent.succeeded') {
      console.log('Request: ' + stripeEvent.data.object['id']);
      const paymentId = stripeEvent.data.object['id'];
      // Temporarily calling createOrder directly instead of queue
      await this.createOrder(paymentId);
    }
  }

  public async getAccessEvent(promoter: string, event: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event, promoter }).populate({
      path: 'orders',
      model: 'Orders',
      select: { sales: 1 },
      options: {
        sort: {
          createdAt: 'desc',
        },
      },
      populate: {
        path: 'sales',
        model: 'Sales',
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
        match: {
          $or: [
            {
              status: TicketStatus.OPEN,
            },
            {
              status: TicketStatus.CLOSED,
            },
          ],
        },
        populate: {
          path: 'client',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1 },
        },
      },
    });
  }

  public async getResaleEvent(promoter: string, event: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event, promoter }).populate({
      path: 'orders',
      model: 'Orders',
      select: { sales: 1 },
      populate: {
        path: 'sales',
        model: 'Sales',
        match: {
          $or: [
            {
              status: TicketStatus.SALE,
            },
            {
              status: TicketStatus.SOLD,
            },
            {
              status: TicketStatus.TRANSFERED,
            },
          ],
        },
        populate: {
          path: 'client',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1 },
        },
      },
    });
  }

  public async getAttendantsEvent(promoter: string, event: string): Promise<Sale[]> {
    const attendantsEvent = await this.eventModel.findOne({ _id: event, promoter }).populate({
      path: 'orders',
      model: 'Orders',
      select: { sales: 1 },
      populate: {
        path: 'sales',
        model: 'Sales',
        select: {
          client: 1,
          type: 1,
          price: 1,
          status: 1,
        },
        match: {
          $or: [
            {
              status: TicketStatus.OPEN,
            },
            {
              status: TicketStatus.CLOSED,
            },
          ],
        },
        populate: {
          path: 'client',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
        },
      },
    });

    if (attendantsEvent) return attendantsEvent.orders.flatMap((order: any) => order.sales as unknown as Sale[]);
    return [];
  }

  public emitAccess(
    promoter: string,
    sale: Sale,
    accessDate: Date,
    activity: TicketActivity,
    reason: string,
    status: TicketStatus,
  ): void {
    const emitAccess: EmitAccess = {
      _id: sale._id,
      order: sale.order,
      event: sale.event,
      promoter,
      client: {
        name: (sale.client as unknown as Account).name,
        lastName: (sale.client as unknown as Account).lastName,
        email: (sale.client as unknown as Account).email,
      },
      history: [
        ...sale.history,
        {
          activity,
          reason,
          status,
          createdAt: accessDate,
        },
      ],
      blockNumber: sale.blockNumber,
      hash: sale.hash,
      tokenId: sale.tokenId,
      type: sale.type,
      price: sale.price,
      status,
      qrCode: sale.qrCode,
      createdAt: accessDate,
    };

    this.socketService.emitTicketAccess(promoter, emitAccess);
  }

  private async addOrderToEvent(event: string, order: string): Promise<void> {
    try {
      await this.eventModel.findByIdAndUpdate(event, {
        $push: { orders: order },
      });
    } catch (error) {}
  }

  public async checkAccessEvent(
    accessAccount: Account,
    sale: string,
  ): Promise<{
    access: string;
    reason: string;
    name?: string;
    email?: string;
    type?: string;
    price?: number;
  }> {
    const promoter = accessAccount.promoter!;

    const saleFound = await this.salesService.checkTicketStatus(promoter, sale);
    if (!saleFound) return { access: 'ACCESS DENIED', reason: 'TICKET NOT FOUND' };

    const client = saleFound.client as unknown as Account;
    const accessDate = new Date();

    switch (saleFound.status) {
      case TicketStatus.OPEN:
        await this.salesService.updateSale(sale, {
          history: [
            ...saleFound.history,
            {
              activity: TicketActivity.GRANTED,
              accessAccount: {
                _id: accessAccount._id,
                email: accessAccount.email,
              },
              status: TicketStatus.CLOSED,
              reason: 'Access granted.',
              createdAt: accessDate,
            },
          ],
          status: TicketStatus.CLOSED,
        });
        this.emitAccess(
          promoter,
          saleFound,
          accessDate,
          TicketActivity.GRANTED,
          'Access granted.',
          TicketStatus.CLOSED,
        );

        return {
          access: 'GRANTED',
          reason: 'Access granted,',
          name: `${client.name} ${client.lastName}`,
          email: client.email,
          type: saleFound.type,
          price: saleFound.price,
        };

      case TicketStatus.CLOSED:
        await this.salesService.updateSale(sale, {
          history: [
            ...saleFound.history,
            {
              activity: TicketActivity.DENIED,
              accessAccount: {
                _id: accessAccount._id,
                email: accessAccount.email,
              },
              status: TicketStatus.CLOSED,
              reason: 'Ticket already used.',
              createdAt: accessDate,
            },
          ],
        });

        this.emitAccess(
          promoter,
          saleFound,
          accessDate,
          TicketActivity.DENIED,
          'Ticket already used.',
          TicketStatus.CLOSED,
        );
        return {
          access: 'DENIED',
          reason: 'Ticket already used.',
          name: `${client.name} ${client.lastName}`,
          email: client.email,
          type: saleFound.type,
          price: saleFound.price,
        };

      case TicketStatus.SALE:
        await this.salesService.updateSale(sale, {
          history: [
            ...saleFound.history,
            {
              activity: TicketActivity.DENIED,
              accessAccount: {
                _id: accessAccount._id,
                email: accessAccount.email,
              },
              status: TicketStatus.SALE,
              reason: 'Ticket is on sale.',
              createdAt: accessDate,
            },
          ],
        });

        this.emitAccess(
          promoter,
          saleFound,
          accessDate,
          TicketActivity.DENIED,
          'Ticket is on sale.',
          TicketStatus.SALE,
        );
        return {
          access: 'DENIED',
          reason: 'Ticket is on sale.',
          name: `${client.name} ${client.lastName}`,
          email: client.email,
          type: saleFound.type,
          price: saleFound.price,
        };

      case TicketStatus.EXPIRED:
        await this.salesService.updateSale(sale, {
          history: [
            ...saleFound.history,
            {
              activity: TicketActivity.DENIED,
              accessAccount: {
                _id: accessAccount._id,
                email: accessAccount.email,
              },
              status: TicketStatus.EXPIRED,
              reason: 'Ticket is expired.',
              createdAt: accessDate,
            },
          ],
        });

        this.emitAccess(
          promoter,
          saleFound,
          accessDate,
          TicketActivity.DENIED,
          'Ticket expired.',
          TicketStatus.EXPIRED,
        );
        return {
          access: 'DENIED',
          reason: 'Ticket expired.',
          name: `${client.name} ${client.lastName}`,
          email: client.email,
          type: saleFound.type,
          price: saleFound.price,
        };

      case TicketStatus.PROCESSING:
        await this.salesService.updateSale(sale, {
          history: [
            ...saleFound.history,
            {
              activity: TicketActivity.DENIED,
              accessAccount: {
                _id: accessAccount._id,
                email: accessAccount.email,
              },
              status: TicketStatus.PROCESSING,
              reason: 'Processing ticket ...',
              createdAt: accessDate,
            },
          ],
        });

        this.emitAccess(
          promoter,
          saleFound,
          accessDate,
          TicketActivity.DENIED,
          'Processing ticket ...',
          TicketStatus.PROCESSING,
        );
        return {
          access: 'DENIED',
          reason: 'Processing ticket ...',
          name: `${client.name} ${client.lastName}`,
          email: client.email,
          type: saleFound.type,
          price: saleFound.price,
        };
    }

    return { access: 'DENIED', reason: 'ERROR CHECKING YOUR TICKET' };
  }
}
