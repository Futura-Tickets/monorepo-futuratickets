import { Processor, OnQueueActive, OnQueueCompleted, Process } from '@nestjs/bull';
import { Job } from 'bull';

// SERVICES
import { AdminEventService } from './admin-event.service';
import { UserEventService } from './user-event.service';

// INTERFACES
import { EmitOrder } from '../Sales/sales.interface';
import { ConfirmTransferTicket, MintTicket, TransferResaleTicket, TransferTicket } from '../shared/interface';

@Processor('create-order')
export class CreateTicketProcessor {
  constructor(private adminEventService: AdminEventService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ paymentId: string }>, done: any): Promise<void> {
    await this.adminEventService.createOrder(job.data.paymentId);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Creating order...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Order Created!');
  }
}

@Processor('ticket-mint')
export class TicketMintProcessor {
  constructor(private adminEventService: AdminEventService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ mintTicket: MintTicket }>, done: any): Promise<void> {
    await this.adminEventService.mintTicket(job.data.mintTicket);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Processing Ticket...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job, _result: EmitOrder) {
    console.log('Ticket Processed!');
  }
}

@Processor('ticket-transfer')
export class TicketTransferProcessor {
  constructor(private userEventService: UserEventService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ transferTicket: TransferTicket }>, done: any): Promise<void> {
    const transferedTicket = await this.userEventService.processTicketTransfer(job.data.transferTicket);
    done(null, transferedTicket);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Transfering Ticket...`);
  }

  @OnQueueCompleted()
  async onCompleted(_job: Job, _result: ConfirmTransferTicket) {
    console.log('Ticket Transfered!');
  }
}

@Processor('ticket-invitation')
export class TicketInvitationProcessor {
  constructor(private adminEventService: AdminEventService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ mintInvitationTicket: MintTicket }>, done: any): Promise<void> {
    await this.adminEventService.mintTicket(job.data.mintInvitationTicket);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Processing Invitation Ticket...`);
  }

  @OnQueueCompleted()
  async onCompleted(_job: Job, _result: EmitOrder) {
    console.log('Invitation Ticket Processed!');
  }
}

@Processor('ticket-resale-transfer')
export class TicketResaleTransferProcessor {
  constructor(private adminEventService: AdminEventService) {}

  @Process({ concurrency: 10 })
  async transcode(job: Job<{ transferResaleTicket: TransferResaleTicket }>, done: any): Promise<void> {
    await this.adminEventService.transferResaleTicket(job.data.transferResaleTicket);
    done(null);
  }

  @OnQueueActive()
  onActive(_job: Job) {
    console.log(`Transfering Resale Ticket...`);
  }

  @OnQueueCompleted()
  onCompleted(_job: Job) {
    console.log('Ticket Resale transfered!');
  }
}
