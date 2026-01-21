import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from "@nestjs/common";
import cookieParser from 'cookie-parser';
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.get<number>('PORT') || 5000;
    const apiPrefix = configService.get<string>('API_PREFIX') || 'api';

    app.setGlobalPrefix(apiPrefix);

    app.use(cookieParser());

    app.enableCors({
        origin: configService.get<string>('CLIENT_ORIGIN'),
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    await app.listen(port);

    const baseUrl = configService.get<string>('API_URL');
    console.log(`🚀 Server: ${baseUrl}/${apiPrefix}`);
}

bootstrap();
