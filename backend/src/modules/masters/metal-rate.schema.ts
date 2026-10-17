import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'metal_rates', timestamps: true })
export class MetalRate extends Document {
  @Prop({ required: true, enum: ['GOLD', 'SILVER'], index: true })
  metal: 'GOLD' | 'SILVER';

  @Prop({ required: true, index: true })
  purity: string; // e.g., 24K, 22K, 18K for Gold; 999, 925, 800 for Silver

  @Prop({ required: true })
  ratePerGramPaise: number; // Stored in integer paise (e.g. ₹6,850/g = 685000 paise)

  @Prop({ required: true, index: true })
  effectiveDate: string; // YYYY-MM-DD

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: MongooseSchema.Types.ObjectId;
}

export const MetalRateSchema = SchemaFactory.createForClass(MetalRate);
MetalRateSchema.index({ metal: 1, purity: 1, effectiveDate: 1 }, { unique: true });
