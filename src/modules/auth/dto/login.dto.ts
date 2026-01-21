import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { VALIDATION_MESSAGES as MSG } from '../constants';

export class LoginDto {
    @IsEmail({}, { message: MSG.EMAIL.INVALID })
    @IsNotEmpty({ message: MSG.EMAIL.NOT_EMPTY })
    @Transform(({ value }) => value?.toLowerCase().trim())
    @MaxLength(255)
    email: string;

    @IsString({ message: MSG.PASSWORD.STRING })
    @IsNotEmpty({ message: MSG.PASSWORD.NOT_EMPTY })
    @MinLength(8, { message: MSG.PASSWORD.MIN_LENGTH })
    @MaxLength(100)
    password: string;
}