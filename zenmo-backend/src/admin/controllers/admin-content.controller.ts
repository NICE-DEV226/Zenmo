import { Controller, Get, Delete, Param, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ModerationService } from '../services/moderation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@Controller('admin/content')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminContentController {
    constructor(private moderationService: ModerationService) { }

    // ===== STORIES =====
    @Get('stories')
    async listStories(@Query() query) {
        return this.moderationService.listStories(query);
    }

    @Delete('stories/:id')
    async deleteStory(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
        return this.moderationService.deleteStory(req.user.userId, id, reason || 'Admin deletion');
    }

    // ===== VIBES =====
    @Get('vibes')
    async listVibes(@Query() query) {
        return this.moderationService.listVibes(query);
    }

    @Delete('vibes/:id')
    async deleteVibe(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
        return this.moderationService.deleteVibe(req.user.userId, id, reason || 'Admin deletion');
    }

    // ===== MESSAGES =====
    @Delete('messages/:id')
    async deleteMessage(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
        return this.moderationService.deleteMessage(req.user.userId, id, reason || 'Admin deletion');
    }
}
