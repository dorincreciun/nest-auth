import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers';
import { AuthService, CookieService, TokenService, HashingService } from './services';
import { RefreshTokenRepository } from './repositories';
import { JwtStrategy } from './strategies';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        TokenService,
        CookieService,
        RefreshTokenRepository,
        JwtStrategy,
        HashingService,
    ],
})
export class AuthModule {}
