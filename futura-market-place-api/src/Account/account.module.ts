import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';

// CONTROLLERS
import { AccountController } from './account.controller';

// MONGOOSE
import { Account, AccountSchema } from './account.schema';

// MODULES
import { AuthModule } from 'src/Auth/auth.module';
import { NotificationModule } from 'src/Notifications/notifications.module';

// SERVICES
import { AccountService } from './account.service';
import { MailModule } from 'src/Mail/mail.module';
import { SalesModule } from 'src/Sales/sales.module';

@Module({
    imports: [
        AuthModule,
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    username: configService.get('REDIS_USERNAME'),
                    password: configService.get('REDIS_PASSWORD'),
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT')
                },
              }),
            inject: [ConfigService],
        }),
        ConfigModule,
        MailModule,
        MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema, collection: 'accounts' }]),
        NotificationModule
    ],
    controllers: [
        AccountController
    ],
    providers: [
        AccountService
    ],
    exports: [
        AccountService
    ]
})
export class AccountModule { }