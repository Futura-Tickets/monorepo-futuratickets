import { ArgumentMetadata, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// WEB3
import { ethers } from 'ethers';

// MONGOOSE
import mongoose, { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb'

// SCHEMA
import { Promoter as PromoterModel, PromoterClient as PromoterClientModel, PromoterDocument, PromoterClientDocument } from './promoter.schema';

// SERVICES
import { AuthService } from 'src/Auth/services/auth.service';

// INTERFACES
import { Account, PromoterClient } from 'src/Account/account.interface';
import { CreatePromoter, Promoter, UpdatePromoter } from './promoter.interface';

@Injectable()
export class PromoterService {

  constructor(
    @InjectModel(PromoterModel.name) private promoterModel: Model<PromoterDocument>,
    @InjectModel(PromoterClientModel.name) private promoterClientModel: Model<PromoterClientDocument>
  ) {}

  public async createPromoter(promoter: CreatePromoter): Promise<Promoter> {

    const randomWallet = ethers.Wallet.createRandom();

    const createPromoter: CreatePromoter = {
      name: promoter.name,
      image: promoter.image,
      icon: promoter.icon,
      address: randomWallet.address,
      mnemonic: randomWallet.mnemonic?.phrase,
      key: randomWallet.privateKey
    };

    return await this.promoterModel.create(createPromoter);

  };

  public async getPromoter(promoter: any): Promise<Promoter | null> {
    return this.promoterModel.findById(promoter);
  };

  public async updatePromoter(promoter: string, updatePromoter: UpdatePromoter): Promise<void> {
    await this.promoterModel.updateOne({ _id: promoter }, updatePromoter);
  };

  public async getPromoterPrivateKeyById(promoter: string): Promise<Promoter | null> {
    return await this.promoterModel.findById(promoter).select({ _id: 1, address: 1, key: 1 });
  };

  public async getPromoterByAddress(promoterAddress: string): Promise<Promoter | null> {
    return await this.promoterModel.findOne({ address: promoterAddress }).select({ name: 1, address: 1, image: 1, icon: 1 });
  };

  public async getPromoterClients(promoterId: string): Promise<Account[]> {
    const promoter = await this.promoterModel.findById(promoterId).populate({
      path: 'clients',
      model: 'PromoterClient',
      options: {
        sort: {
          createdAt: 'desc'
        }
      },
      populate: {
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, phone: 1 , orders: 1, createdAt: 1 },
        populate: {
          path: 'orders',
          model: 'Orders',
          populate: {
            path: 'sales',
            model: 'Sales'
          }
        }
      }
    });

    if (promoter) return promoter.clients as unknown as Account[];
    return [];
    
  }

  public async getPromoterClient(promoter: string, client: string): Promise<PromoterClient | null> {
    return await this.promoterClientModel.findOne({ promoter, client }).populate({
      path: 'client',
      model: 'Account',
      select: { name: 1, lastName: 1, email: 1, phone: 1 , orders: 1, createdAt: 1 },
      populate: {
        path: 'orders',
        model: 'Orders',
        options: {
          sort: {
            createdAt: 'desc'
          }
        },
        populate: [
          {
            path: 'event',
            model: 'Event'
          },
          {
            path: 'sales',
            model: 'Sales',
            options: {
              sort: {
                createdAt: 'desc'
              }
            },
            populate : {
              path: 'event',
              model: 'Event'
            }
          }
        ]
      }
    });

  }

  public async addUserToPromoter(promoter: string, client: string): Promise<void> {
    try {

      const promoterFound = await this.promoterClientModel.findOne({ promoter, client });
      if (promoterFound) return;

      const promoterClient = await this.promoterClientModel.create({ client, promoter });
      await this.promoterModel.findByIdAndUpdate(promoter, { $push: { clients: promoterClient }});

    } catch (error) {
      
    }
  }

  public async editPromoter(promoterId: string, updatePromoter: UpdatePromoter): Promise<any> {
    return await this.promoterModel.updateOne({ _id: promoterId }, updatePromoter);
  }

}

@Injectable()
export class PromoterPipeService implements PipeTransform {

    constructor(
      private authService: AuthService,
      private promoterService: PromoterService
    ) {}
    
    public async transform(apiKey: string, _metadata: ArgumentMetadata) {
      try {
        
        const payload = await this.authService.decrypt(apiKey);
        const account = await this.promoterService.getPromoter(payload);
        
        if (!account) throw new UnauthorizedException("Invalid account");

        return account;

      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
  
        throw new UnauthorizedException("Token");
      }
    }

    
}