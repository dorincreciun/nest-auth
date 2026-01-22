import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from "@nestjs/common";
import cookieParser from 'cookie-parser';
import { ConfigService } from "@nestjs/config";
import {EnvironmentVariables} from "./common/interfaces/config.interface";

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService<EnvironmentVariables, true>);

    const port = configService.get('PORT', { infer: true });
    const apiPrefix = configService.get('API_PREFIX', { infer: true });
    const clientOrigin = configService.get('CLIENT_ORIGIN', { infer: true });
    const baseUrl = configService.get('API_URL', { infer: true });

    app.setGlobalPrefix(apiPrefix);
    app.use(cookieParser());
    app.enableCors({
        origin: clientOrigin,
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    await app.listen(port);

    logger.log(`🚀 Server is running on: ${baseUrl}/${apiPrefix}`);
}

bootstrap();