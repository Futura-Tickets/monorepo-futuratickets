import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Notification, NotificationSchema } from './notifications.schema';

// MODULES
import { AuthModule } from 'src/Auth/auth.module';
import { SocketModule } from 'src/Socket/socket.module'; // Añadir esta importación

// SERVICES
import { NotificationService } from './notifications.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    SocketModule, 
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema, collection: 'notifications' },
    ]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
