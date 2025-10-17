import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISalesRepository } from '../../domain/repositories/ISalesRepository';
import { Sale } from '../../domain/entities/Sale';
import { SaleId } from '../../domain/value-objects/SaleId';
import { TicketStatus } from '../../domain/value-objects/TicketStatus';
import { Sales as SalesSchema, SalesDocument } from './sales.schema';

/**
 * SalesMongoRepository - Adapter
 *
 * Implementación concreta del puerto ISalesRepository usando MongoDB
 * Infrastructure Layer - Detalles de persistencia
 *
 * Hexagonal Architecture: Adapter que implementa un Port
 */
@Injectable()
export class SalesMongoRepository implements ISalesRepository {
  constructor(
    @InjectModel(SalesSchema.name)
    private readonly salesModel: Model<SalesDocument>,
  ) {}

  async save(sale: Sale): Promise<void> {
    const data = sale.toPersistence();

    await this.salesModel.findByIdAndUpdate(
      data._id,
      data,
      { upsert: true, new: true },
    );
  }

  async saveMany(sales: Sale[]): Promise<void> {
    const data = sales.map(sale => sale.toPersistence());
    await this.salesModel.insertMany(data);
  }

  async findById(id: SaleId): Promise<Sale | null> {
    const doc = await this.salesModel.findById(id.value);

    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  async findByIdWithDetails(
    id: SaleId,
    promoterId: string,
  ): Promise<Sale | null> {
    const doc = await this.salesModel
      .findOne({ _id: id.value, promoter: promoterId })
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

    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  async findOne(params: {
    id: SaleId;
    clientId: string;
    status: TicketStatus;
  }): Promise<Sale | null> {
    const doc = await this.salesModel
      .findOne({
        _id: params.id.value,
        client: params.clientId,
        status: params.status.value,
      })
      .populate({ path: 'client', model: 'Account' })
      .populate({ path: 'event', model: 'Event' });

    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  async findByPromoter(promoterId: string): Promise<Sale[]> {
    const docs = await this.salesModel
      .find({ promoter: promoterId })
      .populate({
        path: 'event',
        model: 'Event',
        select: { name: 1, promoter: 1 },
      })
      .populate({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
      })
      .sort({ createdAt: 'desc' });

    return docs.map(doc => this.toDomain(doc));
  }

  async findByEvent(eventId: string): Promise<Sale[]> {
    const docs = await this.salesModel.find({ event: eventId });
    return docs.map(doc => this.toDomain(doc));
  }

  async findResalesByEvent(eventId: string): Promise<Sale[]> {
    const docs = await this.salesModel
      .find({ event: eventId, status: 'SALE' })
      .populate({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
      })
      .sort({ createdAt: 'desc' });

    return docs.map(doc => this.toDomain(doc));
  }

  async findByEventForAccess(
    promoterId: string,
    eventId: string,
  ): Promise<Sale[]> {
    const docs = await this.salesModel.find({
      promoter: promoterId,
      event: eventId,
      $or: [{ status: 'CLOSED' }, { status: 'OPEN' }],
    });

    return docs.map(doc => this.toDomain(doc));
  }

  async findInvitationsByEvent(
    eventId: string,
    promoterId: string,
  ): Promise<Sale[]> {
    const docs = await this.salesModel
      .find({ event: eventId, promoter: promoterId, isInvitation: true })
      .populate({
        path: 'client',
        model: 'Account',
        select: { name: 1, lastName: 1, email: 1, birthdate: 1 },
      })
      .sort({ createdAt: 'desc' });

    return docs.map(doc => this.toDomain(doc));
  }

  async updateManyStatus(params: {
    eventId: string;
    currentStatuses: TicketStatus[];
    newStatus: TicketStatus;
    historyEntry: {
      status: string;
      activity: string;
      description: string;
    };
  }): Promise<number> {
    const result = await this.salesModel.updateMany(
      {
        event: params.eventId,
        status: {
          $in: params.currentStatuses.map(s => s.value),
        },
      },
      {
        $set: { status: params.newStatus.value },
        $push: {
          history: {
            ...params.historyEntry,
            date: new Date(),
          },
        },
      },
    );

    return result.modifiedCount;
  }

  async checkTicketStatus(
    promoterId: string,
    saleId: SaleId,
  ): Promise<Sale | null> {
    const doc = await this.salesModel
      .findOne({ _id: saleId.value, promoter: promoterId })
      .populate({
        path: 'client',
        model: 'Account',
        select: {
          name: 1,
          lastName: 1,
          email: 1,
          birthdate: 1,
        },
      });

    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  // Mapear de documento MongoDB a entidad de dominio
  private toDomain(doc: any): Sale {
    return Sale.fromPersistence({
      id: doc._id.toString(),
      orderId: doc.order?.toString() ?? doc.order,
      eventId: doc.event?._id?.toString() ?? doc.event,
      clientId: doc.client?._id?.toString() ?? doc.client,
      promoterId: doc.promoter?.toString() ?? doc.promoter,
      type: doc.type,
      price: doc.price,
      qrCode: doc.qrCode,
      status: doc.status,
      activity: doc.activity,
      resale: doc.resale ?? { isResale: false },
      transfer: doc.transfer ?? null,
      history: doc.history ?? [],
      isInvitation: doc.isInvitation ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
