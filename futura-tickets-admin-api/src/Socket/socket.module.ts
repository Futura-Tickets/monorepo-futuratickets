import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// MODULES
import { AuthModule } from '../Auth/auth.module';

// SERVICES
import { SocketService } from './socket.service';

@Module({
  imports: [AuthModule, ConfigModule],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}
