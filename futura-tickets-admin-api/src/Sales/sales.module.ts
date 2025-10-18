import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Sales, SalesSchema } from './sales.schema';

// CONTROLLER
import { SalesController } from './sales.controller';

// MODULES
import { AbstractionModule } from '../Abstraction/abstraction.module'; // Using stub module
import { AccountModule } from '../Account/account.module';
import { AuthModule } from '../Auth/auth.module';
import { MailModule } from '../Mail/mail.module';
import { ProviderModule } from '../Provider/provider.module';
import { QrCodeModule } from '../QrCode/qrcode.module';

// SERVICES
import { SalesService } from './sales.service';

@Module({
  imports: [
    AbstractionModule, // Using stub module
    AuthModule,
    AccountModule,
    ConfigModule,
    MailModule,
    MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema, collection: 'sales' }]),
    ProviderModule,
    QrCodeModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
