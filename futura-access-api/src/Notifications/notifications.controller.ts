import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

// SERVICES
import { NotificationService } from './notifications.service';
import { PromoterPipeService } from 'src/Account/account.service';

// INTERFACES
import { Notification, CreateNotification } from './notifications.interface';
import { Account } from 'src/shared/interface';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Auth(PromoterPipeService) promoter: Account,
  ): Promise<Notification[]> {
    console.log(promoter);
    return await this.notificationService.getNotifications(promoter.promoter!);
  }

  @Get(':id')
  async getNotification(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<Notification | null> {
    return await this.notificationService.getNotification(
      id,
      promoter.promoter!,
    );
  }

  @Patch(':id/read')
  async markAsRead(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<Notification | null> {
    // return await this.notificationService.markAsRead(id, promoter.promoter!, promoter._id);
    console.log(promoter);
    return null;
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

  @Patch(':id')
  async updateNotificationStatus(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
    @Body() status: { read?: boolean },
  ): Promise<Notification | null> {
    return await this.notificationService.updateNotificationStatus(
      id,
      status,
      promoter.promoter!,
    );
  }

  @Get('user/:userId/unread/count')
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

  @Delete(':id')
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
