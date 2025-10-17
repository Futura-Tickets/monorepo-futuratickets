import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// MONGOOSE
import { Promoter, PromoterClient, PromoterSchema, PromoterClientSchema } from './promoter.schema';
import { Event, EventSchema } from 'src/Event/event.schema';

// MODULES
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';

// SERVICES
import { PromoterService } from './promoter.service';

// CONTROLLERS
import { PromoterController } from './promoter.controller';

@Module({
    imports: [
        AccountModule,
        AuthModule,
        ConfigModule,
        MongooseModule.forFeature([{ name: Promoter.name, schema: PromoterSchema, collection: 'promoters' }]),
        MongooseModule.forFeature([{ name: PromoterClient.name, schema: PromoterClientSchema, collection: 'promoter-clients' }]),
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema, collection: 'events' }]),
    ],
    controllers: [
        PromoterController
    ],
    providers: [
        PromoterService
    ],
    exports: [
        PromoterService
    ]
})
export class PromoterModule {}