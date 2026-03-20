import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
    constructor(private adminService: AdminService) { }

    @Get()
    async listUsers(@Query() query) {
        return this.adminService.findAllUsers(query);
    }

    @Get(':id')
    async getUserDetails(@Param('id') id: string) {
        return this.adminService.getUserDetails(id);
    }

    @Post(':id/ban')
    @Roles('ADMIN', 'SUPER_ADMIN')
    async banUser(
        @Param('id') id: string,
        @Body() body: { reason: string; durationHours?: number },
        @Request() req,
    ) {
        return this.adminService.banUser(req.user.userId, id, body.reason, body.durationHours);
    }

    @Post(':id/unban')
    @Roles('ADMIN', 'SUPER_ADMIN')
    async unbanUser(@Param('id') id: string, @Request() req) {
        return this.adminService.unbanUser(req.user.userId, id);
    }

    @Patch(':id/role')
    @UseGuards(SuperAdminGuard) // Only Super Admin can change roles
    async updateUserRole(
        @Param('id') id: string,
        @Body() body: { role: string },
        @Request() req,
    ) {
        return this.adminService.updateUserRole(req.user.userId, id, body.role);
    }
}
