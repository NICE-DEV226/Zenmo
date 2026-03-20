import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches, Length } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Phone number must be in E.164 format (e.g. +33612345678)' })
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_.-]+$/, { message: 'Username can only contain letters, numbers, underscores, dots and dashes' })
    username: string;

    @IsString()
    @IsOptional()
    @Length(0, 50)
    displayName?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @IsString()
    @IsOptional()
    @Length(0, 160)
    bio?: string;

    @IsString()
    @IsOptional()
    vibe?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 100)
    password: string;

    @IsString()
    @IsOptional()
    countryCode?: string;
}
