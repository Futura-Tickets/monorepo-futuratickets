import { Injectable, Inject } from '@nestjs/common';
import { ISalesRepository } from '../../domain/repositories/ISalesRepository';
import { Sale } from '../../domain/entities/Sale';
import { SaleId } from '../../domain/value-objects/SaleId';

/**
 * ValidateTicketEntryUseCase
 *
 * Caso de uso: Validar entrada de un ticket (access control)
 * Business logic crítico: un ticket solo puede usarse UNA vez
 */
@Injectable()
export class ValidateTicketEntryUseCase {
  constructor(
    @Inject('ISalesRepository')
    private readonly salesRepository: ISalesRepository,
  ) {}

  async execute(params: {
    saleId: string;
    promoterId: string;
  }): Promise<{
    success: boolean;
    sale: Sale;
    message: string;
  }> {
    // 1. Validar entrada
    const saleId = SaleId.fromString(params.saleId);

    // 2. Obtener ticket
    const sale = await this.salesRepository.checkTicketStatus(
      params.promoterId,
      saleId,
    );

    if (!sale) {
      throw new Error('Ticket not found');
    }

    try {
      // 3. Validar entrada (domain logic)
      sale.validateEntry();

      // 4. Persistir cambios
      await this.salesRepository.save(sale);

      return {
        success: true,
        sale,
        message: 'Entry granted successfully',
      };
    } catch (error) {
      // 5. Denegar entrada si hay error
      const reason = error instanceof Error ? error.message : 'Unknown error';
      sale.denyEntry(reason);

      await this.salesRepository.save(sale);

      return {
        success: false,
        sale,
        message: `Entry denied: ${reason}`,
      };
    }
  }
}
