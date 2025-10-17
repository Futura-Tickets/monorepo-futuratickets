import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// AUTH
import { JwtStrategy } from './jwt.strategy';

// MODULES
import { ConfigModule, ConfigService } from '@nestjs/config';

// SERVICES
import { AuthService } from './services/auth.service';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('JWT_SECRET_KEY'),
                    signOptions: {
                        expiresIn: config.get<string | number>('JWT_EXPIRATION_TIME'),
                    },
                };
            },
            imports: [ConfigModule],
            inject: [ConfigService],
        }),
    ],
    providers: [
        AuthService,
        JwtStrategy,
    ],
    exports: [AuthService, JwtStrategy]
})
export class AuthModule { }