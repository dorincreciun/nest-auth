import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { VALIDATION_MESSAGES as MSG } from '../constants';

export class RegisterDto {
    @IsString({ message: MSG.FIRST_NAME.STRING })
    @IsNotEmpty({ message: MSG.FIRST_NAME.NOT_EMPTY })
    @Transform(({ value }) => value?.trim())
    @MinLength(2, { message: MSG.FIRST_NAME.MIN_LENGTH })
    @MaxLength(50, { message: MSG.FIRST_NAME.MAX_LENGTH })
    firstName: string;

    @IsString({ message: MSG.LAST_NAME.STRING })
    @IsNotEmpty({ message: MSG.LAST_NAME.NOT_EMPTY })
    @Transform(({ value }) => value?.trim())
    @MinLength(2, { message: MSG.LAST_NAME.MIN_LENGTH })
    @MaxLength(50, { message: MSG.LAST_NAME.MAX_LENGTH })
    lastName: string;

    @IsEmail({}, { message: MSG.EMAIL.INVALID })
    @IsNotEmpty({ message: MSG.EMAIL.NOT_EMPTY })
    @Transform(({ value }) => value?.toLowerCase().trim())
    @MaxLength(250, { message: MSG.EMAIL.MAX_LENGTH })
    email: string;

    @IsString({ message: MSG.PASSWORD.STRING })
    @IsNotEmpty({ message: MSG.PASSWORD.NOT_EMPTY })
    @MinLength(8, { message: MSG.PASSWORD.MIN_LENGTH })
    @MaxLength(250, { message: MSG.PASSWORD.MAX_LENGTH })
    password: string;
}