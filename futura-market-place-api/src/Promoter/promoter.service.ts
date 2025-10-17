import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Promoter as PromoterModel, PromoterClient as PromoterClientModel, PromoterDocument, PromoterClientDocument } from './promoter.schema';
import { Event as EventModel, EventDocument } from 'src/Event/event.schema';
import { name } from 'ejs';

@Injectable()
export class PromoterService {

  constructor(
    @InjectModel(PromoterModel.name) private promoterModel: Model<PromoterDocument>,
    @InjectModel(PromoterClientModel.name) private promoterClientModel: Model<PromoterClientDocument>,
    @InjectModel(EventModel.name) private eventModel: Model<EventDocument>
  ) {}

  public async getPromoterName(promoter: string): Promise<PromoterModel | null> {
    return await this.promoterModel.findOne({ _id: promoter }).select({ name: 1 });
  }
  
  public async addUserToPromoter(promoter: string, client: string): Promise<boolean> {
    try {
        const promoterFound = await this.promoterClientModel.findOne({ promoter, client });
        if (promoterFound) return false;

        const promoterClient = await this.promoterClientModel.create({ client, promoter });
        await this.promoterModel.findByIdAndUpdate(promoter, { $push: { clients: promoterClient }});

        return true;
    } catch (error) {
        console.error('Error al añadir usuario al promotor:', error);
        return false;
    }
  }

  public async getAllPromoters(): Promise<PromoterModel[]> {
    return await this.promoterModel.find().exec();
  }

  public async getPromoterById(id: string): Promise<PromoterModel | null> {
    return await this.promoterModel.findById(id).exec();
  }

  public async createPromoter(promoterData: Partial<PromoterModel>): Promise<PromoterModel> {
    const newPromoter = new this.promoterModel(promoterData);
    return await newPromoter.save();
  }

  public async updatePromoter(id: string, promoterData: Partial<PromoterModel>): Promise<PromoterModel | null> {
    return await this.promoterModel.findByIdAndUpdate(id, promoterData, { new: true }).exec();
  }

  public async deletePromoter(id: string): Promise<PromoterModel | null> {
    return await this.promoterModel.findByIdAndDelete(id).exec();
  }

  public async getPromoterEvents(promoterId: string): Promise<any[]> {
    return await this.eventModel.find({ promoter: promoterId })
      .select({ isBlockchain: 0, blockNumber: 0, hash: 0 })
      .lean()
      .exec();
  }

}