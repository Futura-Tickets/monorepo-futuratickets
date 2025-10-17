import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
  Req,
  Res,
  HttpCode,
  Header,
} from '@nestjs/common';
import { Response } from 'express';

// GOOGLE CLOUD STORAGE
import { StorageFileInterceptor } from '../Storage/storage.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

// MONGOOSE
import { DeleteResult } from 'mongoose';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { AdminEventService } from './admin-event.service';
import {
  AccessPipeService,
  PromoterPipeService,
} from 'src/Account/account.service';
import { InvitationsService } from './invitations.service';

// INTERFACES
import { Account } from 'src/Account/account.interface';
import { Sale } from 'src/Sales/sales.interface';
import {
  Event,
  CreateEvent,
  UpdateEvent,
  Coupon,
  EditEvent,
  Promocode,
} from '../shared/interface';
import { CreateInvitation, Order } from 'src/Orders/orders.interface';

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

export default RequestWithRawBody;

@Controller('/admin/events')
export class AdminEventController {
  constructor(
    private adminEventService: AdminEventService,
    private invitationsService: InvitationsService,
  ) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'), StorageFileInterceptor)
  async UploadedFilesUsingInterceptor(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<{ url: string; filename: string }> {
    // The StorageFileInterceptor has already uploaded the file
    // and attached fileUrl and fileName to the request
    return {
      url: req.fileUrl,
      filename: req.fileName,
    };
  }

  @Post('/create')
  async createEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Body('createEvent') createEvent: CreateEvent,
  ): Promise<Event | undefined> {
    try {
      return await this.adminEventService.createEvent(
        createEvent,
        promoter.promoter!,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch('/update/:event')
  async updateEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('event') event: string,
    @Body('updateEvent') updateEvent: UpdateEvent,
  ): Promise<void | undefined> {
    try {
      await this.adminEventService.updateEvent(
        event,
        promoter.promoter!,
        updateEvent,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/access/:event')
  async getAccessEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('event') event: string,
  ): Promise<Event | null> {
    try {
      return await this.adminEventService.getAccessEvent(
        promoter.promoter!,
        event,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch('/access')
  async checkAccessEvent(
    @Auth(AccessPipeService) accessAccount: Account,
    @Body('sale') sale: string,
  ): Promise<{ access: string; reason: string }> {
    try {
      return await this.adminEventService.checkAccessEvent(accessAccount, sale);
    } catch (error) {
      return { access: 'DENIED', reason: 'ERROR CHECKING YOUR TICKET' };
    }
  }

  @Get('/resale/:event')
  async getResaleEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('event') event: string,
  ): Promise<Event | null> {
    try {
      return await this.adminEventService.getResaleEvent(
        promoter.promoter!,
        event,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Get('/attendants/:event')
  async getAttendantsEvent(
    @Auth(AccessPipeService) promoter: Account,
    @Param('event') event: string,
  ): Promise<Sale[]> {
    try {
      return await this.adminEventService.getAttendantsEvent(
        promoter.promoter!,
        event,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @Patch('/resale/:event')
  async setResaleEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('event') event: string,
    @Body('status') status: boolean,
  ): Promise<void> {
    try {
      await this.adminEventService.updateResaleEvent(
        promoter.promoter!,
        event,
        status,
      );
    } catch (error) {}
  }

  @Get('/')
  async getEvents(
    @Auth(PromoterPipeService) promoter: Account,
  ): Promise<Event[]> {
    return this.adminEventService.getEvents(promoter.promoter!);
  }

  @Get('/:eventId')
  async getEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
  ): Promise<Event | null> {
    return await this.adminEventService.getEvent(promoter.promoter!, eventId);
  }

  @Patch('/:eventId')
  async editEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
    @Body('editEvent') editEvent: EditEvent,
  ): Promise<Event | null> {
    return await this.adminEventService.editEvent(
      promoter.promoter!,
      eventId,
      editEvent,
    );
  }

  @Delete('/:eventId')
  async deleteEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
  ): Promise<DeleteResult> {
    return this.adminEventService.deleteEvent(promoter.promoter!, eventId);
  }

  @Get('/coupons/:eventId')
  async getCouponsByEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
  ): Promise<Coupon[]> {
    return await this.invitationsService.getCouponsByEventId(eventId);
  }

  @Post('/coupons/create')
  async createCoupon(
    @Auth(PromoterPipeService) promoter: Account,
    @Body() coupon: Coupon,
  ): Promise<Coupon> {
    return await this.invitationsService.createCoupon(coupon);
  }

  @Get('/invitations/:eventId')
  async getInvitationsByEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
  ): Promise<Sale[]> {
    return await this.adminEventService.getInvitationsByEventId(
      eventId,
      promoter.promoter!,
    );
  }

  @Post('/invitations/create')
  async createInvitation(
    @Auth(PromoterPipeService) promoter: Account,
    @Body() invitation: CreateInvitation,
  ): Promise<Order | void> {
    return await this.adminEventService.createInvitation(
      promoter.promoter!,
      invitation,
    );
  }

  @Delete('/coupons/:eventId/:code')
  async deleteCouponByCode(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
    @Param('code') code: string,
  ): Promise<DeleteResult> {
    return await this.invitationsService.deleteCoupon(eventId, code);
  }

  @Get('/promocodes/:eventId')
  async getPromocodesByEvent(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
  ): Promise<Promocode[]> {
    return await this.invitationsService.getPromocodesByEventId(eventId);
  }

  @Post('/promocodes/create')
  async createPromocode(
    @Auth(PromoterPipeService) promoter: Account,
    @Body() promocode: Promocode,
  ): Promise<Promocode> {
    return await this.invitationsService.createPromocode(promocode);
  }

  @Delete('/promocodes/:eventId/:code')
  async deletePromocodeByCode(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('eventId') eventId: string,
    @Param('code') code: string,
  ): Promise<boolean> {
    return await this.invitationsService.deletePromocode(eventId, code);
  }

  @Post('/webhook')
  @HttpCode(200)
  @Header('content-type', 'application/json')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RequestWithRawBody,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.adminEventService.handleStripeEvent(req.rawBody, signature);
      return res.json({ received: true });
    } catch (error) {
      console.log(error);
    }
  }
}
