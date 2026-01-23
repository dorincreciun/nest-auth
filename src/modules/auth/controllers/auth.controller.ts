import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dto';
import { AuthService, CookieService } from '../services';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly cookieService: CookieService,
    ) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        return await this.authService.register(dto)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { refreshToken, accessToken, user } = await this.authService.login(dto);
        this.cookieService.setRefreshTokenCookie(res, refreshToken.token);
        return { accessToken: accessToken.token, user };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const oldRefreshToken = req.cookies['refreshToken'];

        if (!oldRefreshToken) {
            throw new UnauthorizedException('Refresh token is missing');
        }

        const { refreshToken, accessToken, user } = await this.authService.refreshTokens(oldRefreshToken);

        this.cookieService.setRefreshTokenCookie(res, refreshToken.token);

        return { accessToken: accessToken.token, user };
    }

    /**
     * POST /auth/logout
     */
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<void> {
        const refreshToken = req.cookies['refreshToken'];

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        this.cookieService.clearRefreshTokenCookie(res);
    }
}