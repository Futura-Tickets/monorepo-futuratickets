import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import {
  Promoter,
  PromoterClient,
  PromoterSchema,
  PromoterClientSchema,
} from './promoter.schema';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';

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
  controllers: [],
})
export class PromoterModule {}
