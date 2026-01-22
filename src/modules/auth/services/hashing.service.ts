import {Injectable} from "@nestjs/common";
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
    private readonly SALT_ROUNDS = 10

    async hash(data: string): Promise<string> {
        return bcrypt.hash(data, this.SALT_ROUNDS)
    }

    async compare(data: string, encrypted: string): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }
}