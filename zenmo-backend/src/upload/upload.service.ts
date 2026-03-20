import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

@Injectable()
export class UploadService {
    constructor(private configService: ConfigService) {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    /**
     * Generate upload signature for client-side direct upload to Cloudinary
     */
    async getUploadSignature(
        folder: 'images' | 'audio' | 'videos' = 'images',
        resourceType: 'image' | 'video' | 'raw' = 'image'
    ): Promise<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string }> {
        const timestamp = Math.round(new Date().getTime() / 1000);

        const paramsToSign = {
            timestamp,
            folder: `zenmo/${folder}`,
            resource_type: resourceType,
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            this.configService.get<string>('CLOUDINARY_API_SECRET') || ''
        );

        return {
            signature,
            timestamp,
            cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '',
            apiKey: this.configService.get<string>('CLOUDINARY_API_KEY') || '',
            folder: paramsToSign.folder,
        };
    }

    /**
     * Upload image directly from backend (for processed images)
     */
    async uploadImage(
        buffer: Buffer,
        folder: 'images' | 'audio' | 'videos' = 'images',
        options?: { width?: number; quality?: number }
    ): Promise<{ url: string; publicId: string }> {
        const { width = 1200, quality = 80 } = options || {};

        // Compress image with Sharp
        const compressedBuffer = await sharp(buffer)
            .resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality })
            .toBuffer();

        // Upload to Cloudinary
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `zenmo/${folder}`,
                    resource_type: 'image',
                    transformation: [
                        { width: 1200, crop: 'limit' },
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                        });
                    }
                }
            );

            uploadStream.end(compressedBuffer);
        });
    }

    /**
     * Create thumbnail
     */
    async createThumbnail(buffer: Buffer, size = 200): Promise<Buffer> {
        return await sharp(buffer)
            .resize(size, size, {
                fit: 'cover',
            })
            .jpeg({ quality: 70 })
            .toBuffer();
    }

    /**
     * Get optimized URL with transformations
     */
    getOptimizedUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }): string {
        const { width, height, crop = 'limit' } = options || {};

        return cloudinary.url(publicId, {
            width,
            height,
            crop,
            quality: 'auto:good',
            fetch_format: 'auto',
            secure: true,
        });
    }

    /**
     * Delete an image from Cloudinary
     */
    async deleteImage(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }

    /**
     * Generate multiple upload signatures for batch upload
     */
    async getBatchUploadSignatures(
        count: number,
        folder: 'images' | 'audio' | 'videos' = 'images'
    ): Promise<Array<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string }>> {
        const signatures: Array<{ signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string }> = [];

        for (let i = 0; i < count; i++) {
            const sig = await this.getUploadSignature(folder);
            signatures.push(sig);
        }

        return signatures;
    }
}
