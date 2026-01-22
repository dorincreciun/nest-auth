import {
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleDestroy,
    OnModuleInit
} from '@nestjs/common';
import { Pool, PoolClient, QueryResultRow } from 'pg';
import { ConfigService } from '@nestjs/config';
import { DATABASE_MESSAGES } from './constants/messages.constants';
import {EnvironmentVariables} from "../../common/interfaces/config.interface";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;
    private readonly logger = new Logger(DatabaseService.name);

    constructor(private configService: ConfigService<EnvironmentVariables, true>) {
        this.pool = new Pool({
            host: this.configService.get('DB_HOST', { infer: true }),
            port: this.configService.get('DB_PORT', { infer: true }),
            database: this.configService.get('DB_NAME', { infer: true }),
            user: this.configService.get('DB_USER', { infer: true }),
            password: this.configService.get('DB_PASSWORD', { infer: true }),
        });
    }

    async onModuleInit(): Promise<void> {
        try {
            const client = await this.pool.connect();
            this.logger.log(DATABASE_MESSAGES.LOGS.CONNECTION_SUCCESS);
            client.release();
        } catch (e) {
            this.logger.error(DATABASE_MESSAGES.LOGS.CONNECTION_ERROR, e);
            process.exit(1);
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.end();
        this.logger.log(DATABASE_MESSAGES.LOGS.POOL_CLOSED);
    }

    /**
     * Execută o serie de operațiuni într-o singură tranzacție SQL.
     */
    async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transaction failed, rolled back.', error.stack);
            throw error;
        } finally {
            client.release();
        }
    }

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

    async queryOne<T extends QueryResultRow>(text: string, params?: any[]): Promise<T> {
        const rows = await this.query<T>(text, params);
        if (!rows || rows.length === 0) {
            throw new InternalServerErrorException(DATABASE_MESSAGES.ERRORS.CREATION_FAILED);
        }
        return rows[0];
    }

    async queryMaybeOne<T extends QueryResultRow>(text: string, params?: any[]): Promise<T | null> {
        const rows = await this.query<T>(text, params);
        return rows.length > 0 ? rows[0] : null;
    }
}