import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../../database/database.service";
import {UserEntity} from "../entities/user.entity";
import {UpdateUserDto} from "../dto/update-user.dto";
import {mapObjectKeysToSql} from "../../../common/utils";
import {ICreateUser} from "../interfaces";

@Injectable()
export class UserRepository {
    constructor(private readonly db: DatabaseService) {
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const query = `SELECT *
                       FROM users
                       WHERE email = $1`

        return await this.db.queryMaybeOne<UserEntity>(query, [email]);
    }

    async findById(userId: number): Promise<UserEntity | null> {
        const query = `
            SELECT *
            FROM users
            WHERE id = $1
        `
        return await this.db.queryMaybeOne<UserEntity>(query, [userId])
    }

    async create(data: ICreateUser): Promise<UserEntity> {
        const query = `
            INSERT INTO users (first_name, last_name, email, password, verification_token)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `

        const params = [
            data.firstName,
            data.lastName,
            data.email,
            data.password,
            data.verificationToken,
        ]

        return await this.db.queryOne<UserEntity>(query, params);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
        const keys = Object.keys(dto)
        const setClause = mapObjectKeysToSql(keys)
        const values = keys.map((key) => dto[key])

        values.push(id)

        const idPosition = values.length
        const idPlaceholder = `$${idPosition}`;

        const query = `
            UPDATE users
            SET ${setClause}
            WHERE id = ${idPlaceholder}
            RETURNING *
        `;

        return await this.db.queryOne<UserEntity>(query, values);
    }
}