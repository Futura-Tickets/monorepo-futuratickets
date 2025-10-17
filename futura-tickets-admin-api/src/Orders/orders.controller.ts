import { Controller, Get } from '@nestjs/common';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { OrdersService } from './orders.service';
import { UserPipeService } from 'src/Account/account.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { Order } from './orders.interface';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/config')
  getOrderConfig(): { config: string } {
    return { config: this.ordersService.getOrderConfig() };
  }

  @Get('/')
  async getOrdersByAccount(
    @Auth(UserPipeService) user: Account,
  ): Promise<Order[] | undefined> {
    try {
      return await this.ordersService.getOrdersByAccount(user._id!);
    } catch (error) {
      console.log(error);
    }
  }
}
