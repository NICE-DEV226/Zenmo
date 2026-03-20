import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private usersService: UsersService,
    ) { }

    /**
     * Create a new conversation or return existing one
     * Implements "Taper la porte" logic (PENDING status if users are not friends)
     */
    async createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<ConversationDocument> {
        const { participantId } = createConversationDto;

        // Check if conversation already exists
        const existingConversation = await this.conversationModel.findOne({
            participants: { $all: [userId, participantId] }
        }).exec();

        if (existingConversation) {
            return existingConversation;
        }

        // Check if users are friends (bidirectional check)
        const currentUser = await this.usersService.findOne(userId);
        const otherUser = await this.usersService.findOne(participantId);

        if (!currentUser || !otherUser) {
            throw new NotFoundException('User not found');
        }

        // Check if participantId allows message requests
        if (!otherUser.privacySettings.allowMessageRequests) {
            throw new ForbiddenException('This user does not accept message requests');
        }

        // Check if users are friends
        const areFriends = currentUser.contacts.some(
            contact => contact.toString() === participantId
        );

        // Create conversation with appropriate status
        const conversation = new this.conversationModel({
            participants: [userId, participantId],
            status: areFriends ? 'ACTIVE' : 'PENDING',
        });

        return conversation.save();
    }

    /**
     * Get all conversations for a user
     */
    async findAllForUser(userId: string): Promise<ConversationDocument[]> {
        return this.conversationModel
            .find({ participants: userId })
            .populate('participants', 'username displayName avatarUrl vibe')
            .sort({ 'lastMessage.at': -1 })
            .exec();
    }

    /**
     * Get a single conversation by ID
     */
    async findOne(conversationId: string, userId: string): Promise<ConversationDocument> {
        const conversation = await this.conversationModel
            .findById(conversationId)
            .populate('participants', 'username displayName avatarUrl vibe')
            .exec();

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            (p: any) => p._id.toString() === userId
        );

        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        return conversation;
    }

    /**
     * Accept a PENDING conversation (for "Taper la porte")
     */
    async acceptConversation(conversationId: string, userId: string): Promise<ConversationDocument> {
        const conversation = await this.findOne(conversationId, userId);

        if (conversation.status !== 'PENDING') {
            throw new BadRequestException('Conversation is not pending');
        }

        conversation.status = 'ACTIVE';
        conversation.acceptedAt = new Date();
        return conversation.save();
    }

    /**
     * Send a message in a conversation
     */
    async sendMessage(
        conversationId: string,
        userId: string,
        createMessageDto: CreateMessageDto
    ): Promise<MessageDocument> {
        const conversation = await this.findOne(conversationId, userId);

        // If conversation is PENDING, only allow text messages (no media)
        if (conversation.status === 'PENDING' && createMessageDto.type !== 'text') {
            throw new ForbiddenException('Only text messages are allowed in pending conversations');
        }

        // Determine recipient
        const recipientId = conversation.participants.find(
            (p: any) => p._id.toString() !== userId
        );

        if (!recipientId) {
            throw new BadRequestException('Invalid conversation participants');
        }

        // Create message
        const message = new this.messageModel({
            conversationId: new Types.ObjectId(conversation._id),
            from: new Types.ObjectId(userId),
            to: new Types.ObjectId((recipientId as any)._id),
            type: createMessageDto.type,
            content: createMessageDto.content,
            meta: createMessageDto.meta || {},
        });

        const savedMessage = await message.save();

        // Update conversation lastMessage
        conversation.lastMessage = {
            text: createMessageDto.type === 'text' ? createMessageDto.content : `[${createMessageDto.type}]`,
            at: new Date(),
            from: new Types.ObjectId(userId),
        };
        await conversation.save();

        return savedMessage;
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId: string, userId: string, limit = 50): Promise<MessageDocument[]> {
        await this.findOne(conversationId, userId); // Check access

        return this.messageModel
            .find({ conversationId: new Types.ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    /**
     * Mark message as delivered
     */
    async markAsDelivered(messageId: string): Promise<MessageDocument> {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new NotFoundException('Message not found');
        }

        message.delivered = true;
        message.deliveredAt = new Date();
        return message.save();
    }

    /**
     * Mark message as read
     */
    async markAsRead(messageId: string, userId: string): Promise<MessageDocument> {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new NotFoundException('Message not found');
        }

        // Only recipient can mark as read
        if (message.to.toString() !== userId) {
            throw new ForbiddenException('Only recipient can mark message as read');
        }

        message.read = true;
        message.readAt = new Date();
        return message.save();
    }

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string, userId: string): Promise<void> {
        const conversation = await this.findOne(conversationId, userId);

        // Delete all messages in the conversation
        await this.messageModel.deleteMany({ conversationId: conversation._id });

        // Delete the conversation
        await this.conversationModel.findByIdAndDelete(conversation._id);
    }
}
