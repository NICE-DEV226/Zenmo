import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format' })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
