import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schema
import { Sales, SalesSchema } from './infrastructure/persistence/sales.schema';

// Repositories (Adapters)
import { SalesMongoRepository } from './infrastructure/persistence/SalesMongoRepository';

// Services (Adapters)
import { BlockchainAdapter } from './infrastructure/blockchain/BlockchainAdapter';
import { QRCodeAdapter } from './infrastructure/qrcode/QRCodeAdapter';

// Use Cases
import { GetSaleByIdUseCase } from './application/use-cases/GetSaleByIdUseCase';
import { PutSaleForResaleUseCase } from './application/use-cases/PutSaleForResaleUseCase';
import { ValidateTicketEntryUseCase } from './application/use-cases/ValidateTicketEntryUseCase';
import { CreateSalesForOrderUseCase } from './application/use-cases/CreateSalesForOrderUseCase';

// Controllers
import { SalesController } from './interfaces/controllers/SalesController';

// External dependencies
import { AbstractionService } from 'src/Abstraction/abstraction.service';
import { ProviderService } from 'src/Provider/provider.service';
import { ProviderModule } from 'src/Provider/provider.module';
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';

/**
 * SalesHexagonalModule
 *
 * Módulo NestJS que implementa arquitectura hexagonal para Sales
 *
 * Layers:
 * - Domain: entities, value-objects, repositories (interfaces), services (interfaces)
 * - Application: use-cases
 * - Infrastructure: persistence, blockchain, qrcode (adapters)
 * - Interfaces: controllers, DTOs
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema }]),
    ProviderModule,
    AccountModule,
    AuthModule,
  ],
  providers: [
    // Repositories - Binding Interface → Implementation
    {
      provide: 'ISalesRepository',
      useClass: SalesMongoRepository,
    },

    // Services - Binding Interface → Implementation
    {
      provide: 'IBlockchainService',
      useClass: BlockchainAdapter,
    },
    {
      provide: 'IQRCodeService',
      useClass: QRCodeAdapter,
    },

    // Use Cases (Application Layer)
    GetSaleByIdUseCase,
    PutSaleForResaleUseCase,
    ValidateTicketEntryUseCase,
    CreateSalesForOrderUseCase,

    // External dependencies
    AbstractionService,
    ProviderService,
  ],
  controllers: [SalesController],
  exports: [
    'ISalesRepository',
    GetSaleByIdUseCase,
    PutSaleForResaleUseCase,
    ValidateTicketEntryUseCase,
    CreateSalesForOrderUseCase,
  ],
})
export class SalesHexagonalModule {}
