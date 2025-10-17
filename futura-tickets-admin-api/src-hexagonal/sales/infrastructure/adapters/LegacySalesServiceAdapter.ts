import { Injectable } from '@nestjs/common';
import { SalesService } from 'src/Sales/sales.service';
import { Sale } from '../../domain/entities/Sale';

/**
 * LegacySalesServiceAdapter
 *
 * BACKWARD COMPATIBILITY LAYER
 *
 * Este adapter permite que el nuevo código hexagonal llame al código legacy
 * durante la migración gradual. Se eliminará una vez completada la migración.
 *
 * Estrategia de migración:
 * 1. Nuevos endpoints → Hexagonal
 * 2. Endpoints legacy → Este adapter (temporal)
 * 3. Una vez todos migrados → Eliminar adapter y código legacy
 */
@Injectable()
export class LegacySalesServiceAdapter {
  constructor(private readonly legacySalesService: SalesService) {}

  /**
   * Wrapper para llamar métodos legacy desde nuevo código
   */
  async getLegacySale(promoter: string, saleId: string): Promise<any> {
    return await this.legacySalesService.getSale(promoter, saleId);
  }

  async getLegacySales(promoter: string): Promise<any[]> {
    return await this.legacySalesService.getSales(promoter);
  }

  async setLegacyResale(
    accountPrivateKey: `0x${string}`,
    eventAddress: `0x${string}`,
    tokenId: number,
    price: number,
  ): Promise<any> {
    return await this.legacySalesService.setResale(
      accountPrivateKey,
      eventAddress,
      tokenId,
      price,
    );
  }

  /**
   * Helper para convertir de legacy a domain entity
   * Útil cuando migramos endpoints uno por uno
   */
  legacyToDomain(legacySale: any): Sale {
    return Sale.fromPersistence({
      id: legacySale._id,
      orderId: legacySale.order,
      eventId: legacySale.event,
      clientId: legacySale.client,
      promoterId: legacySale.promoter,
      type: legacySale.type,
      price: legacySale.price,
      qrCode: legacySale.qrCode,
      status: legacySale.status,
      activity: legacySale.activity,
      resale: legacySale.resale ?? { isResale: false },
      transfer: legacySale.transfer ?? null,
      history: legacySale.history ?? [],
      isInvitation: legacySale.isInvitation ?? false,
      createdAt: legacySale.createdAt,
      updatedAt: legacySale.updatedAt,
    });
  }
}
