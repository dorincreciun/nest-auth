import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../user/repositories/user.repository';
import { IJwtPayload } from '../interfaces';
import { AUTH_RESPONSES } from '../constants';
import { EnvironmentVariables } from '../../../common/interfaces/config.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService<EnvironmentVariables, true>,
        private readonly userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
        });
    }

    async validate(payload: IJwtPayload) {
        const user = await this.userRepository.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException(AUTH_RESPONSES.ERRORS.USER_NOT_FOUND);
        }

        return {
            id: user.id,
            email: user.email,
        };
    }
}