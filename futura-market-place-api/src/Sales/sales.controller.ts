import { Body, Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserPipeService } from 'src/Account/account.service';
import { Auth } from 'src/Auth/auth.decorator';

// INTERFACES
import { Sale } from 'src/Sales/sales.interface';
import { Account } from '../Account/account.interface';

// SERVICES
import { SalesService } from 'src/Sales/sales.service';

@Controller('sales')
export class SalesController {

    constructor(
        private salesService: SalesService
    ) {}

    @Get('/resale/:event')
    async getEventResales(@Param('event') event: string): Promise<Sale[] | undefined> {
        try {
            return await this.salesService.getEventResales(event);
        } catch (error) {
            console.log(error);
        }
    };
    @Get('/event/:_id')
    async getEventTotalSales(@Param('_id') eventId: string): Promise<number> {
        return this.salesService.getEventSales(eventId);
    }

    @Get('/profile/:clientId')
    async getAccountSales(@Auth(UserPipeService) user: Account, @Param('clientId') clientId: string): Promise<Sale[]> {
        return await this.salesService.getAccountSales(clientId);
    }

}