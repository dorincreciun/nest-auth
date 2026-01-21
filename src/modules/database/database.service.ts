import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleDestroy,
    OnModuleInit
} from '@nestjs/common';
import {Pool, PoolClient, QueryResultRow} from 'pg';
import { ConfigService } from '@nestjs/config';
import { DATABASE_MESSAGES } from './constants/messages.constants';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;
    private readonly logger = new Logger(DatabaseService.name);

    constructor(private configService: ConfigService) {
        this.pool = new Pool({
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            database: configService.get<string>('DB_NAME'),
            user: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
        });
    }

    async onModuleInit(): Promise<void> {
        try {
            const client = await this.pool.connect();
            this.logger.log(DATABASE_MESSAGES.LOGS.CONNECTION_SUCCESS);
            client.release();
        } catch (e) {
            this.logger.error(DATABASE_MESSAGES.LOGS.CONNECTION_ERROR, e);
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.end();
        this.logger.log(DATABASE_MESSAGES.LOGS.POOL_CLOSED);
    }

    /**
     * Returnează toate rândurile găsite (0 sau mai multe).
     */
    async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<T[]> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            this.logger.debug(DATABASE_MESSAGES.LOGS.QUERY_EXECUTED(duration));
            return result.rows as T[];
        } catch (error) {
            this.logger.error(DATABASE_MESSAGES.LOGS.QUERY_ERROR(text), error.stack);
            throw error;
        }
    }

    /**
     * Aruncă InternalServerErrorException dacă nu este găsit niciun rând.
     * Ideal pentru INSERT sau UPDATE care TREBUIE să funcționeze.
     */
    async queryOne<T extends QueryResultRow>(text: string, params?: any[]): Promise<T> {
        const rows = await this.query<T>(text, params);
        if (!rows || rows.length === 0) {
            throw new InternalServerErrorException(DATABASE_MESSAGES.ERRORS.CREATION_FAILED);
        }
        return rows[0];
    }

    /**
     * Returnează primul rând sau NULL dacă nu există.
     * Ideal pentru căutări de tip "Găsește după email".
     */
    async queryMaybeOne<T extends QueryResultRow>(text: string, params?: any[]): Promise<T | null> {
        const rows = await this.query<T>(text, params);
        return rows.length > 0 ? rows[0] : null;
    }
}