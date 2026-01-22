import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RefreshTokenEntity } from '../entities';
import { ICreateToken } from '../interfaces';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly db: DatabaseService) {}

    async findAllByUserId(userId: number): Promise<RefreshTokenEntity[]> {
        const query = `SELECT * FROM refresh_tokens WHERE user_id = $1`;
        return await this.db.query<RefreshTokenEntity>(query, [userId]);
    }

    async deleteById(id: number): Promise<void> {
        const query = `DELETE FROM refresh_tokens WHERE id = $1`;
        await this.db.query(query, [id]);
    }

    async create(data: ICreateToken): Promise<RefreshTokenEntity> {
        const query = `
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        return await this.db.queryOne<RefreshTokenEntity>(query, [
            data.userId,
            data.tokenHashed,
            data.expiresAt,
        ]);
    }

    async deleteExpiredTokens(): Promise<number> {
        const query = `
            DELETE FROM refresh_tokens
            WHERE expires_at < NOW();
        `;
        const result = await this.db.query(query);
        return result.length;
    }
}
