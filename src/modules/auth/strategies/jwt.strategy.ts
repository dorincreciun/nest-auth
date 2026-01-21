import {Injectable, UnauthorizedException} from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {ConfigService} from "@nestjs/config";
import {UserRepository} from "../../user/repositories/user.repository";
import {IJwtPayload} from "../interfaces";
import {AUTH_MESSAGES} from "../constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: IJwtPayload) {
        const user = await this.userRepository.findById(payload.sub)

        if (!user) {
            throw new UnauthorizedException(AUTH_MESSAGES.ERRORS.USER_NOT_FOUND);
        }

        return {
            id: user.id,
            email: user.email,
        }
    }
}