import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'feature_flags', timestamps: true })
export class FeatureFlag extends Document {
  @Prop({ required: true, unique: true, index: true })
  flagKey: string;

  @Prop({ required: true, default: false })
  isEnabled: boolean;

  @Prop({ default: null })
  value?: string;

  @Prop({ default: '' })
  description: string;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);
