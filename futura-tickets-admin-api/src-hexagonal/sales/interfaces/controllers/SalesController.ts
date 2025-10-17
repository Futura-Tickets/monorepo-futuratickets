import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Auth } from 'src/Auth/auth.decorator';
import { UserPipeService, PromoterPipeService } from 'src/Account/account.service';
import { Account } from 'src/Account/account.interface';
import { Promoter } from 'src/Promoter/promoter.interface';

// Use Cases
import { GetSaleByIdUseCase } from '../../application/use-cases/GetSaleByIdUseCase';
import { PutSaleForResaleUseCase } from '../../application/use-cases/PutSaleForResaleUseCase';
import { ValidateTicketEntryUseCase } from '../../application/use-cases/ValidateTicketEntryUseCase';

// DTOs
import { PutForResaleDto } from '../dto/PutForResaleDto';

/**
 * SalesController
 *
 * Interfaces Layer - Adaptador de entrada (Inbound Adapter)
 * Recibe peticiones HTTP y las traduce a comandos del dominio
 *
 * Hexagonal Architecture: Controller como Adapter
 */
@Controller('api/sales')
export class SalesController {
  constructor(
    private readonly getSaleByIdUseCase: GetSaleByIdUseCase,
    private readonly putSaleForResaleUseCase: PutSaleForResaleUseCase,
    private readonly validateTicketEntryUseCase: ValidateTicketEntryUseCase,
  ) {}

  /**
   * GET /api/sales/:id
   * Obtener detalle de una venta
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSale(
    @Param('id') saleId: string,
    @Auth(PromoterPipeService) promoter: Promoter,
  ) {
    const sale = await this.getSaleByIdUseCase.execute({
      saleId,
      promoterId: promoter._id,
    });

    if (!sale) {
      return {
        success: false,
        message: 'Sale not found',
      };
    }

    return {
      success: true,
      data: this.toResponse(sale),
    };
  }

  /**
   * PATCH /api/sales/:id/resale
   * Poner un ticket en reventa
   */
  @Patch(':id/resale')
  @HttpCode(HttpStatus.OK)
  async putForResale(
    @Param('id') saleId: string,
    @Body() dto: PutForResaleDto,
    @Auth(UserPipeService) user: Account,
  ) {
    try {
      const result = await this.putSaleForResaleUseCase.execute({
        saleId,
        clientId: user._id,
        resalePrice: dto.resalePrice,
        maxResalePrice: dto.maxResalePrice,
        accountPrivateKey: dto.accountPrivateKey,
        eventAddress: dto.eventAddress,
        tokenId: dto.tokenId,
      });

      return {
        success: true,
        message: 'Ticket successfully listed for resale',
        data: {
          sale: this.toResponse(result.sale),
          transaction: result.blockchainTx,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * POST /api/sales/:id/validate
   * Validar entrada de un ticket (access control)
   */
  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  async validateEntry(
    @Param('id') saleId: string,
    @Auth(PromoterPipeService) promoter: Promoter,
  ) {
    const result = await this.validateTicketEntryUseCase.execute({
      saleId,
      promoterId: promoter._id,
    });

    return {
      success: result.success,
      message: result.message,
      data: result.success ? this.toResponse(result.sale) : null,
    };
  }

  // Helper - Formatear respuesta
  private toResponse(sale: any) {
    return {
      id: sale.id.value,
      orderId: sale.orderId,
      eventId: sale.eventId,
      clientId: sale.clientId,
      type: sale.type,
      price: sale.price.value,
      qrCode: sale.qrCode?.value ?? null,
      status: sale.status.value,
      activity: sale.activity.value,
      resale: sale.resale.toPersistence(),
      transfer: sale.transfer?.toPersistence() ?? null,
      isInvitation: sale.isInvitation,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}
