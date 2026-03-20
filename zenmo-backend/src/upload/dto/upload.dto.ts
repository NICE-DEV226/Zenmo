import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';

export class GetUploadSignatureDto {
    @IsOptional()
    @IsEnum(['images', 'audio', 'videos'])
    folder?: 'images' | 'audio' | 'videos';

    @IsOptional()
    @IsEnum(['image', 'video', 'raw'])
    resourceType?: 'image' | 'video' | 'raw';
}

export class BatchUploadSignatureDto {
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    count: number;

    @IsOptional()
    @IsEnum(['images', 'audio', 'videos'])
    folder?: 'images' | 'audio' | 'videos';
}

export class OptimizeImageDto {
    @IsNotEmpty()
    @IsString()
    publicId: string;

    @IsOptional()
    @IsInt()
    @Min(100)
    width?: number;

    @IsOptional()
    @IsInt()
    @Min(100)
    height?: number;

    @IsOptional()
    @IsEnum(['limit', 'fill', 'fit', 'scale', 'crop'])
    crop?: string;
}
