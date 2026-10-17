import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'master_data', timestamps: true })
export class MasterData extends Document {
  @Prop({ required: true, index: true })
  category: string; // INTEREST_RATES, PENALTY_RULES, EXPENSE_CATEGORIES, ROUTES, LOAN_PURPOSES

  @Prop({ required: true, index: true })
  code: string;

  @Prop({ required: true })
  label: string;

  @Prop({ default: '' })
  labelTamil?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: any;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const MasterDataSchema = SchemaFactory.createForClass(MasterData);
MasterDataSchema.index({ category: 1, code: 1 }, { unique: true });
