import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AbstractionService } from './abstraction.service';
import { ProviderModule } from '../Provider/provider.module';

@Module({
  imports: [ConfigModule, ProviderModule],
  providers: [AbstractionService],
  exports: [AbstractionService],
})
export class AbstractionModule {}
