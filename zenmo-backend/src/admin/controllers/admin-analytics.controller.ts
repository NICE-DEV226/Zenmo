import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('overview')
    async getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('cities/top')
    async getTopCities() {
        return this.analyticsService.getTopCities();
    }

    @Get('growth')
    async getGrowthStats(@Query('days') days: number) {
        return this.analyticsService.getGrowthStats(days || 7);
    }
}
