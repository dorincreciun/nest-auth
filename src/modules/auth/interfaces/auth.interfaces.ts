export interface IJwtPayload {
    sub: number;
}

export interface AuthResponse {
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    accessToken: IGeneratedToken;
    refreshToken: IGeneratedToken;
}

export type ITokenType = 'accessToken' | 'refreshToken';

export interface IGeneratedToken {
    token: string;
    expiresAt: Date;
}

export interface ITokens {
    accessToken: IGeneratedToken;
    refreshToken: IGeneratedToken;
}

export interface ICreateToken {
    userId: number;
    tokenHashed: string;
    expiresAt: Date;
}

export type RegisterResult = Omit<AuthResponse, 'refreshToken'>