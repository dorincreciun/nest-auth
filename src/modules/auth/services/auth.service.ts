import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';

import {UserRepository} from '../../user/repositories/user.repository';
import {UserEntity} from '../../user/entities/user.entity';
import {LoginDto, RegisterDto} from '../dto';
import {RefreshTokenRepository} from '../repositories';
import {AUTH_RESPONSES} from '../constants';
import {AuthResponse} from '../interfaces';
import {TokenService} from './token.service';
import {HashingService} from "./hashing.service";
import {randomInt} from 'crypto';
import {MailerService} from "@nestjs-modules/mailer";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly hashingService: HashingService,
        private readonly mailService: MailerService,
    ) {
    }

    async register(dto: RegisterDto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) throw new ConflictException(AUTH_RESPONSES.ERRORS.EMAIL_CONFLICT);

        const hashedPassword = await this.hashingService.hash(dto.password);
        const verificationToken = randomInt(100000, 999999).toString();

        const newUser = await this.userRepository.create({...dto, password: hashedPassword, verificationToken});

        if (newUser) {
            const name = newUser.firstName + " " + newUser.lastName
            const code = newUser.verificationToken?.split('').join(" - ")

            await this.mailService.sendMail({
                to: newUser.email,
                subject: 'Bun venit în comunitate!',
                template: './welcome',
                context: {
                    name: name,
                    code: code,
                },
            })
        }

        return newUser;
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user || !(await this.hashingService.compare(dto.password, user.password))) {
            throw new UnauthorizedException(AUTH_RESPONSES.ERRORS.INVALID_CREDENTIALS);
        }

        return this.createAuthResponse(user);
    }

    async refreshTokens(oldToken: string): Promise<AuthResponse> {
        const payload = await this.tokenService.verifyToken(oldToken, 'refreshToken');

        const storedTokens = await this.refreshTokenRepository.findAllByUserId(payload.sub);
        const currentTokenRecord = await this.findValidToken(storedTokens, oldToken);

        if (!currentTokenRecord) {
            throw new UnauthorizedException(AUTH_RESPONSES.ERRORS.SESSION_EXPIRED);
        }

        const user = await this.userRepository.findById(payload.sub);
        if (!user) throw new UnauthorizedException(AUTH_RESPONSES.ERRORS.USER_NOT_FOUND);

        await this.refreshTokenRepository.deleteExpiredTokens();
        await this.refreshTokenRepository.deleteById(currentTokenRecord.id);

        return this.createAuthResponse(user);
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            const payload = await this.tokenService.verifyToken(refreshToken, 'refreshToken');

            const storedTokens = await this.refreshTokenRepository.findAllByUserId(payload.sub);

            const tokenRecord = await this.findValidToken(storedTokens, refreshToken);

            if (tokenRecord) {
                await this.refreshTokenRepository.deleteById(tokenRecord.id);
            }
        } catch (error) {
        }
    }

    private async createAuthResponse(user: UserEntity): Promise<AuthResponse> {
        const {refreshToken, accessToken} = await this.tokenService.generateTokens({
            sub: user.id,
        });

        const refreshTokenHash = await this.hashingService.hash(refreshToken.token);
        await this.refreshTokenRepository.create({
            userId: user.id,
            tokenHashed: refreshTokenHash,
            expiresAt: refreshToken.expiresAt,
        });

        return {
            user: {id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName},
            accessToken,
            refreshToken,
        };
    }

    private async findValidToken(tokens: any[], rawToken: string) {
        for (const record of tokens) {
            if (await this.hashingService.compare(rawToken, record.token_hash)) return record;
        }
        return null;
    }
}