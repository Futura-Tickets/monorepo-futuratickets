import { Body, Controller, Get, Param, Header, StreamableFile } from '@nestjs/common';

// DECORATOR
import { Auth } from '../Auth/auth.decorator';

// SERVICES
import { PromoterPipeService } from '../Account/account.service';
import { QrCodeService } from '../QrCode/qrcode.service';
import { SalesService } from './sales.service';

// INTERFACES
import { Account } from '../Account/account.interface';
import { Sale } from './sales.interface';
import { PromoterMsg } from '../QrCode/qrcode.interface';

@Controller('sales')
export class SalesController {
  constructor(
    private qrCodeService: QrCodeService,
    private salesService: SalesService,
  ) {}

  @Get('/:saleId')
  async getSale(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('saleId') saleId: string,
  ): Promise<Sale | undefined | null> {
    try {
      return await this.salesService.getSale(promoter.promoter!, saleId);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/verify/:ticketCode')
  verifyTicket(
    @Param('ticketCode') ticketCode: string,
    @Body('msgSignature') msgSignature: PromoterMsg,
  ): string | undefined {
    try {
      return this.qrCodeService.verifyCode(msgSignature, ticketCode);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/resale/:event')
  async getEventResales(@Param('event') event: string): Promise<Sale[] | undefined> {
    try {
      return await this.salesService.getEventResales(event);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/')
  async getSales(@Auth(PromoterPipeService) promoter: Account): Promise<Sale[] | undefined> {
    try {
      return await this.salesService.getSales(promoter.promoter!);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/export/:eventId')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', `attachment; filename=event-sales-${new Date().toISOString()}.csv`)
  async exportEventSales(@Auth(PromoterPipeService) promoter: Account, @Param('eventId') eventId: string) {
    try {
      const csvStream = await this.salesService.generateEventSalesInfo(eventId, promoter);
      return new StreamableFile(csvStream);
    } catch (err) {
      console.log('Error exporting event info');
    }
  }
}
