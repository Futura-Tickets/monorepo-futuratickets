import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

// MAILER
import { MailerModule } from '@nestjs-modules/mailer';

// MODULES
import { AuthModule } from 'src/Auth/auth.module';

// SERVICES
import { MailService } from './mail.service';
import { RecoverAccountMailProcessor, TicketResaleCancelMailProcessor, TicketResaleMailProcessor } from './mail.processor';

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
        BullModule.registerQueue(
            // { name: 'new-order-mail' },
            { name: 'new-account-mail' },
            { name: 'recover-account-mail' },
            { name: 'ticket-resale-mail' },
            { name: 'ticket-resale-cancel-mail' },
            { name: 'ticket-transfer-from-mail' },
            { name: 'ticket-transfer-to-mail' }
        ),
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('MAIL_HOST') || 'smtp.hostinger.com',
                    port: parseInt(configService.get('MAIL_PORT') || '465'),
                    auth: {
                        user: configService.get('MAIL_USER') || 'noreply@futuratickets.com',
                        pass: configService.get('MAIL_PASSWORD')
                    }
                }
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        // NewOrderMailProcessor,
        RecoverAccountMailProcessor,
        TicketResaleMailProcessor,
        TicketResaleCancelMailProcessor,
        MailService
    ],
    exports: [
        MailService
    ]
})
export class MailModule {}