import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../../database/database.service";
import {UserEntity} from "../entities/user.entity";
import {CreateUserDto} from "../dto/create-user.dto";
import {UpdateUserDto} from "../dto/update-user.dto";

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

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const query = `
            INSERT INTO users (first_name, last_name, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `

        const params = [
            dto.firstName,
            dto.lastName,
            dto.email,
            dto.password,
        ]

        return await this.db.queryOne<UserEntity>(query, params);
    }

    async update(id: number, dto: UpdateUserDto) {
        const keys = Object.keys(dto)
        const setClause = keys.map((key, index) => {
            const snakeCase = key.replace(/[A-Z]/g, (match) => {
                return `_${match.toLowerCase()}`
            })

            return `${snakeCase} = $${index + 1}`
        }).join(', ')

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