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
import { EnvironmentVariables } from "../../common/interfaces/config.interface";
import { UserEntity } from "../user/entities/user.entity";
import { RefreshTokenEntity } from "../auth/entities";
import { camelToSnakeCase } from "../../common/utils";

/**
 * Tipuri pentru maparea Tabelelor la Entități
 */
type TableEntityMap = {
    users: UserEntity;
    refresh_tokens: RefreshTokenEntity;
}

type ProtectedUpdateKeys = {
    users: keyof Pick<UserEntity, 'id' | 'createdAt'>;
    refresh_tokens: keyof Pick<RefreshTokenEntity, 'id' | 'userId' | 'createdAt'>;
}

type UpdateData<T extends keyof TableEntityMap> =
    Omit<Partial<TableEntityMap[T]>, ProtectedUpdateKeys[T]>;

interface PreparedData {
    keys: string[];
    values: any[];
    columns: string[];
    placeholders: string[];
}

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

    // -------------------------------------------------------------------------
    // Lifecycle Hooks
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Public ORM Operations (CRUD)
    // -------------------------------------------------------------------------

    /**
     * Inserează o înregistrare nouă
     */
    async create<T extends keyof TableEntityMap>(
        table: T,
        params: Partial<TableEntityMap[T]>
    ): Promise<TableEntityMap[T]> {
        const { columns, values, placeholders } = this.prepareData(params);

        const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
        `;

        const result = await this.queryOne<any>(query, values);
        return this.mapToCamelCase(result) as TableEntityMap[T];
    }

    /**
     * Găsește o singură înregistrare după criterii
     */
    async findByOne<T extends keyof TableEntityMap>(
        table: T,
        params: Partial<TableEntityMap[T]>
    ): Promise<TableEntityMap[T] | null> {
        const results = await this.findInternal(table, params, 1);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Găsește toate înregistrările care corespund criteriilor
     */
    async findByAll<T extends keyof TableEntityMap>(
        table: T,
        params: Partial<TableEntityMap[T]>
    ): Promise<TableEntityMap[T][]> {
        return await this.findInternal(table, params);
    }

    /**
     * Actualizează înregistrări pe baza unui filtru (WHERE)
     */
    async update<T extends keyof TableEntityMap>(
        table: T,
        where: Partial<TableEntityMap[T]>,
        data: UpdateData<T>
    ): Promise<TableEntityMap[T]> {
        const updatePrep = this.prepareData(data as Record<string, any>);
        const wherePrep = this.prepareData(where, updatePrep.values.length);

        const setClause = updatePrep.columns
            .map((col, i) => `${col} = $${i + 1}`)
            .join(', ');

        const whereClause = wherePrep.columns
            .map((col, i) => `${col} = ${wherePrep.placeholders[i]}`)
            .join(' AND ');

        const query = `
            UPDATE ${table}
            SET ${setClause}
            WHERE ${whereClause}
            RETURNING *
        `;

        const values = [...updatePrep.values, ...wherePrep.values];
        const result = await this.queryOne<any>(query, values);
        return this.mapToCamelCase(result) as TableEntityMap[T];
    }

    /**
     * Șterge înregistrări (Necesită filtre pentru siguranță)
     */
    async delete<T extends keyof TableEntityMap>(
        table: T,
        filters: Partial<TableEntityMap[T]>
    ): Promise<TableEntityMap[T]> {
        const { columns, values, placeholders } = this.prepareData(filters);
        const whereClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(' AND ');

        if (!whereClause) {
            throw new InternalServerErrorException("Operație de ștergere nesigură refuzată.");
        }

        const query = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
        const result = await this.queryOne<any>(query, values);
        return this.mapToCamelCase(result) as TableEntityMap[T];
    }

    // -------------------------------------------------------------------------
    // Internal Helpers & Query Engine
    // -------------------------------------------------------------------------

    /**
     * Logica comună pentru SELECT
     */
    private async findInternal<T extends keyof TableEntityMap>(
        table: T,
        params: Partial<TableEntityMap[T]>,
        limit?: number
    ): Promise<TableEntityMap[T][]> {
        const { columns, values, placeholders } = this.prepareData(params);
        const whereClause = columns.map((col, i) => `${col} = ${placeholders[i]}`).join(' AND ');
        const limitClause = limit ? `LIMIT ${limit}` : '';

        const query = `SELECT * FROM ${table} WHERE ${whereClause} ${limitClause}`;

        const rows = await this.query<any>(query, values);
        return rows.map(row => this.mapToCamelCase(row)) as TableEntityMap[T][];
    }

    /**
     * Pregătește datele pentru query-uri (mapează cheile și generează placeholdere)
     * @param data
     * @param offset Utilizat pentru a decala numerotarea placeholderelor (ex: în UPDATE)
     */
    private prepareData(data: Record<string, any>, offset = 0): PreparedData {
        const keys = Object.keys(data);
        if (keys.length === 0) throw new InternalServerErrorException("Input data empty");

        return {
            keys,
            values: Object.values(data),
            columns: keys.map(k => camelToSnakeCase(k)),
            placeholders: keys.map((_, i) => `$${offset + i + 1}`)
        };
    }

    /**
     * Transformă automat snake_case din DB în camelCase pentru TS
     */
    private mapToCamelCase(obj: any) {
        if (!obj) return null;
        const newObj: any = {};
        for (const key in obj) {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            newObj[camelKey] = obj[key];
        }
        return newObj;
    }

    // -------------------------------------------------------------------------
    // Base Query Methods
    // -------------------------------------------------------------------------

    async query<T extends QueryResultRow>(text: string, params?: any[]): Promise<T[]> {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            this.logger.debug(`Executed query (${Date.now() - start}ms): ${text}`);
            return result.rows as T[];
        } catch (error) {
            this.logger.error(`Query Error: ${text}`, error.stack);
            throw error;
        }
    }

    async queryOne<T extends QueryResultRow>(text: string, params?: any[]): Promise<T> {
        const rows = await this.query<T>(text, params);
        if (rows.length === 0) throw new InternalServerErrorException("Resource not found");
        return rows[0];
    }
}