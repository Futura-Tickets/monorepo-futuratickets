import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Notification, NotificationDocument } from './notifications.schema';

// INTERFACES
import { Notification as INotification, CreateUserNotification, CreateOrderNotification } from './notifications.interface';

@Injectable()
export class NotificationService {
  
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  public async createNotification(createNotification: CreateUserNotification | CreateOrderNotification): Promise<INotification> {
    return await this.notificationModel.create(createNotification);
  };
}