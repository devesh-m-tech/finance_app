import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type LoanDocument = Loan & Document;

export enum LoanType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  TWO_WHEELER = 'TWO_WHEELER',
  FOUR_WHEELER = 'FOUR_WHEELER',
  METAL = 'METAL',
}

export enum LoanStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  OVERDUE = 'OVERDUE',
  DEFAULTED = 'DEFAULTED',
}

@Schema({ _id: false })
export class LoanScheduleItem {
  @Prop({ required: true })
  installmentNo: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  principalDuePaise: number;

  @Prop({ required: true })
  interestDuePaise: number;

  @Prop({ default: 0 })
  penaltyDuePaise: number;

  @Prop({ required: true })
  totalDuePaise: number;

  @Prop({ default: 0 })
  paidPaise: number;

  @Prop({ enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'], default: 'PENDING' })
  status: string;

  @Prop({ default: null })
  paidDate?: Date;
}

@Schema({ _id: false })
export class VehicleCollateral {
  @Prop({ enum: ['TWO_WHEELER', 'FOUR_WHEELER'] })
  vehicleType: string;

  @Prop({ required: true })
  registrationNumber: string;

  @Prop({ default: '' })
  chassisNumber: string;

  @Prop({ default: '' })
  engineNumber: string;

  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ default: 2024 })
  year: number;

  @Prop({ default: 0 })
  exShowroomPricePaise: number;

  @Prop({ default: null })
  insuranceExpiryDate?: Date;

  @Prop({ default: '' })
  rcBookUrl?: string;

  @Prop({ default: 'HYPOTHECATED' })
  hypothecationStatus: string;
}

@Schema({ _id: false })
export class MetalOrnamentItem {
  @Prop({ required: true })
  itemName: string; // e.g. 'Gold Necklace 22K', 'Bangles'

  @Prop({ required: true })
  karatOrPurity: string; // '24K', '22K', '18K', '999', '925'

  @Prop({ required: true })
  grossWeightGrams: number;

  @Prop({ default: 0 })
  stoneWeightGrams: number;

  @Prop({ required: true })
  netWeightGrams: number;

  @Prop({ required: true })
  ratePerGramPaise: number;

  @Prop({ required: true })
  itemValuationPaise: number;
}

@Schema({ _id: false })
export class MetalCollateral {
  @Prop({ required: true, enum: ['GOLD', 'SILVER'] })
  metalType: string;

  @Prop({ type: [MetalOrnamentItem], default: [] })
  ornaments: MetalOrnamentItem[];

  @Prop({ required: true })
  totalGrossGrams: number;

  @Prop({ required: true })
  totalNetGrams: number;

  @Prop({ required: true })
  totalValuationPaise: number;

  @Prop({ required: true })
  ltvPercent: number; // Max 75% for gold as per RBI guidelines

  @Prop({ required: true })
  vaultPacketNumber: string; // e.g. 'PKT-GLD-0042'

  @Prop({ default: 'RACK-A-01' })
  storageRackNumber: string;

  @Prop({ required: true })
  appraiserName: string;

  @Prop({ default: Date.now })
  appraisalDate: Date;

  @Prop({ enum: ['IN_VAULT', 'RELEASED', 'AUCTIONED'], default: 'IN_VAULT' })
  status: string;

  @Prop({ default: null })
  releaseDate?: Date;
}

@Schema({ timestamps: true, collection: 'loans' })
export class Loan {
  @Prop({ required: true, unique: true, index: true })
  loanCode: string;

  @Prop({ required: true, enum: LoanType, index: true })
  loanType: LoanType;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId;

  @Prop({ default: 'ROUTE-001', index: true })
  assignedRouteId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo: Types.ObjectId;

  @Prop({ required: true })
  principalPaise: number;

  @Prop({ required: true })
  interestRatePercent: number;

  @Prop({ required: true })
  tenure: number;

  @Prop({ required: true, enum: ['DAYS', 'WEEKS', 'MONTHS'] })
  tenureUnit: string;

  @Prop({ required: true, enum: ['FLAT', 'REDUCING'] })
  calculationType: string;

  @Prop({ required: true, enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  repaymentFrequency: string;

  @Prop({ required: true })
  totalInterestPaise: number;

  @Prop({ required: true })
  totalPayablePaise: number;

  @Prop({ required: true })
  installmentAmountPaise: number;

  @Prop({ default: null })
  disbursedAt?: Date;

  @Prop({ default: null })
  maturityDate?: Date;

  @Prop({ required: true })
  outstandingPrincipalPaise: number;

  @Prop({ required: true })
  outstandingInterestPaise: number;

  @Prop({ default: 0 })
  outstandingPenaltyPaise: number;

  @Prop({ default: 0 })
  totalPaidPaise: number;

  @Prop({ required: true, enum: LoanStatus, default: LoanStatus.SUBMITTED, index: true })
  status: LoanStatus;

  @Prop({ type: [LoanScheduleItem], default: [] })
  schedule: LoanScheduleItem[];

  @Prop({ type: VehicleCollateral, default: null })
  vehicleCollateral?: VehicleCollateral;

  @Prop({ type: MetalCollateral, default: null })
  metalCollateral?: MetalCollateral;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  approvedAt?: Date;

  @Prop({ default: '' })
  approvalRemarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  disbursedBy?: Types.ObjectId;

  @Prop({ default: 1 })
  rev: number;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
LoanSchema.plugin(softDeletePlugin);

LoanSchema.index({ branchId: 1, status: 1 });
LoanSchema.index({ assignedTo: 1, status: 1 });
LoanSchema.index({ assignedRouteId: 1, status: 1 });
LoanSchema.index({ customerId: 1, status: 1 });
LoanSchema.index({ maturityDate: 1, status: 1 });
