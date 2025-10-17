import { Body, Controller, Get, Param, Post } from '@nestjs/common';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { AccountService } from './account.service';
import { PromoterPipeService } from 'src/Promoter/promoter.service';

// INTERFACES
import { Account, CreateAccess } from './account.interface';

@Controller('accounts')
export class AccountController {

    constructor(
        private accountService: AccountService
    ) {}

    @Get('/access/:event')
    async getEventAccessAccounts(@Auth(PromoterPipeService) promoter: Account, @Param('event') event: string): Promise<Account[]> {
        return await this.accountService.getEventAccessAccounts(promoter.promoter!, event);
    }

    @Post('/create-access')
    async createAccessAccount(@Auth(PromoterPipeService) admin: Account, @Body('createAccessAccount') createAccessAccount: CreateAccess): Promise<Account> {
        return await this.accountService.createAccessAccount(createAccessAccount, admin.promoter!);
    };

};