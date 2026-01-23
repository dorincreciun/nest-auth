import {Module} from '@nestjs/common';
import {DatabaseModule} from './modules/database/database.module';
import {ConfigModule} from "@nestjs/config";
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {envValidationSchema} from "./config/env.validation";
import {MailerModule} from "@nestjs-modules/mailer";
import {join} from "path";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

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
        MailerModule.forRoot({
           transport: {
               host: 'smtp.gmail.com',
               auth: {
                   user: 'creciundorin25@gmail.com',
                   pass: 'hkld xjgc jasm uwsk'
               },
           },
            defaults: {
                from: '"No Reply" <email-ul-tau@gmail.com>',
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            }
        }),
        DatabaseModule,
        UserModule,
        AuthModule
    ],
})
export class AppModule {
}
