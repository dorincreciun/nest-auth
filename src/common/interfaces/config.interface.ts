export interface EnvironmentVariables {
    // SERVER
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';
    API_URL: string;
    API_PREFIX: string;

    // DATABASE
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;

    // JWT
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;

    // CLIENT
    CLIENT_ORIGIN: string;
}