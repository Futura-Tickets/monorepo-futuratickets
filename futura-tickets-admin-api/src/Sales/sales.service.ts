import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

// ETHERS
import { encodeFunctionData } from 'viem';

// MONGOOSE
import { Model, UpdateWriteOpResult } from 'mongoose';

// SCHEMA
import { Sales as SalesSchema, SalesDocument } from './sales.schema';

// SERVICES
import {
  AbstractionService,
  FuturaAccountClient,
} from '../Abstraction/abstraction.service'; // Temporarily using stub
import { ProviderService } from 'src/Provider/provider.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { CreateSale, Sale, SaleHistory, UpdateSale } from './sales.interface';
import { TicketStatus } from 'src/shared/interface';

// ABI
import * as EventAbi from '../abis/Event.json';

@Injectable()
export class SalesService {
  constructor(
    private abstractionService: AbstractionService,
    private providerService: ProviderService,
    @InjectModel(SalesSchema.name) private salesModel: Model<SalesDocument>,
  ) {}

  public async getSale(promoter: string, saleId: string): Promise<Sale | null> {
    return await this.salesModel
      .findOne({ _id: saleId, promoter })
      .populate({
        path: 'client',
        model: 'Account',
        select: {
          name: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          birthdate: 1,
        },
      })
      .populate({
        path: 'event',
        model: 'Event',
        select: {
          name: 1,
          promoter: 1,
          address: 1,
          ticketImage: 1,
          dateTime: 1,
        },
      });
  }

  public async getResales(sales: string[]): Promise<Sale[]> {
    return await this.salesModel.find({ _id: sales });
  }

  public async findSale(
    sale: string,
    client: string,
    status: TicketStatus,
  ): Promise<Sale | null> {
    return await this.salesModel
      .findOne({ _id: sale, client, status })
      .populate({
        path: 'client',
        model: 'Account',
      })
      .populate({
        path: 'event',
        model: 'Event',
      });
  }

  public async getSales(promoter: string): Promise<Sale[]> {
    return await this.salesModel
      .find({ promoter })
      .populate({
        path: 'event',
        model: 'Event',
        select: {
          name: 1,
          promoter: 1,
        },
      })
      .populate({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
      })
      .sort({ createdAt: 'desc' });
  }

  public async getEventResales(event: string): Promise<Sale[]> {
    return await this.salesModel
      .find({ event, status: TicketStatus.SALE })
      .populate({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
      })
      .sort({ createdAt: 'desc' });
  }

  public async getAccessEvent(
    promoter: string,
    event: string,
  ): Promise<Sale[]> {
    return this.salesModel.find({
      promoter,
      event,
      $or: [{ status: TicketStatus.CLOSED }, { status: TicketStatus.OPEN }],
    });
  }

  public async updateSale(
    saleId: string,
    updateSale: UpdateSale,
  ): Promise<Sale | null> {
    return this.salesModel.findByIdAndUpdate({ _id: saleId }, updateSale);
  }

  public async updateSalesStatus(
    event: string,
    history: SaleHistory,
    status: TicketStatus,
  ): Promise<UpdateWriteOpResult> {
    return this.salesModel.updateMany(
      {
        event,
        $or: [{ status: TicketStatus.OPEN }, { status: TicketStatus.SALE }],
      },
      { $push: { history, status } },
    );
  }

  public async createSale(createSale: CreateSale): Promise<Sale> {
    return this.salesModel.create(createSale);
  }

  public async createSales(createSale: CreateSale[]): Promise<Sale[]> {
    return this.salesModel.create(createSale);
  }

  public async accessEvent(
    promoter: string,
    sale: string,
  ): Promise<Sale | null> {
    return this.salesModel.findOneAndUpdate(
      { _id: sale, promoter },
      { status: TicketStatus.CLOSED },
      { new: true },
    );
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
        birthdate: 1,
      },
    });
  }

  public async setResale(
    accountPrivateKey: `0x${string}`,
    eventAddress: `0x${string}`,
    tokenId: number,
    price: number,
  ): Promise<{
    blockNumber: number;
    hash: string;
    tokenId: number;
    price: number;
  }> {
    console.log('Resaling transaction started!');

    const smartAcountClient =
      await this.abstractionService.getSmartAccountClient(accountPrivateKey);

    console.log('Smart account client found!');
    const nftTicketPriceTx = await this.setNftTicketPrice(
      smartAcountClient,
      eventAddress,
      tokenId,
      price,
    );

    console.log('Set resaling transaction done!');
    const provider = this.providerService.getProvider();
    const nftTicketPriceReceipt = await provider.waitForTransaction(
      nftTicketPriceTx,
      1,
    );

    return {
      blockNumber: nftTicketPriceReceipt!.blockNumber,
      hash: nftTicketPriceReceipt!.hash,
      tokenId,
      price: Number(price),
    };
  }

  public async cancelResaleTicket(
    accountPrivateKey: `0x${string}`,
    eventAddress: `0x${string}`,
    tokenId: number,
  ): Promise<{ blockNumber: number; hash: string; tokenId: number }> {
    console.log('Cancel resale ticket transaction started!');

    const smartAcountClient =
      await this.abstractionService.getSmartAccountClient(accountPrivateKey);
    const nftTicketTransferTx = await this.cancelNftTicket(
      smartAcountClient,
      eventAddress,
      tokenId,
    );

    console.log('Cancel resale ticket transaction done!');
    const provider = this.providerService.getProvider();
    const cancelResaleTransferReceipt = await provider.waitForTransaction(
      nftTicketTransferTx,
      1,
    );

    return {
      blockNumber: cancelResaleTransferReceipt!.blockNumber,
      hash: cancelResaleTransferReceipt!.hash,
      tokenId,
    };
  }

  private async setNftTicketPrice(
    smartAccountClient: FuturaAccountClient,
    eventAddress: `0x${string}`,
    tokenId: number,
    price: number,
  ): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'setNFTPrice',
      args: [tokenId, price],
    });

    return this.abstractionService.sendTransaction(
      smartAccountClient,
      eventAddress,
      callData,
    );
  }

  private async cancelNftTicket(
    smartAccountClient: FuturaAccountClient,
    eventAddress: `0x${string}`,
    tokenId: number,
  ): Promise<`0x${string}`> {
    const callData = encodeFunctionData({
      abi: EventAbi.abi,
      functionName: 'cancelResale',
      args: [tokenId],
    });

    return this.abstractionService.sendTransaction(
      smartAccountClient,
      eventAddress,
      callData,
    );
  }

  public async getInvitationsByEventId(
    event: string,
    promoter: string,
  ): Promise<Sale[]> {
    return await this.salesModel
      .find({ event, promoter, isInvitation: true })
      .populate({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
      })
      .sort({ createdAt: 'desc' });
  }

  public async generateEventSalesInfo(
    eventId: string,
    promoter: Account,
  ): Promise<Readable> {
    const sales = await this.salesModel
      .find({ event: eventId, promoter: promoter._id })
      .populate({
        path: 'client',
        model: 'Account',
        select: {
          _id: 0,
          email: 1,
        },
      })
      .populate({
        path: 'event',
        model: 'Event',
        select: {
          _id: 0,
          name: 1,
        },
      })
      .populate({
        path: 'promoter',
        model: 'Promoter',
        select: {
          _id: 0,
          name: 1,
        },
      });

    const csvStream = fastcsv.format({ headers: true });

    const dataStream = new Readable({
      objectMode: true,
      read() {},
    });

    sales.forEach((sale) => {
      dataStream.push({
        clientEmail: sale.client,
        event: sale.event,
        promoter: sale.promoter,
        type: sale.type,
        price: sale.price,
        status: sale.status,
      });
    });

    dataStream.push(null);
    dataStream.pipe(csvStream);

    return csvStream;
  }
}
