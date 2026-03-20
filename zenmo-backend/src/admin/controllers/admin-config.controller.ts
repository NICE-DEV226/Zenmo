import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeatureFlag, FeatureFlagDocument } from '../schemas/feature-flag.schema';
import { AuditService } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin/config')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminConfigController {
    constructor(
        @InjectModel(FeatureFlag.name) private featureFlagModel: Model<FeatureFlagDocument>,
        private auditService: AuditService,
    ) { }

    // ===== FEATURE FLAGS =====
    @Get('features')
    async listFeatureFlags() {
        return this.featureFlagModel.find().sort({ key: 1 });
    }

    @Post('features')
    @UseGuards(SuperAdminGuard)
    async createFeatureFlag(@Body() body: any, @Request() req) {
        const flag = await this.featureFlagModel.create({
            ...body,
            lastModifiedBy: req.user.userId,
        });

        await this.auditService.logAction(
            req.user.userId,
            'CREATE_FEATURE_FLAG',
            'feature_flag',
            flag.key,
            { enabled: flag.enabled },
        );

        return flag;
    }

    @Patch('features/:key')
    @UseGuards(SuperAdminGuard)
    async updateFeatureFlag(
        @Param('key') key: string,
        @Body() body: { enabled: boolean; config?: any },
        @Request() req,
    ) {
        const flag = await this.featureFlagModel.findOneAndUpdate(
            { key },
            {
                ...body,
                lastModifiedBy: req.user.userId,
            },
            { new: true },
        );

        await this.auditService.logAction(
            req.user.userId,
            'UPDATE_FEATURE_FLAG',
            'feature_flag',
            key,
            body,
        );

        return flag;
    }
}
