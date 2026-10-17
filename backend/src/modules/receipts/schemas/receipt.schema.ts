import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true, collection: 'receipts' })
export class Receipt {
  @Prop({ required: true, unique: true, index: true })
  receiptNo: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true, index: true })
  paymentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true, index: true })
  loanId: Types.ObjectId;

  @Prop({ required: true, index: true })
  loanCode: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerMobile: string;

  @Prop({ required: true })
  amountPaise: number;

  @Prop({ required: true })
  penaltyPaidPaise: number;

  @Prop({ required: true })
  interestPaidPaise: number;

  @Prop({ required: true })
  principalPaidPaise: number;

  @Prop({ required: true })
  remainingBalancePaise: number;

  @Prop({ required: true })
  paymentMode: string;

  @Prop({ required: true, index: true })
  collectedByName: string;

  @Prop({ default: Date.now })
  issuedAt: Date;

  @Prop({ required: true })
  thermalTextPayload: string;

  @Prop({ default: '' })
  pdfStorageKey?: string;

  @Prop({ default: false, index: true })
  isCancelled: boolean;

  @Prop({ default: '' })
  cancellationReason?: string;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
ReceiptSchema.plugin(softDeletePlugin);

ReceiptSchema.index({ customerId: 1, createdAt: -1 });
ReceiptSchema.index({ loanId: 1, createdAt: -1 });
