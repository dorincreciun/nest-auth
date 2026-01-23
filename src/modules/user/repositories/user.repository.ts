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
        return await this.db.findByOne('users', {email});
    }

    async findById(userId: number): Promise<UserEntity | null> {
        return await this.db.findByOne('users', {id: userId});
    }

    async create(data: ICreateUser): Promise<UserEntity> {
        return await this.db.create('users', data);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
        return this.db.update('users', { id }, dto);
    }
}