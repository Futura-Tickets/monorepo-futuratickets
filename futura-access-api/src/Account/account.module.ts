import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// CONTROLLERS
import { AccountController } from './account.controller';

// MONGOOSE
import { Account, AccountSchema } from './account.schema';

// MODULES
import { AuthModule } from 'src/Auth/auth.module';

// SERVICES
import { AccountService } from './account.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema, collection: 'accounts' },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
