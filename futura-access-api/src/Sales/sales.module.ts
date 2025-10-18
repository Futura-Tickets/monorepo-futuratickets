import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Sales, SalesSchema } from './sales.schema';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';

// SERVICES
import { SalesService } from './sales.service';

@Module({
  imports: [
    AuthModule,
    AccountModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema, collection: 'sales' }]),
  ],
  controllers: [],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
