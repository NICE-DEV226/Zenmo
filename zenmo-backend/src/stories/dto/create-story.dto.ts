import { IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class StoryContentDto {
    @IsNotEmpty()
    @IsEnum(['image', 'video'])
    type: 'image' | 'video';

    @IsNotEmpty()
    @IsString()
    url: string; // S3 path

    @IsOptional()
    @IsString()
    @MaxLength(200)
    caption?: string;

    @IsOptional()
    duration?: number;
}

export class CreateStoryDto {
    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StoryContentDto)
    content: StoryContentDto[];

    @IsOptional()
    @IsString()
    vibe?: string;
}
