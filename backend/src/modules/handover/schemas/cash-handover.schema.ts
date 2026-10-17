import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type CashHandoverDocument = CashHandover & Document;

export enum HandoverStatus {
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  DISCREPANCY_FLAGGED = 'DISCREPANCY_FLAGGED',
}

@Schema({ _id: false })
export class DenominationsCount {
  @Prop({ default: 0 })
  note2000: number;

  @Prop({ default: 0 })
  note500: number;

  @Prop({ default: 0 })
  note200: number;

  @Prop({ default: 0 })
  note100: number;

  @Prop({ default: 0 })
  note50: number;

  @Prop({ default: 0 })
  note20: number;

  @Prop({ default: 0 })
  note10: number;

  @Prop({ default: 0 })
  coins: number;
}

@Schema({ timestamps: true, collection: 'cash_handovers' })
export class CashHandover {
  @Prop({ required: true, unique: true, index: true })
  handoverCode: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  agentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId;

  @Prop({ required: true, index: true })
  handoverDate: Date;

  @Prop({ required: true })
  totalCollectedCashPaise: number;

  @Prop({ required: true })
  totalCollectedUpiPaise: number;

  @Prop({ type: DenominationsCount, required: true })
  denominations: DenominationsCount;

  @Prop({ required: true })
  totalSubmittedCashPaise: number;

  @Prop({ required: true })
  discrepancyPaise: number; // submitted - collected. If negative => cash shortage; if positive => excess

  @Prop({ required: true, enum: HandoverStatus, default: HandoverStatus.SUBMITTED, index: true })
  status: HandoverStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  acceptedBy?: Types.ObjectId;

  @Prop({ default: null })
  acceptedAt?: Date;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const CashHandoverSchema = SchemaFactory.createForClass(CashHandover);
CashHandoverSchema.plugin(softDeletePlugin);

CashHandoverSchema.index({ branchId: 1, handoverDate: -1 });
CashHandoverSchema.index({ agentId: 1, handoverDate: -1 });
