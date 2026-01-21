import {IGeneratedToken} from "./token-service.interface";

export interface RegisterResponse {
    user: {
        id: number
        email: string
        firstName: string
        lastName: string
    }
    accessToken: IGeneratedToken
    refreshToken: IGeneratedToken
}