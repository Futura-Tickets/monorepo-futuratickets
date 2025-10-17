import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// ETHERS
import { ethers, Interface } from 'ethers';
import { encodeFunctionData } from "viem";
import { SmartAccountClient } from 'permissionless';

// MONGOOSE
import { DeleteResult, Model } from 'mongoose';

// SCHEMA
import { Event as EventSchema, EventDocument } from './event.schema';

// SERVICES
import { ProviderService } from 'src/Provider/provider.service';

// INTERFACES
import { Event, CreateEvent, UpdateEvent, EventStatus } from '../shared/interface';

// ABI
import * as EventFactoryAbi from '../abis/EventFactory.json';

// SERVICES
import { AbstractionService } from 'src/Abstraction/abstraction.service';
import { PromoterService } from 'src/Promoter/promoter.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';

@Injectable()
export class EventService {

  private eventFactoryAddress: `0x${string}`;

  constructor(
    @InjectModel(EventSchema.name) private eventModel: Model<EventDocument>,
    private abstractionService: AbstractionService,
    private configService: ConfigService,
    private promoterService: PromoterService,
    private providerService: ProviderService,
  ) {

    this.eventFactoryAddress = configService.get('EVENT_FACTORY_ADDRESS')!;

  }

  public async getEvents(promoter: string): Promise<Event[]> {
    return await this.eventModel.find({ promoter }).populate('promoter');
  };

  public async deleteEvent(event: string, promoter: string): Promise<DeleteResult> {
    return await this.eventModel.deleteOne({ event, promoter });
  };

  public async getEvent(promoter: string, event: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event, promoter }).populate({
      path: 'orders',
      model: 'Orders',
      options: {
        sort: {
          createdAt: 'desc'
        }
      },
      populate: [
        {
          path: 'account',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1 },
        },
        {
          path: 'sales',
          model: 'Sales',
          select: { history: 0 },
          options: {
            sort: {
              createdAt: 'desc'
            }
          },
          populate: {
            path: 'client',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1 },
          },
        }
      ]
    }).populate('promoter');
  };

  public async getEventByCreator(promoter: string, event: string, creator: string): Promise<Event | null> {
    return await this.eventModel.findOne({ _id: event, promoter, creator }).populate({
      path: 'orders',
      model: 'Orders',
      options: {
        sort: {
          createdAt: 'desc'
        }
      },
      populate: [
        {
          path: 'account',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1 },
        },
        {
          path: 'sales',
          model: 'Sales',
          select: { history: 0 },
          options: {
            sort: {
              createdAt: 'desc'
            }
          },
          populate: {
            path: 'client',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1 },
          },
        }
      ]
    }).populate('promoter');
  };

  public async getEventsByCreator(promoter: string, creator: string): Promise<Event[]> {
    return await this.eventModel.find({ promoter, creator }).populate({
      path: 'orders',
      model: 'Orders',
      options: {
        sort: {
          createdAt: 'desc'
        }
      },
      populate: [
        {
          path: 'account',
          model: 'Account',
          select: { name: 1, lastName: 1, email: 1 },
        },
        {
          path: 'sales',
          model: 'Sales',
          select: { history: 0 },
          options: {
            sort: {
              createdAt: 'desc'
            }
          },
          populate: {
            path: 'client',
            model: 'Account',
            select: { name: 1, lastName: 1, email: 1 },
          },
        }
      ]
    }).populate('promoter');
  };

  public async createEvent(event: CreateEvent, promoter: Account): Promise<Event | undefined> {

    const createdEvent = await this.eventModel.create({ ...event, promoter: promoter.promoter });
    if (!createdEvent.isBlockchain) return createdEvent;

    const promoterAccount = await this.promoterService.getPromoterPrivateKeyById(promoter.promoter!);
    if (!promoterAccount) {
      console.log('Promoter account not found!');
      return;
    }

    const smartAcountClient = await this.abstractionService.getSmartAccountClient(promoterAccount.key as `0x${string}`);
    const tx = await this.createNftEvent(smartAcountClient, createdEvent.name);

    const provider = this.providerService.getProvider();
    const transactionReceipt = await provider.waitForTransaction(tx, 1);
    const contract = new ethers.Contract(this.eventFactoryAddress, EventFactoryAbi.abi, this.providerService.getWssProvider());

    const createdEventNft = await new Promise((resolve) => {
      contract.queryFilter('FuturaEventCreated').then((data) => {
        data.filter((log) => {

          if (log.blockNumber == transactionReceipt?.blockNumber) {

            const iface = new Interface(["event FuturaEventCreated(address indexed _address)"]);
            const decodeResult = iface.decodeEventLog('FuturaEventCreated', log.data, log.topics);

            resolve({ blockNumber: transactionReceipt.blockNumber, hash: transactionReceipt.hash, address: decodeResult[0], status: EventStatus.HOLD });
          
          }
        })
      });
    });

    await this.updateEvent(createdEvent._id, createdEvent.promoter, createdEventNft as { blockNumber: number; hash: string; address: string; status: EventStatus });
    return createdEvent;

  };

  public async updateEvent(eventId: string, promoter: string, event: UpdateEvent): Promise<void | null> {
    return await this.eventModel.findOneAndUpdate({ _id: eventId, promoter }, event);
  };

  public async updateResaleEvent(promoter: string, eventId: string, resaleStatus: boolean): Promise<void | null> {
    return await this.eventModel.findOneAndUpdate({ _id: eventId, promoter }, { $set: { "resale.isActive": resaleStatus } });
  };

  private async createNftEvent(smartAccountClient: SmartAccountClient, eventName: string): Promise<`0x${string}`> {

    const callData = encodeFunctionData({
      abi: EventFactoryAbi.abi,
      functionName: 'createNew',
      args: [smartAccountClient?.account?.address, eventName],
    });

    return this.abstractionService.sendTransaction(smartAccountClient, this.eventFactoryAddress, callData);
  
  };

}
