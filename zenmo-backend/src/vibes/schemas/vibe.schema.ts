import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VibeDocument = Vibe & Document;

@Schema({ timestamps: true })
export class Vibe {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: ['mood', 'question', 'confession'], required: true })
    type: string;

    @Prop({ type: String, required: true, maxlength: 500 })
    text: string; // Contenu textuel

    @Prop({ type: [String], default: [] })
    media: string[]; // S3 paths (images/videos)

    @Prop({ type: String, required: true, index: true })
    city: string; // Vibes regroupées par ville

    @Prop({ type: String, required: true, index: true, default: 'BF' })
    countryCode: string; // Pays de la vibe

    @Prop({ type: Number, default: 0 })
    likes: number;

    @Prop({ type: Number, default: 0 })
    comments: number;

    @Prop({ type: Number, default: 0 })
    views: number; // Track vibe impressions

    @Prop({ type: Number, default: 0 })
    shares: number; // Track vibe shares

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    likedBy: Types.ObjectId[]; // Pour éviter les likes multiples

    @Prop({ type: String, enum: ['public', 'friends', 'city'], default: 'public' })
    visibility: string; // Control vibe visibility

    @Prop({ type: Boolean, default: true })
    isActive: boolean; // Pour soft delete

    createdAt?: Date;
    updatedAt?: Date;
}

export const VibeSchema = SchemaFactory.createForClass(Vibe);

// Indexes pour queries optimisées
VibeSchema.index({ countryCode: 1, city: 1, createdAt: -1 }); // Feed par pays/ville
VibeSchema.index({ userId: 1, createdAt: -1 }); // Vibes d'un user
VibeSchema.index({ type: 1, createdAt: -1 }); // Filter par type
VibeSchema.index({ likes: -1, views: -1, createdAt: -1 }); // Trending vibes
VibeSchema.index({ location: '2dsphere' });
