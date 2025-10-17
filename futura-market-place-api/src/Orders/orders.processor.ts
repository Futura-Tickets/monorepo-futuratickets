import { Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

// SERVICES
import { OrdersService } from './orders.service';
import { SalesService } from '../Sales/sales.service';
import { MailService } from '../Mail/mail.service';
// import { SocketService } from '../Socket/socket.service';
// import { StripeService } from '../Stripe/stripe.service';

// INTERFACES
import { EmitOrder } from '../Sales/sales.interface';
import { TicketStatus, TicketActivity } from '../shared/interface';

interface ResaleJobData {
  orderId: string;
  saleId: string;
  originalOwnerId: string;
  newOwnerId: string;
  resalePrice: number;
  originalPrice: number;
}

@Processor('resale-ticket')
export class ResaleProcessor {

  private readonly logger = new Logger(ResaleProcessor.name);

  constructor(
    private ordersService: OrdersService,
    private salesService: SalesService,
    private mailService: MailService,
    // private socketService: SocketService,
    // private stripeService: StripeService
  ) {}

  @Process({ concurrency: 10 })
  async processResale(job: Job<ResaleJobData>): Promise<void> {
    const { orderId, saleId, originalOwnerId, newOwnerId, resalePrice, originalPrice } = job.data;

    this.logger.log(`Processing resale for sale ${saleId}, order ${orderId}`);

    try {
      // 1. Verify the sale exists and is in correct state
      const sale = await this.salesService.findSale(saleId, originalOwnerId, TicketStatus.SALE);

      if (!sale) {
        throw new Error(`Sale ${saleId} not found or not available for resale`);
      }

      // 2. Update sale ownership (this might already be done by webhook)
      // The webhook handles the ownership transfer when payment succeeds
      this.logger.log(`Sale ownership already updated by webhook`);

      // 3. Calculate seller payout (resale price minus platform commission)
      const commission = resalePrice * 0.05; // 5% platform fee
      const sellerPayout = resalePrice - commission;

      this.logger.log(`Resale price: €${resalePrice}, Commission: €${commission}, Seller payout: €${sellerPayout}`);

      // 4. Transfer funds to original seller (Stripe Transfer/Payout)
      // TODO: Implement Stripe Transfer to seller's connected account
      // This requires the seller to have a Stripe Connect account
      /*
      try {
        const transfer = await this.stripeService.createTransfer({
          amount: Math.round(sellerPayout * 100), // Convert to cents
          currency: 'eur',
          destination: seller.stripeAccountId,
          description: `Resale payout for ticket ${saleId}`
        });

        this.logger.log(`Transfer created: ${transfer.id}`);
      } catch (transferError) {
        this.logger.error(`Failed to transfer funds: ${transferError.message}`);
        // Store pending payout for manual processing
      }
      */

      // 5. Send confirmation emails
      try {
        // Email to seller (original owner)
        const sellerSale = await this.salesService.findSale(saleId, originalOwnerId, TicketStatus.SOLD);
        if (sellerSale) {
          await this.mailService.sendTicketSoldConfirmation(sellerSale, resalePrice);
          this.logger.log(`Confirmation email sent to seller ${originalOwnerId}`);
        }

        // Email to buyer is handled by order confirmation in webhook
      } catch (emailError: any) {
        this.logger.error(`Failed to send confirmation emails: ${emailError.message}`);
        // Don't fail the job if emails fail
      }

      // 6. Emit WebSocket event for real-time updates
      /*
      try {
        const order = await this.ordersService.getOrdersByPaymentId(orderId);
        if (order && order.length > 0) {
          this.socketService.emitOrderCreated(order[0].promoter, order[0]);
        }
      } catch (socketError) {
        this.logger.error(`Failed to emit socket event: ${socketError.message}`);
      }
      */

      this.logger.log(`✅ Resale processed successfully for sale ${saleId}`);

    } catch (error: any) {
      this.logger.error(`❌ Error processing resale: ${error.message}`);
      throw error; // Re-throw to trigger retry
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing resale job ${job.id}...`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`✅ Resale job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`❌ Resale job ${job.id} failed: ${err.message}`);
  }

};

interface TransferJobData {
  saleId: string;
  fromUserId: string;
  toUserEmail: string;
  toUserName: string;
  toUserLastName: string;
  toUserBirthdate?: Date;
  toUserPhone?: string;
  reason?: string;
}

@Processor('transfer-ticket')
export class TransferProcessor {

  private readonly logger = new Logger(TransferProcessor.name);

  constructor(
    private salesService: SalesService,
    private mailService: MailService,
    // private socketService: SocketService
  ) {}

  @Process({ concurrency: 10 })
  async processTransfer(job: Job<TransferJobData>): Promise<void> {
    const {
      saleId,
      fromUserId,
      toUserEmail,
      toUserName,
      toUserLastName,
      toUserBirthdate,
      toUserPhone,
      reason
    } = job.data;

    this.logger.log(`Processing transfer for sale ${saleId} from ${fromUserId} to ${toUserEmail}`);

    try {
      // 1. Verify the sale exists and belongs to the sender
      const sale = await this.salesService.findSale(saleId, fromUserId, TicketStatus.OPEN);

      if (!sale) {
        throw new Error(`Sale ${saleId} not found or not owned by user ${fromUserId}`);
      }

      // 2. Find or create recipient account
      // TODO: This should be handled by an AccountService method
      // For now, we'll assume the recipient account exists or will be created
      // In a real implementation, you'd need to:
      // - Check if account with toUserEmail exists
      // - If not, create a new account
      // - Get the new account ID

      this.logger.log(`Transfer recipient: ${toUserEmail}`);

      // 3. Update sale with new owner and transfer history
      const transferHistory = {
        activity: TicketActivity.TRANSFERED,
        reason: reason || 'Ticket transferred by owner',
        from: {
          _id: fromUserId,
          name: sale.client['name'] || '',
          lastName: sale.client['lastName'] || ''
        },
        to: {
          _id: 'pending', // Will be updated once we have the recipient account
          name: toUserName,
          lastName: toUserLastName
        },
        status: TicketStatus.TRANSFERED,
        createdAt: new Date()
      };

      // Note: The actual ownership transfer should be done by the endpoint that calls this processor
      // This processor handles post-transfer tasks

      await this.salesService.updateSale(saleId, {
        status: TicketStatus.TRANSFERED,
        history: [transferHistory]
      });

      this.logger.log(`Sale ${saleId} marked as transferred`);

      // 4. Send confirmation emails
      try {
        // Email to sender (from user)
        const transferFromData = {
          saleId,
          fromUserEmail: sale.client['email'] || '',
          toUserEmail,
          toUserName,
          toUserLastName,
          eventName: sale.event['name'] || 'Event',
          ticketType: sale.type
        };

        await this.mailService.sendTransferFromConfirmation(transferFromData as any);
        this.logger.log(`Transfer confirmation email sent to sender ${fromUserId}`);

        // Email to recipient (to user)
        const transferToData = {
          saleId,
          fromUserEmail: sale.client['email'] || '',
          toUserEmail,
          toUserName,
          toUserLastName,
          eventName: sale.event['name'] || 'Event',
          ticketType: sale.type,
          eventImage: sale.event['image'] || '',
          price: sale.price
        };

        await this.mailService.sendTransferToConfirmation(transferToData as any);
        this.logger.log(`Transfer notification email sent to recipient ${toUserEmail}`);

      } catch (emailError: any) {
        this.logger.error(`Failed to send transfer emails: ${emailError.message}`);
        // Don't fail the job if emails fail
      }

      // 5. Emit WebSocket event for real-time updates
      /*
      try {
        this.socketService.emitTicketTransferred(sale.promoter, {
          saleId,
          fromUserId,
          toUserEmail,
          eventId: sale.event
        });
      } catch (socketError) {
        this.logger.error(`Failed to emit socket event: ${socketError.message}`);
      }
      */

      this.logger.log(`✅ Transfer processed successfully for sale ${saleId}`);

    } catch (error: any) {
      this.logger.error(`❌ Error processing transfer: ${error.message}`);
      throw error; // Re-throw to trigger retry
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing transfer job ${job.id}...`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`✅ Transfer job ${job.id} completed successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`❌ Transfer job ${job.id} failed: ${err.message}`);
  }

};