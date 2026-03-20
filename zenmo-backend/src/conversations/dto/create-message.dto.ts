import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsEnum(['text', 'image', 'audio'])
    type: 'text' | 'image' | 'audio';

    @IsNotEmpty()
    @IsString()
    content: string; // Text content or S3 path

    @IsOptional()
    @IsObject()
    meta?: {
        duration?: number;
        size?: number;
        width?: number;
        height?: number;
    };
}
