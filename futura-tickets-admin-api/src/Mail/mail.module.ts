import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { BullModule } from '@nestjs/bull'; // Temporarily disabled - Redis not available

// MAILER
import { MailerModule } from '@nestjs-modules/mailer';

// MODULES
import { AuthModule } from '../Auth/auth.module';

// SERVICES
import { MailService } from './mail.service';
// Processors temporarily disabled - Bull/Redis not available
// import {
//   NewOrderMailProcessor,
//   RecoverAccountMailProcessor,
//   TicketInvitationToMailProcessor,
//   TicketResaleCancelMailProcessor,
//   TicketResaleMailProcessor,
//   TicketSoldMailProcessor,
//   TicketTransferedFromMailProcessor,
//   TicketTransferedToMailProcessor,
// } from './mail.processor';

@Module({
  imports: [
    AuthModule,
    // BullModule.forRootAsync({ // Temporarily disabled - Redis not available
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     redis: {
    //       username: configService.get('REDIS_USERNAME'),
    //       password: configService.get('REDIS_PASSWORD'),
    //       host: configService.get('REDIS_HOST'),
    //       port: configService.get('REDIS_PORT'),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // BullModule.registerQueue( // Temporarily disabled - Redis not available
    //   { name: 'new-order-mail' },
    //   { name: 'new-account-mail' },
    //   { name: 'recover-account-mail' },
    //   { name: 'ticket-resale-mail' },
    //   { name: 'ticket-resale-cancel-mail' },
    //   { name: 'ticket-sold-mail' },
    //   { name: 'ticket-transfer-from-mail' },
    //   { name: 'ticket-transfer-to-mail' },
    //   { name: 'ticket-invitation-to-mail' },
    // ),
    ConfigModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.hostinger.com',
        port: 465,
        auth: {
          user: 'noreply@futuratickets.com',
          pass: 'z>h4u>Q9',
        },
      },
    }),
  ],
  providers: [
    // NewOrderMailProcessor, // Temporarily disabled - Bull/Redis not available
    // RecoverAccountMailProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketInvitationToMailProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketResaleMailProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketResaleCancelMailProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketSoldMailProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketTransferedFromMailProcessor, // Temporarily disabled - Bull/Redis not available
    // TicketTransferedToMailProcessor, // Temporarily disabled - Bull/Redis not available
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
