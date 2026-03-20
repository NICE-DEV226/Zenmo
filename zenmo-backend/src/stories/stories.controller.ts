import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
    constructor(private readonly storiesService: StoriesService) { }

    @Post()
    create(@Request() req, @Body() createStoryDto: CreateStoryDto) {
        return this.storiesService.create(req.user.userId, createStoryDto);
    }

    @Get()
    findByCity(@Query('city') city: string, @Query('limit') limit: string) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.storiesService.findByCity(city, limitNum);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.storiesService.findByUser(userId);
    }

    @Get('cities')
    getActiveCities() {
        return this.storiesService.getActiveCities();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.storiesService.findOne(id);
    }

    @Patch(':id/view')
    incrementViews(@Param('id') id: string) {
        return this.storiesService.incrementViews(id);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Request() req) {
        return this.storiesService.delete(id, req.user.userId);
    }
}
