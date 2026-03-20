import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ConversationsService } from '../conversations/conversations.service';
import { CreateMessageDto } from '../conversations/dto/create-message.dto';

@WebSocketGateway({
    cors: {
        origin: '*', // TODO: Configure CORS for production
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(private conversationsService: ConversationsService) { }

    /**
     * Handle client connection
     */
    async handleConnection(client: Socket) {
        try {
            // Extract userId from handshake auth (JWT should be sent)
            const userId = client.handshake.auth.userId;

            if (!userId) {
                client.disconnect();
                return;
            }

            // Store socket mapping
            this.userSockets.set(userId, client.id);

            // Broadcast presence update
            this.server.emit('presence', {
                userId,
                status: 'online',
                timestamp: new Date(),
            });

            console.log(`User ${userId} connected (socket: ${client.id})`);
        } catch (error) {
            console.error('Connection error:', error);
            client.disconnect();
        }
    }

    /**
     * Handle client disconnection
     */
    async handleDisconnect(client: Socket) {
        // Find and remove user from map
        const userId = [...this.userSockets.entries()]
            .find(([_, socketId]) => socketId === client.id)?.[0];

        if (userId) {
            this.userSockets.delete(userId);

            // Broadcast presence update
            this.server.emit('presence', {
                userId,
                status: 'offline',
                timestamp: new Date(),
            });

            console.log(`User ${userId} disconnected`);
        }
    }

    /**
     * Join a conversation room
     */
    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @MessageBody() data: { conversationId: string; userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId, userId } = data;

        try {
            // Verify user has access to this conversation
            await this.conversationsService.findOne(conversationId, userId);

            // Join the room
            client.join(`conversation:${conversationId}`);

            console.log(`User ${userId} joined conversation ${conversationId}`);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a message
     */
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @MessageBody() data: { conversationId: string; userId: string; message: CreateMessageDto },
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId, userId, message } = data;

        try {
            // Save message to database
            const savedMessage = await this.conversationsService.sendMessage(
                conversationId,
                userId,
                message,
            );

            // Broadcast to conversation room
            this.server.to(`conversation:${conversationId}`).emit('message', {
                ...savedMessage.toObject(),
                conversationId,
            });

            // Mark as delivered if recipient is online
            const conversation = await this.conversationsService.findOne(conversationId, userId);
            const recipientId = conversation.participants.find(
                (p: any) => p._id.toString() !== userId
            );

            if (recipientId && this.userSockets.has((recipientId as any)._id.toString())) {
                await this.conversationsService.markAsDelivered(savedMessage._id.toString());

                this.server.to(`conversation:${conversationId}`).emit('message_delivered', {
                    messageId: savedMessage._id,
                    timestamp: new Date(),
                });
            }

            return { success: true, messageId: savedMessage._id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Typing indicator
     */
    @SubscribeMessage('typing')
    async handleTyping(
        @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        const { conversationId, userId, isTyping } = data;

        // Broadcast to conversation room (except sender)
        client.to(`conversation:${conversationId}`).emit('user_typing', {
            conversationId,
            userId,
            isTyping,
            timestamp: new Date(),
        });

        return { success: true };
    }

    /**
     * Mark message as read
     */
    @SubscribeMessage('mark_read')
    async handleMarkRead(
        @MessageBody() data: { messageId: string; userId: string; conversationId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { messageId, userId, conversationId } = data;

        try {
            await this.conversationsService.markAsRead(messageId, userId);

            // Broadcast to conversation room
            this.server.to(`conversation:${conversationId}`).emit('message_read', {
                messageId,
                userId,
                timestamp: new Date(),
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update presence status
     */
    @SubscribeMessage('presence:update')
    async handlePresenceUpdate(
        @MessageBody() data: { userId: string; status: 'online' | 'away' | 'offline' },
        @ConnectedSocket() client: Socket,
    ) {
        const { userId, status } = data;

        this.server.emit('presence', {
            userId,
            status,
            timestamp: new Date(),
        });

        return { success: true };
    }
}
