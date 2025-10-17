import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

// MONGOOSE
import { Event, EventSchema } from './event.schema';

// CONTROLLERS
import { EventController } from './event.controller';

// MODULES
import { AbstractionModule } from 'src/Abstraction/abstraction.module';
import { AccountModule } from 'src/Account/account.module';
import { AuthModule } from 'src/Auth/auth.module';
import { PromoterModule } from 'src/Promoter/promoter.module';
import { ProviderModule } from 'src/Provider/provider.module';

// SERVICES
import { EventService } from './event.service';

@Module({
    imports: [
        AbstractionModule,
        AuthModule,
        ConfigModule,
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema, collection: 'events' }]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                dest: configService.get<string>('MULTER_DEST'),
            }),
            inject: [ConfigService],
        }),
        PromoterModule,
        ProviderModule,
    ],
    controllers: [
        EventController,
    ],
    providers: [
        EventService
    ]
})
export class EventModule {}