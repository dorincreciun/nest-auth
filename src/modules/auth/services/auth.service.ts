import {ConflictException, Injectable} from '@nestjs/common';
import {RegisterDto} from "../dto";
import {UserService} from "../../user/user.service";
import {UserRepository} from "../../user/repositories/user.repository";
import * as bcrypt from 'bcrypt';
import {TokenService} from "./token.service";
import {RefreshTokenRepository} from "../repositories/refresh-token.repository";
import {RegisterResponse} from "../interfaces";
import {AUTH_RESPONSES} from "../constants";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {
    }

    async register(dto: RegisterDto): Promise<RegisterResponse> {
        const {email, password} = dto

        const existingUser = await this.userRepository.findByEmail(email)

        if (existingUser) {
            throw new ConflictException(AUTH_RESPONSES.ERRORS.EMAIL_CONFLICT)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await this.userRepository.create({
            ...dto,
            password: hashedPassword
        })

        const {refreshToken, accessToken} = await this.tokenService.generateTokens({
            sub: newUser.id
        })

        const refreshTokenHash = await bcrypt.hash(refreshToken.token, 10)

        await this.refreshTokenRepository.create({
            userId: newUser.id,
            tokenHashed: refreshTokenHash,
            expiresAt: refreshToken.expiresAt,
        });

        return {
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,

            },
            accessToken,
            refreshToken
        }
    }
}
