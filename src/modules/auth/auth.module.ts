import {Module} from '@nestjs/common';
import {RefreshTokenRepository} from "./repositories/refresh-token.repository";

@Module({
    providers: [RefreshTokenRepository],
})
export class AuthModule {
}
