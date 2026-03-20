import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { VibesService } from './vibes.service';
import { CreateVibeDto } from './dto/create-vibe.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vibes')
@UseGuards(JwtAuthGuard)
export class VibesController {
    constructor(private readonly vibesService: VibesService) { }

    @Post()
    create(@Request() req, @Body() createVibeDto: CreateVibeDto) {
        return this.vibesService.create(req.user.userId, createVibeDto);
    }

    @Get()
    getFeed(
        @Query('countryCode') countryCode: string,
        @Query('city') city: string,
        @Query('type') type: string,
        @Query('limit') limit: string,
        @Query('skip') skip: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        const skipNum = skip ? parseInt(skip, 10) : 0;
        return this.vibesService.getFeed(countryCode, city, type, limitNum, skipNum);
    }

    /**
     * Intelligent Feed - CORE ZENMO FEATURE
     * Returns personalized vibes based on friends, location, and trends
     */
    @Get('feed')
    async getIntelligentFeed(
        @Request() req,
        @Query('limit') limit: string,
        @Query('cursor') cursor: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 20;

        // Get user profile for context
        const userId = req.user.userId;
        // TODO: Fetch user city and contacts from user service
        // For now, we'll use empty values and improve later
        const userCity = undefined;
        const userContacts: string[] = [];

        return this.vibesService.getIntelligentFeed(userId, userCity, userContacts, limitNum, cursor);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string, @Query('limit') limit: string) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.vibesService.findByUser(userId, limitNum);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vibesService.findOne(id);
    }

    @Patch(':id/like')
    like(@Param('id') id: string, @Request() req) {
        return this.vibesService.like(id, req.user.userId);
    }

    @Patch(':id/unlike')
    unlike(@Param('id') id: string, @Request() req) {
        return this.vibesService.unlike(id, req.user.userId);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Request() req) {
        return this.vibesService.delete(id, req.user.userId);
    }

    @Post(':id/comments')
    addComment(@Param('id') id: string, @Body() createCommentDto: CreateCommentDto, @Request() req) {
        return this.vibesService.addComment(id, req.user.userId, createCommentDto);
    }

    @Get(':id/comments')
    getComments(@Param('id') id: string) {
        return this.vibesService.getComments(id);
    }

    @Delete('comments/:commentId')
    deleteComment(@Param('commentId') commentId: string, @Request() req) {
        return this.vibesService.deleteComment(commentId, req.user.userId);
    }
}
