import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

// SERVICES
import { PaymentMethodsService } from './payment-methods.service';
import { PromoterPipeService } from '../Account/account.service';

// INTERFACES
import { Account } from '../Account/account.interface';
import { CreatePaymentMethod, PaymentMethod } from './payments.interface';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Get()
  async getPaymentMethods(@Auth(PromoterPipeService) promoter: Account): Promise<PaymentMethod[]> {
    return await this.paymentMethodsService.getPaymentMethods(promoter.promoter!);
  }

  @Get(':id')
  async getPaymentMethod(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('id') id: string,
  ): Promise<PaymentMethod | null> {
    return await this.paymentMethodsService.getPaymentMethod(id, promoter.promoter!);
  }

  @Post()
  async createPaymentMethod(
    @Auth(PromoterPipeService) promoter: Account,
    @Body() createPaymentMethod: CreatePaymentMethod,
  ): Promise<PaymentMethod> {
    return await this.paymentMethodsService.createPaymentMethod(createPaymentMethod, promoter.promoter!);
  }

  @Delete(':id')
  async deletePaymentMethod(@Auth(PromoterPipeService) promoter: Account, @Param('id') id: string): Promise<boolean> {
    return await this.paymentMethodsService.deletePaymentMethod(id, promoter.promoter!);
  }
}
