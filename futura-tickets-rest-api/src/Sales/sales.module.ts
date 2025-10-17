import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Sales, SalesSchema } from './sales.schema';

// CONTROLLER
import { SalesController } from './sales.controller';

// MODULES
import { AbstractionModule } from 'src/Abstraction/abstraction.module';
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { ProviderModule } from 'src/Provider/provider.module';
import { QrCodeModule } from 'src/QrCode/qrcode.module';

// SERVICES
import { SalesService } from './sales.service';
import { PromoterModule } from 'src/Promoter/promoter.module';

@Module({
    imports: [
        AbstractionModule,
        AuthModule,
        ConfigModule,
        MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema, collection: 'sales' }]),
        PromoterModule,
        ProviderModule,
        QrCodeModule
    ],
    controllers: [SalesController],
    providers: [
        SalesService,
    ],
    exports: [
        SalesService
    ]
})
export class SalesModule {}