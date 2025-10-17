import { Injectable, Inject } from '@nestjs/common';
import { ISalesRepository } from '../../domain/repositories/ISalesRepository';
import { Sale } from '../../domain/entities/Sale';
import { SaleId } from '../../domain/value-objects/SaleId';

/**
 * GetSaleByIdUseCase
 *
 * Caso de uso: Obtener una venta por su ID
 * Application Layer - Orquesta la lógica de negocio
 */
@Injectable()
export class GetSaleByIdUseCase {
  constructor(
    @Inject('ISalesRepository')
    private readonly salesRepository: ISalesRepository,
  ) {}

  async execute(params: {
    saleId: string;
    promoterId: string;
  }): Promise<Sale | null> {
    const saleId = SaleId.fromString(params.saleId);

    // Delegar al repositorio (puerto)
    return await this.salesRepository.findByIdWithDetails(
      saleId,
      params.promoterId,
    );
  }
}
