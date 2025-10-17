import { Module } from '@nestjs/common';

// MODULES
import { ConfigModule } from '@nestjs/config';

// SERVICES
import { AuthService } from './services/auth.service';

@Module({
    imports: [
        ConfigModule,
    ],
    providers: [
        AuthService,
    ],
    exports: [AuthService]
})
export class AuthModule { }
