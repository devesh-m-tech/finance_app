import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../database/plugins/soft-delete.plugin';

export type NoticeDocument = Notice & Document;

export enum NoticeType {
  REMINDER_7_DAYS = 'REMINDER_7_DAYS',
  REMINDER_15_DAYS = 'REMINDER_15_DAYS',
  LEGAL_DEMAND_138 = 'LEGAL_DEMAND_138',
  REPOSSESSION_INTIMATION = 'REPOSSESSION_INTIMATION',
  AUCTION_NOTICE = 'AUCTION_NOTICE',
}

@Schema({ timestamps: true, collection: 'notices' })
export class Notice {
  @Prop({ required: true, unique: true, index: true })
  noticeCode: string;

  @Prop({ required: true, enum: NoticeType, index: true })
  noticeType: NoticeType;

  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true, index: true })
  loanId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  overdueDays: number;

  @Prop({ required: true })
  overdueAmountPaise: number;

  @Prop({ required: true, enum: ['SMS', 'WHATSAPP', 'POSTAL_REGISTERED'], default: 'WHATSAPP' })
  sentVia: string;

  @Prop({ default: Date.now })
  dispatchedAt: Date;

  @Prop({ default: null })
  servedAt?: Date;

  @Prop({ required: true, enum: ['GENERATED', 'DISPATCHED', 'SERVED', 'RESPONDED'], default: 'DISPATCHED' })
  status: string;

  @Prop({ default: '' })
  pdfUrl?: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
NoticeSchema.plugin(softDeletePlugin);

NoticeSchema.index({ customerId: 1, createdAt: -1 });
NoticeSchema.index({ loanId: 1, createdAt: -1 });
