import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// WEB3
import { ethers } from 'ethers';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import {
  Promoter as PromoterModel,
  PromoterClient as PromoterClientModel,
  PromoterDocument,
  PromoterClientDocument,
} from './promoter.schema';

// SERVICES
import { AuthService } from '../Auth/services/auth.service';

// INTERFACES
import { Account, PromoterClient } from '../Account/account.interface';
import { APISettings, CreatePromoter, Promoter } from './promoter.interface';

@Injectable()
export class PromoterService {
  constructor(
    @InjectModel(PromoterModel.name)
    private promoterModel: Model<PromoterDocument>,
    @InjectModel(PromoterClientModel.name)
    private promoterClientModel: Model<PromoterClientDocument>,
    private readonly authService: AuthService,
  ) {}

  public async createPromoter(promoter: CreatePromoter): Promise<Promoter> {
    const randomWallet = ethers.Wallet.createRandom();

    const createPromoter: CreatePromoter = {
      name: promoter.name,
      image: promoter.image,
      icon: promoter.icon,
      address: randomWallet.address,
      mnemonic: randomWallet.mnemonic?.phrase,
      key: randomWallet.privateKey,
    };

    return await this.promoterModel.create(createPromoter);
  }

  public async updatePromoterApiSettings(promoter: string, apiEnabled: boolean): Promise<APISettings> {
    if (apiEnabled) {
      const apiKey = this.authService.encrypt(promoter.toString());
      await this.promoterModel.updateOne({ _id: promoter }, { api: { isApiEnabled: true, apiKey } });
      return { isApiEnabled: true, apiKey };
    }
    await this.promoterModel.updateOne({ _id: promoter }, { api: { isApiEnabled: false, apiKey: null } });
    return { isApiEnabled: false, apiKey: '' };
  }

  public async getPromoterApiSettings(promoter: string): Promise<APISettings | void> {
    const foundPromoter = await this.promoterModel.findById({ _id: promoter });
    if (foundPromoter) return foundPromoter.api;
    return;
  }

  public async getPromoterPrivateKeyById(promoter: string): Promise<Promoter | null> {
    return await this.promoterModel.findById(promoter).select({ _id: 1, address: 1, key: 1 });
  }

  public async getPromoterByAddress(promoterAddress: string): Promise<Promoter | null> {
    return await this.promoterModel
      .findOne({ address: promoterAddress })
      .select({ name: 1, address: 1, image: 1, icon: 1 });
  }

  public async getPromoterClients(promoterId: string): Promise<Account[]> {
    const promoter = await this.promoterModel.findById(promoterId).populate({
      path: 'clients',
      model: 'PromoterClient',
      options: {
        sort: {
          createdAt: 'desc',
        },
      },
      populate: {
        path: 'client',
        model: 'Account',
        select: {
          name: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          orders: 1,
          birthdate: 1,
          createdAt: 1,
        },
        populate: {
          path: 'orders',
          model: 'Orders',
          populate: {
            path: 'sales',
            model: 'Sales',
          },
        },
      },
    });

    if (promoter) return promoter.clients as unknown as Account[];
    return [];
  }

  public async getPromoterClient(promoter: string, client: string): Promise<PromoterClient | null> {
    return await this.promoterClientModel.findOne({ promoter, client }).populate({
      path: 'client',
      model: 'Account',
      select: {
        name: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        orders: 1,
        birthdate: 1,
        createdAt: 1,
      },
      populate: {
        path: 'orders',
        model: 'Orders',
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
        populate: [
          {
            path: 'event',
            model: 'Event',
          },
          {
            path: 'sales',
            model: 'Sales',
            options: {
              sort: {
                createdAt: 'desc',
              },
            },
            populate: {
              path: 'event',
              model: 'Event',
            },
          },
        ],
      },
    });
  }

  public async addUserToPromoter(promoter: string, client: string): Promise<void> {
    try {
      const promoterFound = await this.promoterClientModel.findOne({
        promoter,
        client,
      });
      if (promoterFound) return;

      const promoterClient = await this.promoterClientModel.create({
        client,
        promoter,
      });
      await this.promoterModel.findByIdAndUpdate(promoter, {
        $push: { clients: promoterClient },
      });
    } catch (error) {}
  }
}
