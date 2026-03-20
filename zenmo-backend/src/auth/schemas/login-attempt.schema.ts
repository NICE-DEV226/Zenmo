import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoginAttemptDocument = LoginAttempt & Document;

@Schema({ timestamps: true })
export class LoginAttempt {
    @Prop({ required: true, index: true })
    phoneNumberHash: string;

    @Prop({ required: true })
    successful: boolean;

    @Prop({ type: String })
    ipAddress?: string;

    @Prop({ type: String })
    userAgent?: string;

    @Prop({ type: Date, default: Date.now })
    attemptedAt: Date;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);

// TTL index: auto-delete login attempts after 1 hour
LoginAttemptSchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 3600 });
