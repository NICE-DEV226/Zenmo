import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    reporterId: Types.ObjectId;

    @Prop({ required: true, enum: ['user', 'story', 'vibe', 'message', 'gist', 'duel'] })
    targetType: string;

    @Prop({ type: String, required: true, index: true })
    targetId: string;

    @Prop({ required: true, enum: ['spam', 'harassment', 'inappropriate', 'violence', 'hate_speech', 'other'] })
    reason: string;

    @Prop({ type: String, maxlength: 500 })
    description?: string;

    @Prop({ default: 'open', enum: ['open', 'in_review', 'resolved', 'dismissed'], index: true })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    reviewedBy?: Types.ObjectId;

    @Prop({ type: String })
    adminNote?: string;

    @Prop({ type: Date })
    reviewedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes for efficient querying
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });
