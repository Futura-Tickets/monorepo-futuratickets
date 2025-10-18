import { Body, Controller, Get, Param, Patch } from '@nestjs/common';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

// SERVICES
import { PromoterPipeService } from '../Account/account.service';
import { PromoterService } from './promoter.service';

// INTERFACES
import { Account, PromoterClient } from '../Account/account.interface';
import { APISettings } from './promoter.interface';

@Controller('promoters')
export class PromoterController {
  constructor(private promoterService: PromoterService) {}

  @Get('/clients')
  async getPromoterUsers(@Auth(PromoterPipeService) promoter: Account): Promise<Account[] | []> {
    return this.promoterService.getPromoterClients(promoter.promoter!);
  }

  @Get('/clients/:client')
  async getPromoterUser(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('client') client: string,
  ): Promise<PromoterClient | null> {
    return this.promoterService.getPromoterClient(promoter.promoter!, client);
  }

  // @Post()
  // async createPromoter(@Body('createPromoter') createPromoter: CreatePromoter): Promise<Promoter> {
  //     return await this.promoterService.createPromoter(createPromoter);
  // };

  @Get('/api')
  async getPromoterApi(@Auth(PromoterPipeService) promoter: Account): Promise<APISettings | void> {
    return await this.promoterService.getPromoterApiSettings(promoter.promoter!);
  }

  @Patch('/api')
  async setPromoterApi(
    @Auth(PromoterPipeService) promoter: Account,
    @Body('apiEnabled') apiEnabled: boolean,
  ): Promise<APISettings> {
    return await this.promoterService.updatePromoterApiSettings(promoter.promoter!, apiEnabled);
  }
}
