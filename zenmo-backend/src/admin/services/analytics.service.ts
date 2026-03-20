import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Story, StoryDocument } from '../../stories/schemas/story.schema';
import { Vibe, VibeDocument } from '../../vibes/schemas/vibe.schema';
import { Message, MessageDocument } from '../../conversations/schemas/message.schema';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
        @InjectModel(Vibe.name) private vibeModel: Model<VibeDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) { }

    async getOverview() {
        const [
            totalUsers,
            activeUsersToday,
            totalStories,
            totalVibes,
            totalMessages
        ] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
            this.storyModel.countDocuments(),
            this.vibeModel.countDocuments(),
            this.messageModel.countDocuments(),
        ]);

        return {
            users: {
                total: totalUsers,
                activeToday: activeUsersToday,
                growth: '+5%', // Placeholder for real calculation
            },
            content: {
                stories: totalStories,
                vibes: totalVibes,
                messages: totalMessages,
            },
            engagement: {
                avgStoriesPerUser: totalUsers ? (totalStories / totalUsers).toFixed(2) : 0,
                avgVibesPerUser: totalUsers ? (totalVibes / totalUsers).toFixed(2) : 0,
            }
        };
    }

    async getTopCities() {
        return this.userModel.aggregate([
            { $match: { city: { $ne: '' } } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
    }

    async getGrowthStats(days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return this.userModel.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }
}
