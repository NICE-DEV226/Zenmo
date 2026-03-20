import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReverseContactBookDocument = ReverseContactBook & Document;

@Schema({ timestamps: true })
export class ReverseContactBook {
    @Prop({ required: true, unique: true, index: true })
    _id: string; // The Phone Hash (SHA-256)

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    importedBy: Types.ObjectId[]; // Users who have this number in their contacts
}

export const ReverseContactBookSchema = SchemaFactory.createForClass(ReverseContactBook);
