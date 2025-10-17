import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { DeleteResult, Model } from 'mongoose';

// SCHEMA
import { Notification, NotificationDocument } from './notifications.schema';

// INTERFACES
import {
  Notification as INotification,
  CreateNotification,
} from './notifications.interface';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  public async createNotification(
    createNotification: CreateNotification,
  ): Promise<INotification> {
    return await this.notificationModel.create(createNotification);
  }

  public async getNotifications(promoter: string): Promise<INotification[]> {
    return await this.notificationModel
      .find({ promoter })
      .populate({
        path: 'orderId',
        model: 'Orders',
        populate: [
          {
            path: 'account',
            model: 'Account',
            select: { name: 1, lastName: 1 },
          },
          {
            path: 'event',
            model: 'Event',
            select: { name: 1 },
          },
          {
            path: 'sales',
            model: 'Sales',
            select: { isTransfer: 1, isResale: 1, isInvitation: 1, history: 1 },
          },
        ],
      })
      .populate({
        path: 'userId',
        model: 'Account',
        select: { name: 1, lastName: 1 },
      })
      .sort({ createdAt: -1 });
  }

  public async getNotification(
    notificationId: string,
    promoter: string,
  ): Promise<INotification | null> {
    return await this.notificationModel
      .findOne({ _id: notificationId, promoter })
      .populate({
        path: 'orderId',
        model: 'Orders',
        populate: [
          {
            path: 'account',
            model: 'Account',
            select: { name: 1, lastName: 1 },
          },
          {
            path: 'event',
            model: 'Event',
            select: { name: 1 },
          },
          {
            path: 'sales',
            model: 'Sales',
            select: { isTransfer: 1, isResale: 1, isInvitation: 1, history: 1 },
          },
        ],
      })
      .populate({
        path: 'userId',
        model: 'Account',
        select: { name: 1, lastName: 1 },
      });
  }

  public async getNotificationByOrderId(
    orderId: string,
    promoter: string,
  ): Promise<INotification | null> {
    return await this.notificationModel
      .findOne({ orderId, promoter })
      .populate({
        path: 'orderId',
        model: 'Orders',
        populate: [
          {
            path: 'account',
            model: 'Account',
            select: { name: 1, lastName: 1 },
          },
          {
            path: 'event',
            model: 'Event',
            select: { name: 1 },
          },
          {
            path: 'sales',
            model: 'Sales',
            select: { isTransfer: 1, isResale: 1, isInvitation: 1, history: 1 },
          },
        ],
      });
  }

  public async getNotificationByClientId(
    userId: string,
    promoter: string,
  ): Promise<INotification | null> {
    return await this.notificationModel.findOne({ userId, promoter }).populate({
      path: 'userId',
      model: 'Account',
      select: { name: 1, lastName: 1 },
    });
  }

  public async markAsRead(
    notificationId: string,
    promoter: string,
    userId: string,
  ): Promise<INotification | null> {
    try {
      return await this.notificationModel.findOneAndUpdate(
        { _id: notificationId, promoter, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } },
        { new: true },
      );
    } catch (error) {
      return null;
    }
  }

  public async markAllAsRead(
    promoter: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.notificationModel.updateMany(
        { promoter, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      return false;
    }
  }

  public async deleteNotification(
    notificationId: string,
    promoter: string,
  ): Promise<DeleteResult | undefined> {
    try {
      return await this.notificationModel.deleteOne({
        _id: notificationId,
        promoter,
      });
    } catch (error) {
      return undefined;
    }
  }

  public async countUnreadNotifications(
    userId: string,
    promoter: string,
  ): Promise<number> {
    try {
      return await this.notificationModel.countDocuments({
        userId: userId,
        promoter,
        readBy: { $ne: userId },
      });
    } catch (error) {
      return 0;
    }
  }
}
