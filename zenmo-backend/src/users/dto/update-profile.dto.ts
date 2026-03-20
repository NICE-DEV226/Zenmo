import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    username?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    bio?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsEnum(['male', 'female'])
    gender?: 'male' | 'female';

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    interests?: string[];

    @IsOptional()
    @IsString()
    countryCode?: string;

    @IsOptional()
    @IsString()
    city?: string;
}
