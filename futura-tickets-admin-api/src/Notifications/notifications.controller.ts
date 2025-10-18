import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

// SERVICES
import { NotificationService } from './notifications.service';
import { PromoterPipeService } from '../Account/account.service';

// INTERFACES
import { Account } from '../Account/account.interface';
import { Notification } from './notifications.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Auth(PromoterPipeService) promoter: Account,
  ): Promise<Notification[]> {
    return await this.notificationService.getNotifications(promoter.promoter!);
  }

  @Get('/:id')
  async getNotification(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<Notification | null> {
    return await this.notificationService.getNotification(
      id,
      promoter.promoter!,
    );
  }

  @Get('/order/:orderId')
  async getNotificationByOrderId(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('orderId') orderId: string,
  ): Promise<Notification | null> {
    return await this.notificationService.getNotificationByOrderId(
      orderId,
      promoter.promoter!,
    );
  }

  @Get('/client/:clientId')
  async getNotificationByClientId(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('clientId') clientId: string,
  ): Promise<Notification | null> {
    return await this.notificationService.getNotificationByClientId(
      clientId,
      promoter.promoter!,
    );
  }

  @Patch('/:id/read')
  async markAsRead(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<Notification | null> {
    return await this.notificationService.markAsRead(
      id,
      promoter.promoter!,
      promoter._id,
    );
  }

  @Patch('/read')
  async markAllAsRead(
    @Auth(PromoterPipeService) promoter: Account,
  ): Promise<{ success: boolean }> {
    const result = await this.notificationService.markAllAsRead(
      promoter.promoter!,
      promoter._id,
    );
    return { success: result };
  }

  @Get('/user/:userId/unread/count')
  async countUnreadNotifications(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('userId') userId: string,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.countUnreadNotifications(
      userId,
      promoter.promoter!,
    );
    return { count };
  }

  @Delete('/:id')
  async deleteNotification(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const result = await this.notificationService.deleteNotification(
      id,
      promoter.promoter!,
    );
    return { success: !!result };
  }
}
