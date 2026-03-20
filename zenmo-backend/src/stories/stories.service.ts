import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
    constructor(
        @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    ) { }

    /**
     * Create a new story (expires after 24h)
     */
    async create(userId: string, createStoryDto: CreateStoryDto): Promise<StoryDocument> {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24h from now

        const story = new this.storyModel({
            userId,
            ...createStoryDto,
            expiresAt,
        });

        return story.save();
    }

    /**
     * Get stories by city (non-expired only)
     */
    async findByCity(city: string, limit = 50): Promise<StoryDocument[]> {
        return this.storyModel
            .find({
                city,
                expiresAt: { $gt: new Date() }, // Only non-expired stories
            })
            .populate('userId', 'username displayName avatarUrl vibe')
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Get stories by user (non-expired only)
     */
    async findByUser(userId: string): Promise<StoryDocument[]> {
        return this.storyModel
            .find({
                userId,
                expiresAt: { $gt: new Date() },
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Get a single story
     */
    async findOne(storyId: string): Promise<StoryDocument> {
        const story = await this.storyModel
            .findById(storyId)
            .populate('userId', 'username displayName avatarUrl vibe')
            .exec();

        if (!story) {
            throw new NotFoundException('Story not found');
        }

        // Check if expired
        if (story.expiresAt < new Date()) {
            throw new NotFoundException('Story has expired');
        }

        return story;
    }

    /**
     * Increment view count
     */
    async incrementViews(storyId: string): Promise<void> {
        await this.storyModel.findByIdAndUpdate(storyId, {
            $inc: { views: 1 },
        });
    }

    /**
     * Delete a story (only owner can delete)
     */
    async delete(storyId: string, userId: string): Promise<void> {
        const story = await this.storyModel.findById(storyId);

        if (!story) {
            throw new NotFoundException('Story not found');
        }

        if (story.userId.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own stories');
        }

        await this.storyModel.findByIdAndDelete(storyId);
    }

    /**
     * Get all active cities with stories
     */
    async getActiveCities(): Promise<string[]> {
        const cities = await this.storyModel.distinct('city', {
            expiresAt: { $gt: new Date() },
        });
        return cities;
    }
}
