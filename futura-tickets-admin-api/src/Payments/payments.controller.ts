import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

// SERVICES
import { PaymentsService } from './payments.service';
import { PromoterPipeService } from '../Account/account.service';

// INTERFACES
import { Account } from '../Account/account.interface';
import { CreatePayment, Payment } from './payments.interface';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async getPayments(@Auth(PromoterPipeService) promoter: Account): Promise<Payment[]> {
    return await this.paymentsService.getPayments(promoter.promoter!);
  }

  @Get(':id')
  async getPayment(@Auth(PromoterPipeService) promoter: Account, @Param('id') id: string): Promise<Payment | null> {
    return await this.paymentsService.getPayment(id, promoter.promoter!);
  }

  @Post()
  async createPayment(
    @Auth(PromoterPipeService) promoter: Account,
    @Body() createPayment: CreatePayment,
  ): Promise<Payment> {
    return await this.paymentsService.createPayment(createPayment, promoter.promoter!, promoter._id);
  }

  @Delete(':id')
  async deletePayment(@Auth(PromoterPipeService) promoter: Account, @Param('id') id: string): Promise<boolean> {
    return await this.paymentsService.deletePayment(id, promoter.promoter!);
  }
}
