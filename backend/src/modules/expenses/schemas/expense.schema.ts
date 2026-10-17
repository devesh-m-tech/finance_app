import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true, collection: 'expenses' })
export class Expense {
  @Prop({ required: true, unique: true, index: true })
  expenseCode: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId;

  @Prop({ required: true, index: true })
  category: string; // 'RENT', 'UTILITIES', 'TRAVEL', 'PRINTING', 'STATIONERY', 'STAFF_WELFARE', 'SALARY', 'MISC'

  @Prop({ required: true })
  amountPaise: number;

  @Prop({ required: true, enum: ['CASH', 'BANK_TRANSFER', 'UPI'], default: 'CASH' })
  paymentMode: string;

  @Prop({ required: true, index: true })
  expenseDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  spentBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy?: Types.ObjectId;

  @Prop({ default: '' })
  receiptUrl?: string;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.plugin(softDeletePlugin);

ExpenseSchema.index({ branchId: 1, expenseDate: -1 });
ExpenseSchema.index({ category: 1, expenseDate: -1 });
