import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminActionDocument = AdminAction & Document;

@Schema({ timestamps: true })
export class AdminAction {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    adminId: Types.ObjectId;

    @Prop({ required: true, index: true })
    action: string; // 'BAN_USER', 'DELETE_STORY', 'RESOLVE_REPORT', etc.

    @Prop({ type: Types.ObjectId, ref: 'User' })
    targetUserId?: Types.ObjectId;

    @Prop({ type: String })
    targetType?: string; // 'user', 'story', 'vibe', 'message', etc.

    @Prop({ type: String })
    targetId?: string;

    @Prop({ type: Object })
    metadata?: any; // Détails supplémentaires de l'action

    @Prop({ type: String })
    ipAddress?: string;

    @Prop({ type: String })
    userAgent?: string;

    @Prop({ type: String })
    reason?: string; // Raison de l'action admin
}

export const AdminActionSchema = SchemaFactory.createForClass(AdminAction);

// Indexes for audit trail queries
AdminActionSchema.index({ adminId: 1, createdAt: -1 });
AdminActionSchema.index({ targetType: 1, targetId: 1 });
AdminActionSchema.index({ action: 1, createdAt: -1 });
