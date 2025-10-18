import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// MODULES
import { AccountModule } from '../Account/account.module';

// SERVICES
import { QrCodeService } from './qrcode.service';
import { PromoterModule } from '../Promoter/promoter.module';

@Module({
  imports: [AccountModule, ConfigModule, PromoterModule],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
