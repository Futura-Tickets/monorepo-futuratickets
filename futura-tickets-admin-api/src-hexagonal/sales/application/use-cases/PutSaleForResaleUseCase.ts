import { Injectable, Inject } from '@nestjs/common';
import { ISalesRepository } from '../../domain/repositories/ISalesRepository';
import { IBlockchainService } from '../../domain/services/IBlockchainService';
import { Sale } from '../../domain/entities/Sale';
import { SaleId } from '../../domain/value-objects/SaleId';
import { Money } from '../../domain/value-objects/Money';

/**
 * PutSaleForResaleUseCase
 *
 * Caso de uso: Poner un ticket en reventa
 * Incluye validación de negocio y llamada a blockchain
 */
@Injectable()
export class PutSaleForResaleUseCase {
  constructor(
    @Inject('ISalesRepository')
    private readonly salesRepository: ISalesRepository,
    @Inject('IBlockchainService')
    private readonly blockchainService: IBlockchainService,
  ) {}

  async execute(params: {
    saleId: string;
    clientId: string;
    resalePrice: number;
    maxResalePrice: number;
    accountPrivateKey: string;
    eventAddress: string;
    tokenId: number;
  }): Promise<{ sale: Sale; blockchainTx: string }> {
    // 1. Validar entrada
    const saleId = SaleId.fromString(params.saleId);
    const resalePrice = new Money(params.resalePrice);
    const maxResalePrice = new Money(params.maxResalePrice);

    // 2. Obtener venta del repositorio
    const sale = await this.salesRepository.findById(saleId);

    if (!sale) {
      throw new Error('Sale not found');
    }

    // Validar ownership
    if (sale.clientId !== params.clientId) {
      throw new Error('Unauthorized: You do not own this ticket');
    }

    // 3. Aplicar lógica de dominio
    sale.putForResale(resalePrice, maxResalePrice);

    // 4. Actualizar en blockchain
    const blockchainTx = await this.blockchainService.setNFTPrice(
      params.accountPrivateKey,
      params.eventAddress,
      params.tokenId,
      params.resalePrice,
    );

    // 5. Persistir cambios
    await this.salesRepository.save(sale);

    return {
      sale,
      blockchainTx,
    };
  }
}
