import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// CONTROLLERS
import { AccountController } from './account.controller';

// MONGOOSE
// import { AbstractionModule } from '../Abstraction/abstraction.module'; // Temporarily disabled
import { Account, AccountSchema } from './account.schema';

// MODULES
import { AuthModule } from '../Auth/auth.module';
import { MailModule } from '../Mail/mail.module';
import { ProviderModule } from '../Provider/provider.module';

// SERVICES
import { AccountService, PromoterPipeService, UserPipeService } from './account.service';

@Module({
  imports: [
    // AbstractionModule, // Temporarily disabled
    AuthModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema, collection: 'accounts' }]),
    ProviderModule,
    MailModule,
  ],
  controllers: [AccountController],
  providers: [AccountService, PromoterPipeService, UserPipeService],
  exports: [AccountService, PromoterPipeService, UserPipeService],
})
export class AccountModule {}
