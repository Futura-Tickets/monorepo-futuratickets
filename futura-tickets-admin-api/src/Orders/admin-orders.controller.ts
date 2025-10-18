import { Body, Controller, Get, Param, Post } from '@nestjs/common';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

// SERVICES
import { OrdersService } from './orders.service';
import { PromoterPipeService } from '../Account/account.service';

// INTERFACES
import { Account } from '../Account/account.interface';
import { Order } from './orders.interface';

@Controller('/admin/orders')
export class AdminOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/:order')
  async getOrderById(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('order') order: string,
  ): Promise<Order | null> {
    return await this.ordersService.getAdminOrder(promoter.promoter!, order);
  }

  @Post('/resend')
  async resendOrder(@Auth(PromoterPipeService) promoter: Account, @Body('orderId') orderId: string): Promise<boolean> {
    return await this.ordersService.resendOrder(orderId, promoter.promoter!);
  }
}
