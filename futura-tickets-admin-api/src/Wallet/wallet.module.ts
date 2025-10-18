import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WalletService } from './wallet.service';
import { Account, AccountSchema } from '../Account/account.schema';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }])],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
