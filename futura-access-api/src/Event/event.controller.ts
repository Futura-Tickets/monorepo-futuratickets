import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

// SERVICES
import { EventService } from './event.service';
import { PromocodesService } from './promocode.service';

// INTERFACES
import {
  AccessPipeService,
  PromoterPipeService,
} from 'src/Account/account.service';
import { Account, Promocode } from 'src/shared/interface';
import { Auth } from 'src/Auth/auth.decorator';
import { Sale } from 'src/Sales/sales.interface';

// DTOS
import { ValidateAccessDto } from 'src/common/dto';

@Controller('/events')
export class EventController {
  constructor(
    private eventService: EventService,
    private promocodesService: PromocodesService,
  ) {}

  @Get('/attendants/:event')
  async getAttendantsEvent(
    @Auth(AccessPipeService) promoter: Account,
    @Param('event') event: string,
  ): Promise<Sale[] | undefined> {
    try {
      return await this.eventService.getAttendantsEvent(
        promoter.promoter!,
        event,
      );
    } catch (error) {}
  }

  @Patch('/access')
  async checkAccessEvent(
    @Auth(AccessPipeService) promoter: Account,
    @Body() validateAccessDto: ValidateAccessDto,
  ): Promise<{ access: string; reason: string }> {
    try {
      return await this.eventService.checkAccessEvent(
        promoter.promoter!,
        validateAccessDto.sale,
      );
    } catch (error) {
      return { access: 'DENIED', reason: 'ERROR CHECKING YOUR TICKET' };
    }
  }

  @Get('/promocodes/:eventId')
  async getPromocodesByEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
  ): Promise<Promocode[]> {
    return await this.promocodesService.getPromocodesByEventId(eventId);
  }

  @Post('/promocodes/create')
  async createPromocode(
    @Auth(PromoterPipeService) promoter: Account,
    @Body() promocode: Promocode,
  ): Promise<Promocode> {
    return await this.promocodesService.createPromocode(promocode);
  }

  @Delete('/promocodes/:eventId/:code')
  async deletePromocodeByCode(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
    @Param('code') code: string,
  ): Promise<boolean> {
    return await this.promocodesService.deletePromocode(eventId, code);
  }
}
