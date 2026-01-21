import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../../database/database.service";
import {RefreshTokenEntity} from "../entities/refresh-token.entity";
import {ICreateToken} from "../interfaces";

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly db: DatabaseService) {
    }

    async findOneByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
        const query = `
            SELECT *
            FROM refresh_tokens
            WHERE token_hash = $1
        `
        return await this.db.queryMaybeOne(query, [tokenHash])
    }

    async deleteByTokenHash(tokenHash: string): Promise<void> {
        const query = `
            DELETE
            FROM refresh_tokens
            WHERE token_hash = $1
        `
        await this.db.query(query, [tokenHash])
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
            data.expiresAt
        ]);
    }
}

