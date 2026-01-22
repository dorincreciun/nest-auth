import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import ms from 'ms';
import { EnvironmentVariables } from '../../../common/interfaces/config.interface';

@Injectable()
export class CookieService {
    private readonly isProduction: boolean;
    private readonly refreshTokenExpiresIn: string;
    private readonly REFRESH_PATH = '/api/v1/auth/refresh';

    constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {
        this.isProduction = this.configService.get<string>('NODE_ENV', { infer: true }) === 'production';
        this.refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', { infer: true });
    }

    setRefreshTokenCookie(res: Response, token: string) {
        const maxAge = ms(this.refreshTokenExpiresIn as ms.StringValue);

        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'strict',
            path: this.REFRESH_PATH,
            maxAge: maxAge,
        });
    }

    clearRefreshTokenCookie(res: Response) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: this.isProduction,
            sameSite: 'strict',
            path: this.REFRESH_PATH,
        });
    }
}