import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class WorkingHoursConfig {
  @Prop({ required: true, default: '08:00' })
  start: string;

  @Prop({ required: true, default: '20:00' })
  end: string;

  @Prop({ type: [Number], default: [1, 2, 3, 4, 5, 6] }) // Mon-Sat
  days: number[];
}

@Schema({ collection: 'user_restrictions', timestamps: true })
export class UserRestriction extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  managerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: '' })
  reason: string;

  @Prop({ default: null })
  presetName?: string;

  @Prop({ type: [String], default: [] })
  blockedModules: string[];

  @Prop({ type: [String], default: [] })
  blockedActions: string[];

  @Prop({ type: [String], default: [] })
  blockedLoanTypes: string[];

  @Prop({ type: Number, default: null })
  maxApprovalAmountPaise?: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Branch' }], default: [] })
  allowedBranchIds: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  blockedFields: string[];

  @Prop({ type: WorkingHoursConfig, default: null })
  workingHours?: WorkingHoursConfig;

  @Prop({ type: Date, default: null, index: { expires: '0s' } }) // TTL index for auto-expiry
  expiresAt?: Date;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const UserRestrictionSchema = SchemaFactory.createForClass(UserRestriction);
