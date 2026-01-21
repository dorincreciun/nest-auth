import {Module} from '@nestjs/common';
import {RefreshTokenRepository} from "./repositories/refresh-token.repository";
import {AuthController} from './controllers/auth.controller';
import {AuthService} from './services';
import {UserModule} from "../user/user.module";
import {JwtModule} from "@nestjs/jwt";
import {TokenService} from './services';
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
        }),
    ],
    providers: [
        RefreshTokenRepository,
        AuthService,
        TokenService,
        JwtStrategy,
    ],
    controllers: [AuthController],
})
export class AuthModule {
}
