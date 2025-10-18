import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Event as EventSchema, EventDocument } from './event.schema';

// INTERFACES
import { Event, EventStatus } from '../shared/interface';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(EventSchema.name) private eventModel: Model<EventDocument>,
  ) {}

  public getActiveEvents(): Promise<Event[]> {
    return this.eventModel.find({
      $or: [{ status: EventStatus.LAUNCHED }, { status: EventStatus.LIVE }],
    });
  }

  public async updateEventStatus(
    eventId: string,
    status: EventStatus,
  ): Promise<void | null> {
    return await this.eventModel.findOneAndUpdate({ _id: eventId }, { status });
  }
}
