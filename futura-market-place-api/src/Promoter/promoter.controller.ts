import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

// SERVICES
import { PromoterService } from './promoter.service';

// INTERFACES
import { Promoter } from './promoter.interface';

@Controller('/promoters')
export class PromoterController {

    constructor(
        private promoterService: PromoterService
    ) {}

    @Get('/')
    async getPromoters(): Promise<Promoter[]> {
        return await this.promoterService.getAllPromoters();
    }

    @Get('/:id')
    async getPromoterById(@Param('id') id: string): Promise<Promoter | null> {
        return await this.promoterService.getPromoterById(id);
    }

    @Get('/:id/events')
    async getPromoterEvents(@Param('id') id: string): Promise<any[]> {
        return await this.promoterService.getPromoterEvents(id);
    }

    @Post('/')
    async createPromoter(@Body() promoterData: Partial<Promoter>): Promise<Promoter> {
        return await this.promoterService.createPromoter(promoterData);
    }

    @Put('/:id')
    async updatePromoter(
        @Param('id') id: string,
        @Body() promoterData: Partial<Promoter>
    ): Promise<Promoter | null> {
        return await this.promoterService.updatePromoter(id, promoterData);
    }

    @Delete('/:id')
    async deletePromoter(@Param('id') id: string): Promise<Promoter | null> {
        return await this.promoterService.deletePromoter(id);
    }
}
