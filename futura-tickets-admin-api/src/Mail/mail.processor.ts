import {
  Processor,
  OnQueueActive,
  OnQueueCompleted,
  Process,
} from '@nestjs/bull';
import { Job } from 'bull';

// SERVICES
import { MailService } from './mail.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { CreatedTicket } from 'src/shared/interface';
import { Order } from 'src/Orders/orders.interface';
import { TransferFromEmail, TransferToEmail } from './mail.interface';
import { Sale } from 'src/Sales/sales.interface';

@Processor('new-order-mail')
export class NewOrderMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ order: Order }>, done: any): Promise<void> {
    await this.mailService.sendOrderConfirmation(job.data.order);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending email order...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Order Email Sent!');
  }
}

@Processor('new-account-mail')
export class NewAccountMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ newAcccount: Account; password: string }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendAccountConfirmation(
      job.data.newAcccount,
      job.data.password,
    );
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending new account confirmation...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Account Confirmation Email Sent!');
  }
}

@Processor('recover-account-mail')
export class RecoverAccountMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ recoverAcccount: Account }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendRecoverAccount(job.data.recoverAcccount);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending recovering account email...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Recovering Account Email Sent!');
  }
}

@Processor('ticket-resale-mail')
export class TicketResaleMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ sale: Sale; price: number }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendResaleConfirmation(
      job.data.sale,
      job.data.price,
    );
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending resale email confirmation...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Resale Email Sent!');
  }
}

@Processor('ticket-resale-cancel-mail')
export class TicketResaleCancelMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ sale: Sale; price: number }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendResaleConfirmation(
      job.data.sale,
      job.data.price,
    );
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending resale email confirmation...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Resale Email Sent!');
  }
}

@Processor('ticket-sold-mail')
export class TicketSoldMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ createdTicket: CreatedTicket; account: Account }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendTicketSoldConfirmation(
      job.data.createdTicket,
      job.data.account,
    );
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending ticket sold ...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Ticket Sold Email Sent!');
  }
}

@Processor('ticket-transfer-from-mail')
export class TicketTransferedFromMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ transferFromEmail: TransferFromEmail }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendTransferFromConfirmation(
      job.data.transferFromEmail,
    );
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending ticket transfered from email...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Ticket Transfered From Email Sent!');
  }
}

@Processor('ticket-transfer-to-mail')
export class TicketTransferedToMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(
    job: Job<{ transferToEmail: TransferToEmail }>,
    done: any,
  ): Promise<void> {
    await this.mailService.sendTransferToConfirmation(job.data.transferToEmail);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending ticket transfered to email...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Ticket Transfered To Email Sent!');
  }
}

@Processor('ticket-invitation-to-mail')
export class TicketInvitationToMailProcessor {
  constructor(private mailService: MailService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ order: Order }>, done: any): Promise<void> {
    await this.mailService.sendInvitationToConfirmation(job.data.order);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Sending ticket transfered to email...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Ticket Transfered To Email Sent!');
  }
}
