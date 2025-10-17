import { Injectable, Inject } from '@nestjs/common';
import { ISalesRepository } from '../../domain/repositories/ISalesRepository';
import { IQRCodeService } from '../../domain/services/IQRCodeService';
import { Sale } from '../../domain/entities/Sale';
import { Money } from '../../domain/value-objects/Money';
import { QRCode } from '../../domain/value-objects/QRCode';

/**
 * CreateSalesForOrderUseCase
 *
 * Caso de uso: Crear múltiples ventas (tickets) para una orden
 * Se ejecuta después de confirmar el pago en Stripe
 */
@Injectable()
export class CreateSalesForOrderUseCase {
  constructor(
    @Inject('ISalesRepository')
    private readonly salesRepository: ISalesRepository,
    @Inject('IQRCodeService')
    private readonly qrCodeService: IQRCodeService,
  ) {}

  async execute(params: {
    orderId: string;
    eventId: string;
    clientId: string;
    promoterId: string;
    items: Array<{
      type: string;
      price: number;
      quantity: number;
      isInvitation?: boolean;
    }>;
  }): Promise<Sale[]> {
    const sales: Sale[] = [];

    // 1. Crear ventas por cada item y cantidad
    for (const item of params.items) {
      for (let i = 0; i < item.quantity; i++) {
        // Crear entidad de dominio
        const sale = Sale.create({
          orderId: params.orderId,
          eventId: params.eventId,
          clientId: params.clientId,
          promoterId: params.promoterId,
          type: item.type,
          price: new Money(item.price),
          isInvitation: item.isInvitation ?? false,
        });

        // 2. Generar QR Code único
        const qrCodeData = await this.qrCodeService.generate(
          sale.id.value
        );
        const qrCode = new QRCode(qrCodeData);

        // 3. Asignar QR al ticket (domain logic)
        sale.generateQRCode(qrCode);

        sales.push(sale);
      }
    }

    // 4. Persistir todas las ventas
    await this.salesRepository.saveMany(sales);

    return sales;
  }
}
