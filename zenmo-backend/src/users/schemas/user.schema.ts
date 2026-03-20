import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    // 🆔 IDENTITÉ TÉLÉPHONIQUE (PRIVÉE)
    @Prop({ type: String, unique: true, select: false }) // Select: false pour sécurité
    phoneNumber: string;

    @Prop({ type: String, required: true, unique: true, index: true })
    phoneNumberHash: string; // SHA-256 du numéro normalisé

    @Prop({ type: String, unique: true, sparse: true })
    totemId: string; // Deep Link ID

    // 📧 EMAIL (OPTIONNEL)
    @Prop({ type: String, unique: true, sparse: true })
    email?: string;

    @Prop({ type: Boolean, default: false })
    emailVerified: boolean;

    // 🌍 PAYS (POUR TOUTE L'AFRIQUE)
    @Prop({ type: String, default: 'BF' }) // Burkina Faso par défaut
    countryCode: string;

    @Prop({ type: String, default: '' })
    city: string;

    // 🔐 OTP VERIFICATION
    @Prop({ type: String, select: false })
    otpCode?: string;

    @Prop({ type: Date, select: false })
    otpExpires?: Date;

    // 🛡️ ADMIN & MODERATION
    @Prop({ type: String, enum: ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'], default: 'USER' })
    role: string;

    @Prop({ type: Boolean, default: false })
    isBanned: boolean;

    @Prop({ type: String })
    banReason?: string;

    @Prop({ type: Date })
    bannedAt?: Date;

    // 👤 IDENTITÉ PUBLIQUE
    @Prop({ type: String, unique: true, index: true, required: true })
    username: string; // Le "Blase"

    @Prop({ type: String, default: '' })
    displayName: string;

    @Prop({ type: String, default: '' })
    avatarUrl: string;

    @Prop({ type: String, default: '' })
    bio: string; // Biographie de l'utilisateur

    @Prop({ type: String, enum: ['male', 'female'], required: false })
    gender?: string; // Genre de l'utilisateur

    @Prop({ type: [String], default: [] })
    interests: string[]; // Centres d'intérêt de l'utilisateur

    @Prop({ type: String, required: true, select: false })
    password: string; // Hashed with Argon2

    // 🔒 CONFIDENTIALITÉ
    @Prop({
        type: {
            discoverableByPhone: { type: Boolean, default: true },
            allowMessageRequests: { type: Boolean, default: true },
        },
        default: {},
    })
    privacySettings: {
        discoverableByPhone: boolean;
        allowMessageRequests: boolean;
    };

    // 🕸️ SOCIAL GRAPH
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    contacts: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    blockedUsers: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index Textuel pour la recherche rapide
UserSchema.index({ username: 'text', displayName: 'text' });
