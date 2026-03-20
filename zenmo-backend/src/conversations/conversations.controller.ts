import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    /**
     * Get all conversations for the authenticated user
     */
    @Get()
    findAll(@Request() req) {
        return this.conversationsService.findAllForUser(req.user.userId);
    }

    /**
     * Create a new conversation
     */
    @Post()
    create(@Request() req, @Body() createConversationDto: CreateConversationDto) {
        return this.conversationsService.createConversation(req.user.userId, createConversationDto);
    }

    /**
     * Get a specific conversation
     */
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.conversationsService.findOne(id, req.user.userId);
    }

    /**
     * Accept a PENDING conversation (for "Taper la porte")
     */
    @Patch(':id/accept')
    accept(@Param('id') id: string, @Request() req) {
        return this.conversationsService.acceptConversation(id, req.user.userId);
    }

    /**
     * Get messages for a conversation
     */
    @Get(':id/messages')
    getMessages(
        @Param('id') id: string,
        @Query('limit') limit: string,
        @Request() req
    ) {
        const messageLimit = limit ? parseInt(limit, 10) : 50;
        return this.conversationsService.getMessages(id, req.user.userId, messageLimit);
    }

    /**
     * Send a message in a conversation
     */
    @Post(':id/messages')
    sendMessage(
        @Param('id') id: string,
        @Request() req,
        @Body() createMessageDto: CreateMessageDto
    ) {
        return this.conversationsService.sendMessage(id, req.user.userId, createMessageDto);
    }

    /**
     * Mark a message as read
     */
    @Patch('messages/:messageId/read')
    markAsRead(@Param('messageId') messageId: string, @Request() req) {
        return this.conversationsService.markAsRead(messageId, req.user.userId);
    }

    /**
     * Delete a conversation
     */
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.conversationsService.deleteConversation(id, req.user.userId);
    }
}
