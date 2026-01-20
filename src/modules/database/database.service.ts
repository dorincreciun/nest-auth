import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {Pool, QueryResultRow} from "pg";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;
    private logger = new Logger(DatabaseService.name);

    constructor(private configService: ConfigService) {
        this.pool = new Pool({
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            database: configService.get<string>('DB_DATABASE'),
            user: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
        })
    }

    async onModuleInit(): Promise<void> {
        try {
            const client = await this.pool.connect();
            this.logger.log('Connected to PostgreSQL successfully');
            client.release();
        } catch (e) {
            this.logger.error("Failed to connect to PostgreSQL", e);
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.pool.end();
        this.logger.log('Database pool closed');
    }

    async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<T[]> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            this.logger.debug(`Query executat în ${duration}ms`);
            return result.rows;
        } catch (error) {
            this.logger.error(`Eroare la query: ${text}`, error.stack);
            throw error;
        }
    }
}
