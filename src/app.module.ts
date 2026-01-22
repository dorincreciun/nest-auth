import {Module} from '@nestjs/common';
import {DatabaseModule} from './modules/database/database.module';
import {ConfigModule} from "@nestjs/config";
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {envValidationSchema} from "./config/env.validation";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
        }),
        DatabaseModule,
        UserModule,
        AuthModule
    ],
})
export class AppModule {
}
