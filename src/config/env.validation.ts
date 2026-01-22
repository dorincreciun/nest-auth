import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    // SERVER
    PORT: Joi.number().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    API_URL: Joi.string().uri().required(),
    API_PREFIX: Joi.string().required(),

    // DATABASE
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),

    // JWT
    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_REFRESH_EXPIRES_IN: Joi.string().required(),

    // CLIENT
    CLIENT_ORIGIN: Joi.string().uri().required(),
});