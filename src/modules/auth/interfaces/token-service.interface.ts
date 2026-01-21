export interface IJwtPayload {
    sub: number
}

export type ITokenType = "accessToken" | "refreshToken"

export interface IGeneratedToken {
    token: string;
    expiresAt: Date;
}

export interface ITokens {
    accessToken: IGeneratedToken
    refreshToken: IGeneratedToken
}