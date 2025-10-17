import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// CONTROLLERS
import { SalesController } from './sales.controller';

// MONGOOSE
import { Sales, SalesSchema } from './sales.schema';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { MailModule } from 'src/Mail/mail.module';

// SERVICES
import { SalesService } from './sales.service';

@Module({
    imports: [
        // AbstractionModule,
        AuthModule,
        AccountModule,
        ConfigModule,
        MailModule,
        MongooseModule.forFeature([{ name: Sales.name, schema: SalesSchema, collection: 'sales' }]),
        // ProviderModule,
    ],
    controllers: [
        SalesController
    ],
    providers: [
        SalesService,
    ],
    exports: [
        SalesService
    ]
})
export class SalesModule {}