import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional, MaxLength } from 'class-validator';

export class CreateVibeDto {
    @IsNotEmpty()
    @IsEnum(['mood', 'question', 'confession'])
    type: 'mood' | 'question' | 'confession';

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    text: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    media?: string[]; // S3 paths

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    countryCode: string;
}
