import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// CONTROLLERS
import { NotificationsController } from './notifications.controller';

// MONGOOSE
import { Notification, NotificationSchema } from './notifications.schema';

// MODULES
import { AuthModule } from 'src/Auth/auth.module';

// SERVICES
import { NotificationService } from './notifications.service';
import { AccountModule } from 'src/Account/account.module';

@Module({
  imports: [
    AccountModule,
    AuthModule,
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
        collection: 'notifications',
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
