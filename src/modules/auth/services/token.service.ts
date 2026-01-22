import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IGeneratedToken, IJwtPayload, ITokens, ITokenType } from '../interfaces';
import ms from 'ms';
import { EnvironmentVariables } from '../../../common/interfaces/config.interface';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService<EnvironmentVariables, true>,
    ) {
    }

    private async generateToken(payload: IJwtPayload, tokenType: ITokenType): Promise<IGeneratedToken> {
        const secretKey = tokenType === 'accessToken' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET';
        const expiresInKey = tokenType === 'accessToken' ? 'JWT_ACCESS_EXPIRES_IN' : 'JWT_REFRESH_EXPIRES_IN';

        const secret = this.configService.get(secretKey, { infer: true });
        const expiresInStr = this.configService.get(expiresInKey, { infer: true });

        if (!secret || !expiresInStr) {
            throw new Error(`Config error: ${!secret ? secretKey : expiresInKey} is missing in .env`);
        }

        const plainPayload = {...payload};

        const expiresInMs = ms(expiresInStr as ms.StringValue);
        const expiresInSeconds = Math.floor(expiresInMs / 1000);

        const token = await this.jwtService.signAsync(plainPayload, {
            secret,
            expiresIn: expiresInSeconds,
        });

        const expiresAt = new Date(Date.now() + expiresInMs);

        return {
            token,
            expiresAt
        };
    }

    async generateTokens(payload: IJwtPayload): Promise<ITokens> {
        const [accessToken, refreshToken] = await Promise.all([
            this.generateToken(payload, 'accessToken'),
            this.generateToken(payload, 'refreshToken'),
        ]);

        return { accessToken, refreshToken };
    }

    async verifyToken(token: string, type: ITokenType): Promise<IJwtPayload> {
        const secretKey = type === 'accessToken' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET';
        const secret = this.configService.get(secretKey, { infer: true });

        try {
            return await this.jwtService.verifyAsync<IJwtPayload>(token, { secret });
        } catch (error) {
            throw error;
        }
    }

    async generateAccessToken(payload: IJwtPayload): Promise<IGeneratedToken> {
        return await this.generateToken(payload, 'accessToken');
    }

    async generateRefreshToken(payload: IJwtPayload): Promise<IGeneratedToken> {
        return this.generateToken(payload, 'refreshToken');
    }
}
