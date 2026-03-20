import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDeviceDocument = UserDevice & Document;

@Schema({ timestamps: true })
export class UserDevice {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true })
    oneSignalPlayerId: string; // OneSignal Player ID for push notifications

    @Prop({ type: String, enum: ['ios', 'android'], required: true })
    platform: string;

    @Prop({ type: String })
    deviceModel?: string;

    @Prop({ type: String })
    appVersion?: string;

    @Prop({ type: Date })
    lastActiveAt: Date;
}

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);

// Indexes
UserDeviceSchema.index({ userId: 1, oneSignalPlayerId: 1 }, { unique: true });
UserDeviceSchema.index({ oneSignalPlayerId: 1 });
