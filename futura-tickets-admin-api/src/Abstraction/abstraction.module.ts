import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProviderModule } from '../Provider/provider.module';
import { AbstractionService } from './abstraction.service';

@Module({
  imports: [ConfigModule, ProviderModule],
  providers: [AbstractionService],
  exports: [AbstractionService],
})
export class AbstractionModule {}
