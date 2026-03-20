import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
    participants: Types.ObjectId[]; // Always 2 participants for 1:1 chat

    @Prop({ type: String, enum: ['ACTIVE', 'PENDING'], default: 'ACTIVE' })
    status: string; // PENDING = "Taper la porte" (not friends yet)

    @Prop({
        type: {
            text: { type: String, default: '' },
            at: { type: Date, default: Date.now },
            from: { type: Types.ObjectId, ref: 'User' }
        },
        default: null
    })
    lastMessage: {
        text: string;
        at: Date;
        from: Types.ObjectId;
    };

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    muted: Types.ObjectId[]; // Users who muted this conversation

    @Prop({ type: Boolean, default: false })
    archived: boolean;

    @Prop({ type: Date })
    acceptedAt?: Date; // When PENDING was accepted
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Indexes for performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'lastMessage.at': -1 });
ConversationSchema.index({ status: 1 });
