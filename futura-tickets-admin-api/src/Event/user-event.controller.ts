import { Body, Controller, Patch } from '@nestjs/common';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

// SERVICES
import { UserEventService } from './user-event.service';
import { UserPipeService } from '../Account/account.service';

// INTERFACES
import { Account } from '../Account/account.interface';
import { TransferToTicket } from '../shared/interface';

@Controller('/user/events')
export class UserEventController {
  constructor(private userEventService: UserEventService) {}

  @Patch('/resale')
  async resale(
    @Auth(UserPipeService) user: Account,
    @Body('sale') sale: string,
    @Body('resalePrice') resalePrice: number,
  ): Promise<void> {
    try {
      await this.userEventService.resale(sale, user._id, resalePrice);
    } catch (error) {
      console.log(error);
    }
  }

  @Patch('/cancel-resale')
  async cancelResale(
    @Auth(UserPipeService) user: Account,
    @Body('sale') sale: string,
  ): Promise<void> {
    try {
      await this.userEventService.cancelResale(sale, user._id);
    } catch (error) {
      console.log(error);
    }
  }

  @Patch('/transfer')
  async transfer(
    @Auth(UserPipeService) user: Account,
    @Body('sale') sale: string,
    @Body('transferToTicket') transferToTicket: TransferToTicket,
  ): Promise<void> {
    try {
      await this.userEventService.transferTicket(
        sale,
        user._id,
        transferToTicket,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
