import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeatureFlagDocument = FeatureFlag & Document;

@Schema({ timestamps: true })
export class FeatureFlag {
    @Prop({ required: true, unique: true, index: true })
    key: string; // 'gists_enabled', 'duels_enabled', etc.

    @Prop({ required: true })
    enabled: boolean;

    @Prop({ type: String })
    description?: string;

    @Prop({ type: Object })
    config?: any; // Configuration spécifique à la feature

    @Prop({ type: [String], default: [] })
    enabledForUsers?: string[]; // Beta testing pour users spécifiques

    @Prop({ type: Types.ObjectId, ref: 'User' })
    lastModifiedBy?: Types.ObjectId;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);
