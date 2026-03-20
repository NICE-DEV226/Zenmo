import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';

@Controller('admin/system')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminSystemController {
    constructor(private auditService: AuditService) { }

    @Get('health')
    async getSystemHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
        };
    }

    @Get('audit/logs')
    async getAuditLogs(@Query() query) {
        return this.auditService.getAdminActions(query);
    }
}
