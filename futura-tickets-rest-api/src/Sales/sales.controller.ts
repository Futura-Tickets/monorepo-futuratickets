import { Controller, Get, Param } from '@nestjs/common';

// DECORATOR
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { PromoterPipeService } from 'src/Promoter/promoter.service';
import { SalesService } from './sales.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { Sale } from './sales.interface';

@Controller('sales')
export class SalesController {

    constructor(
        private salesService: SalesService
    ) {}

    @Get('/:saleId')
    async getSale(@Auth(PromoterPipeService) promoter: Account, @Param('saleId') saleId: string): Promise<Sale | undefined | null> {
        try {
            return await this.salesService.getSale(promoter.promoter!, saleId);
        } catch (error) {
            console.log(error);
        }
    };

    @Get('/')
    async getSales(@Auth(PromoterPipeService) promoter: Account): Promise<Sale[] | undefined> {
        try {
            return await this.salesService.getSales(promoter.promoter!);
        } catch (error) {
            console.log(error);
        }
    };

};