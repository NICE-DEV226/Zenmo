import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
    conversationId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    from: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    to: Types.ObjectId;

    @Prop({ type: String, enum: ['text', 'image', 'audio'], required: true })
    type: string;

    @Prop({ type: String, required: true })
    content: string; // Text content or S3 path for media

    @Prop({
        type: {
            duration: { type: Number },  // For audio messages (seconds)
            size: { type: Number },       // File size in bytes
            width: { type: Number },      // For images
            height: { type: Number }      // For images
        },
        default: {}
    })
    meta: {
        duration?: number;
        size?: number;
        width?: number;
        height?: number;
    };

    @Prop({ type: Boolean, default: false })
    delivered: boolean;

    @Prop({ type: Boolean, default: false })
    read: boolean;

    @Prop({ type: Number, default: 0 })
    flags: number; // For moderation (0 = OK, 1 = reported, 2 = deleted)

    @Prop({ type: Date })
    deliveredAt?: Date;

    @Prop({ type: Date })
    readAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Compound indexes for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ from: 1, createdAt: -1 });
MessageSchema.index({ to: 1, delivered: 1 });
