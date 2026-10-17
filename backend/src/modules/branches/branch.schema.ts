import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'branches', timestamps: true })
export class Branch extends Document {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string; // e.g. MAIN, BR1, BR2

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop({ default: '' })
  addressLine2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true, default: 'Tamil Nadu' })
  state: string;

  @Prop({ required: true })
  pincode: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
