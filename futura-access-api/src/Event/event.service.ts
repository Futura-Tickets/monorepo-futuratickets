import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Event as EventSchema, EventDocument } from './event.schema';

// SERVICES
import { SalesService } from 'src/Sales/sales.service';
import { SocketService } from 'src/Socket/socket.service';

// INTERFACES
import { Account, Event, TicketActivity, TicketStatus } from 'src/shared/interface';
import { EmitAccess, Sale } from 'src/Sales/sales.interface';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(EventSchema.name) private eventModel: Model<EventDocument>,
    private salesService: SalesService,
    private socketService: SocketService,
  ) {}

  public async getEvents(): Promise<Event[]> {
    return this.eventModel.find();
  }

  public async getAttendants(): Promise<Event[]> {
    return this.eventModel.find();
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
          select: { name: 1, lastName: 1, email: 1 },
        },
      },
    });

    if (attendantsEvent) return attendantsEvent.orders.flatMap((order: any) => order.sales as unknown as Sale[]);
    return [];
  }

  public async checkAccessEvent(
    promoter: string,
    sale: string,
  ): Promise<{
    access: string;
    reason: string;
    name?: string;
    email?: string;
    type?: string;
    price?: number;
  }> {
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

  private emitAccess(
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
        phone: (sale.client as unknown as Account).phone || 'N/A',
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
}
