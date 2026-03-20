import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vibe, VibeDocument } from './schemas/vibe.schema';
import { CreateVibeDto } from './dto/create-vibe.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class VibesService {
    constructor(
        @InjectModel(Vibe.name) private vibeModel: Model<VibeDocument>,
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        private notificationsService: NotificationsService,
        private usersService: UsersService,
    ) { }

    /**
     * Create a new vibe
     */
    async create(userId: string, createVibeDto: CreateVibeDto): Promise<VibeDocument> {
        const vibe = new this.vibeModel({
            userId,
            ...createVibeDto,
        });

        return vibe.save();
    }

    /**
     * Get vibes feed (by country and city, paginated)
     */
    async getFeed(countryCode?: string, city?: string, type?: string, limit = 20, skip = 0): Promise<VibeDocument[]> {
        const filter: any = { isActive: true };

        if (countryCode) {
            filter.countryCode = countryCode;
        }

        if (city) {
            filter.city = city;
        }

        if (type) {
            filter.type = type;
        }

        return this.vibeModel
            .find(filter)
            .populate('userId', 'username displayName avatarUrl vibe')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec() as unknown as VibeDocument[];
    }

    /**
     * Get intelligent feed - CORE ZENMO FEATURE
     * Algorithm: Friends (40%) + Local (30%) + Trending (20%) + Discovery (10%)
     */
    async getIntelligentFeed(
        userId: string,
        userCity?: string,
        userContacts: string[] = [],
        limit = 20,
        cursor?: string
    ): Promise<{ vibes: VibeDocument[]; nextCursor?: string }> {
        const cursorDate = cursor ? new Date(Buffer.from(cursor, 'base64').toString('utf-8')) : new Date();

        // Calculate distribution
        const friendsLimit = Math.floor(limit * 0.4); // 40%
        const localLimit = Math.floor(limit * 0.3); // 30%
        const trendingLimit = Math.floor(limit * 0.2); // 20%
        const discoveryLimit = limit - friendsLimit - localLimit - trendingLimit; // 10%

        // 1. Friends' Vibes (40%)
        const friendsVibes = userContacts.length > 0 ? await this.vibeModel
            .find({
                userId: { $in: userContacts },
                isActive: true,
                createdAt: { $lt: cursorDate }
            })
            .populate('userId', 'username displayName avatarUrl vibe')
            .sort({ createdAt: -1 })
            .limit(friendsLimit)
            .lean()
            .exec() as unknown as VibeDocument[] : [];

        // 2. Local Vibes (30%)
        const localVibes = userCity ? await this.vibeModel
            .find({
                city: userCity,
                isActive: true,
                createdAt: { $lt: cursorDate }
            })
            .populate('userId', 'username displayName avatarUrl vibe')
            .sort({ createdAt: -1 })
            .limit(localLimit)
            .lean()
            .exec() as unknown as VibeDocument[] : [];

        // 3. Trending Vibes (20%) - High engagement
        const trendingVibes = await this.vibeModel
            .find({
                isActive: true,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), $lt: cursorDate } // Last 24h
            })
            .populate('userId', 'username displayName avatarUrl vibe')
            .sort({ likes: -1, createdAt: -1 })
            .limit(trendingLimit)
            .lean()
            .exec() as unknown as VibeDocument[];

        // 4. Discovery Vibes (10%) - Random but relevant
        const discoveryVibes = await this.vibeModel
            .find({
                isActive: true,
                createdAt: { $lt: cursorDate }
            })
            .populate('userId', 'username displayName avatarUrl vibe')
            .sort({ createdAt: -1 })
            .limit(discoveryLimit)
            .lean()
            .exec() as unknown as VibeDocument[];

        // Combine and deduplicate
        const allVibes = [...friendsVibes, ...localVibes, ...trendingVibes, ...discoveryVibes];
        const uniqueVibes = Array.from(
            new Map(allVibes.map(vibe => [vibe._id.toString(), vibe])).values()
        ).slice(0, limit);

        // Sort by mix of recency and engagement (with null-safe defaults)
        uniqueVibes.sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            const scoreA = ((a.likes || 0) * 2) + ((a.views || 0) * 0.5) + (dateA / 1000000);
            const scoreB = ((b.likes || 0) * 2) + ((b.views || 0) * 0.5) + (dateB / 1000000);
            return scoreB - scoreA;
        });

        // Generate next cursor
        const lastVibe = uniqueVibes[uniqueVibes.length - 1] as any;
        const nextCursor = uniqueVibes.length === limit && uniqueVibes.length > 0 && lastVibe.createdAt
            ? Buffer.from(new Date(lastVibe.createdAt).toISOString()).toString('base64')
            : undefined;

        return { vibes: uniqueVibes, nextCursor };
    }

    /**
     * Get vibes by user
     */
    async findByUser(userId: string, limit = 20): Promise<VibeDocument[]> {
        return this.vibeModel
            .find({ userId, isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec() as unknown as VibeDocument[];
    }

    /**
     * Get a single vibe
     */
    async findOne(vibeId: string): Promise<VibeDocument> {
        const vibe = await this.vibeModel
            .findById(vibeId)
            .populate('userId', 'username displayName avatarUrl vibe')
            .lean()
            .exec() as unknown as VibeDocument;

        if (!vibe || !vibe.isActive) {
            throw new NotFoundException('Vibe not found');
        }

        return vibe;
    }

    /**
     * Like a vibe
     */
    async like(vibeId: string, userId: string): Promise<VibeDocument> {
        const vibe = await this.vibeModel.findById(vibeId);

        if (!vibe) {
            throw new NotFoundException('Vibe not found');
        }

        // Check if already liked
        const alreadyLiked = vibe.likedBy.some(id => id.toString() === userId);

        if (alreadyLiked) {
            throw new BadRequestException('You already liked this vibe');
        }

        // Add like
        vibe.likedBy.push(userId as any);
        vibe.likes += 1;
        const savedVibe = await vibe.save();

        // 🔔 Send Notification (if not self-like)
        if (vibe.userId.toString() !== userId) {
            const liker = await this.usersService.findOne(userId);
            if (liker) {
                // Get recipient OneSignal ID (assuming it's stored in User model, or we use external ID)
                // For now, we'll assume the userId is the OneSignal External ID
                await this.notificationsService.notifyVibeLiked(
                    vibe.userId.toString(),
                    liker.username,
                    vibe.text
                );
            }
        }

        return savedVibe;
    }

    /**
     * Unlike a vibe
     */
    async unlike(vibeId: string, userId: string): Promise<VibeDocument> {
        const vibe = await this.vibeModel.findById(vibeId);

        if (!vibe) {
            throw new NotFoundException('Vibe not found');
        }

        // Remove like
        vibe.likedBy = vibe.likedBy.filter(id => id.toString() !== userId);
        vibe.likes = Math.max(0, vibe.likes - 1);

        return vibe.save();
    }

    /**
     * Delete a vibe (soft delete)
     */
    async delete(vibeId: string, userId: string): Promise<void> {
        const vibe = await this.vibeModel.findById(vibeId);

        if (!vibe) {
            throw new NotFoundException('Vibe not found');
        }

        if (vibe.userId.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own vibes');
        }

        vibe.isActive = false;
        await vibe.save();
    }

    /**
     * Increment comment count (called when a comment is added)
     */
    async incrementComments(vibeId: string): Promise<void> {
        await this.vibeModel.findByIdAndUpdate(vibeId, {
            $inc: { comments: 1 },
        });
    }

    async addComment(vibeId: string, userId: string, createCommentDto: CreateCommentDto): Promise<CommentDocument> {
        const vibe = await this.vibeModel.findById(vibeId);
        if (!vibe) throw new NotFoundException('Vibe not found');

        const comment = new this.commentModel({
            vibe: vibeId,
            user: userId,
            content: createCommentDto.content,
        });

        const savedComment = await comment.save();
        await this.incrementComments(vibeId);

        // 🔔 Send Notification (if not self-comment)
        if (vibe.userId.toString() !== userId) {
            const commenter = await this.usersService.findOne(userId);
            if (commenter) {
                await this.notificationsService.notifyVibeCommented(
                    vibe.userId.toString(),
                    commenter.username,
                    createCommentDto.content,
                    vibeId
                );
            }
        }

        return savedComment.populate('user', 'username avatarUrl');
    }

    async getComments(vibeId: string, limit = 50): Promise<CommentDocument[]> {
        return this.commentModel
            .find({ vibe: vibeId })
            .sort({ createdAt: 1 })
            .limit(limit)
            .populate('user', 'username avatarUrl')
            .lean()
            .exec() as unknown as CommentDocument[];
    }

    async deleteComment(commentId: string, userId: string): Promise<void> {
        const comment = await this.commentModel.findById(commentId);
        if (!comment) throw new NotFoundException('Comment not found');

        if (comment.user.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.commentModel.findByIdAndDelete(commentId);
    }
}
