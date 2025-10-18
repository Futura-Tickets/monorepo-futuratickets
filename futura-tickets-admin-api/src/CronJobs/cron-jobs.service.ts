import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// SERVICES
import { EventService } from '../Event/event.service';
import { SaleHistory } from '../Sales/sales.interface';
import { SalesService } from '../Sales/sales.service';

// INTERFACES
import {
  EventStatus,
  TicketActivity,
  TicketStatus,
} from '../shared/interface';

@Injectable()
export class CronJobsService {
  constructor(
    private eventService: EventService,
    private salesService: SalesService,
  ) {}

  @Cron('*/15 * * * *')
  async handleCron() {
    const activeEvents = await this.eventService.getActiveEvents();
    for (let i = 0; i < activeEvents.length; i++) {
      const event = activeEvents[i];
      // TypeScript guard: ensure event exists before accessing properties
      if (!event) continue;

      await this.checkEventStartDate(event._id, event.dateTime.startDate);
      await this.checkEventExpireDate(event._id, event.dateTime.endDate);
    }
  }

  private async checkEventStartDate(
    event: string,
    startDate: Date,
  ): Promise<void> {
    const newStartDate = new Date(startDate);

    const eventStartDate = new Date(
      newStartDate.getFullYear(),
      newStartDate.getMonth(),
      newStartDate.getDate(),
      newStartDate.getHours(),
      newStartDate.getMinutes(),
    );

    if (new Date().getTime() >= eventStartDate.getTime())
      await this.eventService.updateEventStatus(event, EventStatus.LIVE);
  }

  private async checkEventExpireDate(
    event: string,
    endDate: Date,
  ): Promise<void> {
    const newEndDate = new Date(endDate);

    const eventEndDate = new Date(
      newEndDate.getFullYear(),
      newEndDate.getMonth(),
      newEndDate.getDate(),
      newEndDate.getHours(),
      newEndDate.getMinutes(),
    );

    if (new Date().getTime() >= eventEndDate.getTime()) {
      const saleHistory: SaleHistory = {
        activity: TicketActivity.EXPIRED,
        reason: 'Ticket Expired.',
        status: TicketStatus.EXPIRED,
        createdAt: new Date(),
      };

      await this.eventService.updateEventStatus(event, EventStatus.CLOSED);
      await this.salesService.updateSalesStatus(
        event,
        saleHistory,
        TicketStatus.EXPIRED,
      );
    }
  }
}
