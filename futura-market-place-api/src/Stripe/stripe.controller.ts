import { Controller, Get, Post, HttpCode, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import * as qrcode from 'qrcode';

// SERVICES
import { StripeService } from './stripe.service';
import { OrdersService } from '../Orders/orders.service';
import { SalesService } from '../Sales/sales.service';
import { MailService } from '../Mail/mail.service';

// INTERFACES
import { OrderStatus } from '../Orders/orders.interface';
import { CreateSale } from '../Sales/sales.interface';
import { TicketStatus, TicketActivity } from '../shared/interface';

@Controller('stripe')
export class StripeController {

    private readonly logger = new Logger(StripeController.name);
    private publishableKey: string;

    constructor(
        private stripeService: StripeService,
        private configService: ConfigService,
        private ordersService: OrdersService,
        private salesService: SalesService,
        private mailService: MailService
    ) {
        this.publishableKey = this.configService.get('STRIPE_PUBLIC_KEY')!;
    }

    @Get('/config')
    getStripeConfig(): { config: string } {
        return { config: this.stripeService.publishableKey() };
    }

    @Post('/webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<void> {
        const sig = req.headers['stripe-signature'] as string;

        let event: Stripe.Event;

        try {
            // Validate webhook signature
            event = this.stripeService.registerEvents(req.body, sig);
        } catch (err: any) {
            this.logger.error(`⚠️  Webhook signature verification failed: ${err.message}`);
            res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    await this.handlePaymentIntentSucceeded(paymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object as Stripe.PaymentIntent;
                    await this.handlePaymentIntentFailed(failedPayment);
                    break;

                case 'charge.refunded':
                    const refund = event.data.object as Stripe.Charge;
                    await this.handleChargeRefunded(refund);
                    break;

                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }

            res.json({ received: true });
        } catch (err: any) {
            this.logger.error(`Error handling webhook event: ${err.message}`);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`Webhook handler error: ${err.message}`);
        }
    }

    private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        this.logger.log(`✅ Payment succeeded: ${paymentIntent.id}`);

        try {
            // 1. Find orders by paymentId
            const orders = await this.ordersService.getOrdersByPaymentId(paymentIntent.id);

            if (!orders || orders.length === 0) {
                this.logger.warn(`⚠️  No orders found for payment: ${paymentIntent.id}`);
                return;
            }

            this.logger.log(`Found ${orders.length} order(s) to process`);

            // 2. Process each order
            for (const order of orders) {
                const createdSaleIds: string[] = [];

                // 3. Create tickets (sales) for primary items
                if (order.items && order.items.length > 0) {
                    for (const item of order.items) {
                        // Create 'amount' number of tickets for this item type
                        for (let i = 0; i < item.amount; i++) {
                            const saleData: CreateSale = {
                                event: order.event['_id'] || order.event,
                                client: order.account['_id'] || order.account,
                                promoter: order.promoter['_id'] || order.promoter,
                                order: order._id,
                                type: item.type,
                                price: item.price,
                                status: TicketStatus.OPEN,
                                history: [{
                                    activity: TicketActivity.PROCESSED,
                                    reason: 'Payment successful',
                                    status: TicketStatus.OPEN,
                                    createdAt: new Date()
                                }]
                            };

                            const createdSale = await this.salesService.createSale(saleData);

                            // 4. Generate QR code
                            const qrCodeData = await qrcode.toDataURL(createdSale._id);
                            await this.salesService.updateSale(createdSale._id, { qrCode: qrCodeData });

                            createdSaleIds.push(createdSale._id);
                            this.logger.log(`Created ticket: ${createdSale._id} (${item.type})`);
                        }
                    }
                }

                // Handle resale items (update existing sales)
                if (order.resaleItems && order.resaleItems.length > 0) {
                    for (const resaleItem of order.resaleItems) {
                        if (resaleItem.sale) {
                            // Update the resold ticket with new owner
                            await this.salesService.updateSale(resaleItem.sale, {
                                client: order.account['_id'] || order.account,
                                status: TicketStatus.OPEN,
                                history: [{
                                    activity: TicketActivity.PROCESSED,
                                    reason: 'Resale purchase completed',
                                    status: TicketStatus.OPEN,
                                    createdAt: new Date()
                                }]
                            });

                            createdSaleIds.push(resaleItem.sale);
                            this.logger.log(`Updated resale ticket: ${resaleItem.sale}`);
                        }
                    }
                }

                // 5. Update order with sales and status
                await this.ordersService.updateOrderById(order._id, {
                    sales: createdSaleIds,
                    status: OrderStatus.SUCCEEDED
                });

                this.logger.log(`Order ${order._id} updated successfully`);

                // 6. Send confirmation email
                try {
                    // Fetch complete order with populated sales for email
                    const completeOrders = await this.ordersService.getOrdersByPaymentId(paymentIntent.id);
                    const completeOrder = completeOrders.find(o => o._id === order._id);

                    if (completeOrder) {
                        await this.mailService.sendOrderConfirmation(completeOrder);
                        this.logger.log(`Confirmation email sent for order ${order._id}`);
                    }
                } catch (emailError: any) {
                    this.logger.error(`Failed to send confirmation email for order ${order._id}: ${emailError.message}`);
                    // Don't fail the webhook if email fails
                }
            }

            this.logger.log(`✅ Successfully processed payment ${paymentIntent.id}`);

        } catch (error: any) {
            this.logger.error(`❌ Error processing payment ${paymentIntent.id}: ${error.message}`);
            throw error; // Re-throw to trigger webhook retry
        }
    }

    private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        this.logger.log(`❌ Payment failed: ${paymentIntent.id}`);

        try {
            // 1. Find orders by paymentId
            const orders = await this.ordersService.getOrdersByPaymentId(paymentIntent.id);

            if (!orders || orders.length === 0) {
                this.logger.warn(`⚠️  No orders found for failed payment: ${paymentIntent.id}`);
                return;
            }

            // 2. Log failure reason
            const failureReason = paymentIntent.last_payment_error?.message || 'Unknown error';
            this.logger.error(`Payment failure reason: ${failureReason}`);

            // 3. Orders remain in PENDING status - they can be retried
            // No need to update status as frontend will handle retry
            this.logger.log(`Payment ${paymentIntent.id} failed but orders remain in PENDING state for retry`);

        } catch (error: any) {
            this.logger.error(`Error handling failed payment ${paymentIntent.id}: ${error.message}`);
            // Don't throw - failed payment handling shouldn't break webhook
        }
    }

    private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
        this.logger.log(`💰 Charge refunded: ${charge.id}`);

        try {
            // Get payment intent ID from charge
            const paymentIntentId = typeof charge.payment_intent === 'string'
                ? charge.payment_intent
                : charge.payment_intent?.id;

            if (!paymentIntentId) {
                this.logger.warn(`⚠️  No payment intent found for refunded charge: ${charge.id}`);
                return;
            }

            // 1. Find orders by paymentId
            const orders = await this.ordersService.getOrdersByPaymentId(paymentIntentId);

            if (!orders || orders.length === 0) {
                this.logger.warn(`⚠️  No orders found for refunded payment: ${paymentIntentId}`);
                return;
            }

            // 2. Mark all tickets as EXPIRED/CLOSED
            for (const order of orders) {
                if (order.sales && order.sales.length > 0) {
                    for (const saleId of order.sales) {
                        await this.salesService.updateSale(saleId as string, {
                            status: TicketStatus.EXPIRED,
                            history: [{
                                activity: TicketActivity.EXPIRED,
                                reason: 'Payment refunded',
                                status: TicketStatus.EXPIRED,
                                createdAt: new Date()
                            }]
                        });
                        this.logger.log(`Marked ticket as expired: ${saleId}`);
                    }
                }

                // Update order status (could add REFUNDED status to enum in future)
                this.logger.log(`Order ${order._id} tickets expired due to refund`);
            }

            this.logger.log(`✅ Successfully processed refund for payment ${paymentIntentId}`);

        } catch (error: any) {
            this.logger.error(`Error handling refund for charge ${charge.id}: ${error.message}`);
            // Don't throw - refund handling shouldn't break webhook
        }
    }

};