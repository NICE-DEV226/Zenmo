import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true, index: true })
    city: string; // Stories regroupées par ville

    @Prop({
        type: [{
            type: { type: String, enum: ['image', 'video'], required: true },
            url: { type: String, required: true }, // S3 path
            caption: { type: String, default: '' },
            duration: { type: Number, default: 5 } // Durée d'affichage (secondes)
        }],
        required: true
    })
    content: Array<{
        type: 'image' | 'video';
        url: string;
        caption: string;
        duration: number;
    }>;

    @Prop({ type: String, default: '' })
    vibe: string; // Mood/vibe de la story (optional)

    @Prop({ type: Date, required: true })
    expiresAt: Date; // Expiration à 24h après création

    @Prop({ type: Number, default: 0 })
    views: number; // Nombre de vues
}

export const StorySchema = SchemaFactory.createForClass(Story);

// Compound index pour queries optimisées (stories par ville + non expirées)
StorySchema.index({ city: 1, expiresAt: 1 });
StorySchema.index({ userId: 1, expiresAt: 1 });

// TTL Index : MongoDB supprime automatiquement les stories expirées
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
