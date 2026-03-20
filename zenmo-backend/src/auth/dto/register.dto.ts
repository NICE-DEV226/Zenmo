import { IsString, IsNotEmpty, Matches, Length, MinLength, IsEmail } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format' })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_.-]+$/, { message: 'Username can only contain letters, numbers, underscores, dots and dashes' })
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    countryCode: string;
}
