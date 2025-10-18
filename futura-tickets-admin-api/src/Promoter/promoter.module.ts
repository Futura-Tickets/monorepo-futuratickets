import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// CONTROLLERS
import { PromoterController } from './promoter.controller';

// MONGOOSE
import {
  Promoter,
  PromoterClient,
  PromoterSchema,
  PromoterClientSchema,
} from './promoter.schema';

// MODULES
import { AccountModule } from '../Account/account.module';
import { AuthModule } from '../Auth/auth.module';

// SERVICES
import { PromoterService } from './promoter.service';

@Module({
  imports: [
    AccountModule,
    AuthModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Promoter.name, schema: PromoterSchema, collection: 'promoters' },
    ]),
    MongooseModule.forFeature([
      {
        name: PromoterClient.name,
        schema: PromoterClientSchema,
        collection: 'promoter-clients',
      },
    ]),
  ],
  controllers: [PromoterController],
  providers: [PromoterService],
  exports: [PromoterService],
})
export class PromoterModule {}
