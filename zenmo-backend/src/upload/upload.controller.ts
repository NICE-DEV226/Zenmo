import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { UploadService } from './upload.service';
import { GetUploadSignatureDto, BatchUploadSignatureDto, OptimizeImageDto } from './dto/upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Get upload signature for Cloudinary direct upload
   */
  @Post('signature')
  async getUploadSignature(@Body() dto: GetUploadSignatureDto) {
    return await this.uploadService.getUploadSignature(
      dto.folder || 'images',
      dto.resourceType || 'image'
    );
  }

  /**
   * Get multiple upload signatures for batch upload
   */
  @Post('batch-signatures')
  async getBatchUploadSignatures(@Body() dto: BatchUploadSignatureDto) {
    return await this.uploadService.getBatchUploadSignatures(
      dto.count,
      dto.folder || 'images'
    );
  }

  /**
   * Get optimized URL for an image
   */
  @Get('optimize')
  getOptimizedUrl(@Query() dto: OptimizeImageDto) {
    return {
      url: this.uploadService.getOptimizedUrl(dto.publicId, {
        width: dto.width,
        height: dto.height,
        crop: dto.crop,
      }),
    };
  }
}
