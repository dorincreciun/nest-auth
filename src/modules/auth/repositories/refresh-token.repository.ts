import {Injectable} from '@nestjs/common';
import {DatabaseService} from '../../database/database.service';
import {RefreshTokenEntity} from '../entities';
import {ICreateToken} from '../interfaces';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly db: DatabaseService) {
    }

    async findAllByUserId(userId: number): Promise<RefreshTokenEntity[]> {
        return await this.db.findByAll('refresh_tokens', {userId});
    }

    async deleteById(id: number): Promise<RefreshTokenEntity> {
        return await this.db.delete('refresh_tokens', {id})
    }

    async create(data: ICreateToken): Promise<RefreshTokenEntity> {
        return await this.db.create('refresh_tokens', data)
    }

    async deleteExpiredTokens(): Promise<number> {
        const query = `
            DELETE
            FROM refresh_tokens
            WHERE expires_at < NOW();
        `;
        const result = await this.db.query(query);
        return result.length;
    }
}
