import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from '../../stories/schemas/story.schema';
import { Vibe, VibeDocument } from '../../vibes/schemas/vibe.schema';
import { Message, MessageDocument } from '../../conversations/schemas/message.schema';
import { AuditService } from './audit.service';

@Injectable()
export class ModerationService {
    constructor(
        @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
        @InjectModel(Vibe.name) private vibeModel: Model<VibeDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private auditService: AuditService,
    ) { }

    // ===== STORIES =====
    async listStories(query: any) {
        const { page = 1, limit = 20, city, userId } = query;
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (city) filter.city = { $regex: city, $options: 'i' };
        if (userId) filter.userId = userId;

        const [stories, total] = await Promise.all([
            this.storyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('userId', 'username avatarUrl'),
            this.storyModel.countDocuments(filter),
        ]);

        return { data: stories, meta: { total, page: Number(page), limit: Number(limit) } };
    }

    async deleteStory(adminId: string, storyId: string, reason: string) {
        const story = await this.storyModel.findByIdAndDelete(storyId);
        if (!story) throw new NotFoundException('Story not found');

        await this.auditService.logAction(adminId, 'DELETE_STORY', 'story', storyId, { reason });
        return { message: 'Story deleted successfully' };
    }

    // ===== VIBES =====
    async listVibes(query: any) {
        const { page = 1, limit = 20, type, userId } = query;
        const skip = (page - 1) * limit;
        const filter: any = {};

        if (type) filter.type = type;
        if (userId) filter.userId = userId;

        const [vibes, total] = await Promise.all([
            this.vibeModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('userId', 'username avatarUrl'),
            this.vibeModel.countDocuments(filter),
        ]);

        return { data: vibes, meta: { total, page: Number(page), limit: Number(limit) } };
    }

    async deleteVibe(adminId: string, vibeId: string, reason: string) {
        const vibe = await this.vibeModel.findByIdAndDelete(vibeId);
        if (!vibe) throw new NotFoundException('Vibe not found');

        await this.auditService.logAction(adminId, 'DELETE_VIBE', 'vibe', vibeId, { reason });
        return { message: 'Vibe deleted successfully' };
    }

    // ===== MESSAGES (Reported only) =====
    async deleteMessage(adminId: string, messageId: string, reason: string) {
        const message = await this.messageModel.findByIdAndDelete(messageId);
        if (!message) throw new NotFoundException('Message not found');

        await this.auditService.logAction(adminId, 'DELETE_MESSAGE', 'message', messageId, { reason });
        return { message: 'Message deleted successfully' };
    }
}
