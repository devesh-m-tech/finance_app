import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type PaymentDocument = Payment & Document;

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

@Schema({ _id: false })
export class GpsCoordinate {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: 0 })
  accuracy: number;
}

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ required: true, unique: true, index: true })
  paymentCode: string;

  @Prop({ required: true, unique: true, index: true })
  receiptNo: string;

  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true, index: true })
  loanId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId;

  @Prop({ default: 'ROUTE-001', index: true })
  assignedRouteId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  collectedBy: Types.ObjectId;

  @Prop({ required: true })
  amountPaise: number;

  @Prop({ default: 0 })
  penaltyPaidPaise: number;

  @Prop({ default: 0 })
  interestPaidPaise: number;

  @Prop({ default: 0 })
  principalPaidPaise: number;

  @Prop({ default: 0 })
  advancePaidPaise: number;

  @Prop({ required: true, enum: PaymentMode, default: PaymentMode.CASH })
  paymentMode: PaymentMode;

  @Prop({ default: Date.now, index: true })
  paymentDate: Date;

  @Prop({ type: GpsCoordinate, default: null })
  gpsLocation?: GpsCoordinate;

  @Prop({ enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED', index: true })
  status: string;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ default: '' })
  receiptThermalPayload: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.plugin(softDeletePlugin);

PaymentSchema.index({ collectedBy: 1, paymentDate: 1 });
PaymentSchema.index({ branchId: 1, paymentDate: 1 });
PaymentSchema.index({ loanId: 1, paymentDate: 1 });
