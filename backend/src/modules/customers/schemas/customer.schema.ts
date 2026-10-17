import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type CustomerDocument = Customer & Document;

export enum CustomerStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: false })
export class Address {
  @Prop({ required: true })
  line1: string;

  @Prop({ default: '' })
  line2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  pincode: string;

  @Prop({ default: '' })
  landmark: string;
}

@Schema({ _id: false })
export class Guarantor {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  relationship: string;

  @Prop({ type: Address, required: true })
  address: Address;

  @Prop({ default: '' })
  maskedAadhaar: string;

  @Prop({ default: '' })
  aadhaarHash: string;
}

@Schema({ _id: false })
export class CustomerDocItem {
  @Prop({ required: true })
  docType: string; // 'AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN', 'PHOTO', 'SIGNATURE', 'RATION_CARD', 'INCOME_PROOF'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  fileKey: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  verifiedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  verifiedAt?: Date;

  @Prop({ default: '' })
  remarks?: string;

  @Prop({ type: Date, default: Date.now })
  uploadedAt: Date;
}

@Schema({ _id: false })
export class BiometricProfile {
  @Prop({ default: '' })
  thumbprintTemplateHash: string;

  @Prop({ default: '' })
  capturedBy: string;

  @Prop({ type: Date, default: null })
  capturedAt?: Date;
}

@Schema({ timestamps: true, collection: 'customers' })
export class Customer {
  @Prop({ required: true, unique: true, index: true })
  customerCode: string;

  @Prop({ required: true, index: true })
  fullName: string;

  @Prop({ required: true, index: true })
  mobile: string;

  @Prop({ required: true })
  dob: string;

  @Prop({ required: true, enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: string;

  @Prop({ type: Address, required: true })
  address: Address;

  @Prop({ default: '', index: true })
  aadhaarHash: string;

  @Prop({ default: '' })
  encryptedAadhaar: string;

  @Prop({ default: '' })
  maskedAadhaar: string;

  @Prop({ default: '', index: true })
  panHash: string;

  @Prop({ default: '' })
  encryptedPan: string;

  @Prop({ default: '' })
  maskedPan: string;

  @Prop({ default: 0 })
  cibilScore: number;

  @Prop({ required: true, enum: CustomerStatus, default: CustomerStatus.SUBMITTED, index: true })
  status: CustomerStatus;

  @Prop({ default: 'ROUTE-001', index: true })
  assignedRouteId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  verifiedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  verifiedAt?: Date;

  @Prop({ default: '' })
  rejectionReason?: string;

  @Prop({ type: Guarantor, default: null })
  guarantor?: Guarantor;

  @Prop({ type: [CustomerDocItem], default: [] })
  documents: CustomerDocItem[];

  @Prop({ type: BiometricProfile, default: null })
  biometrics?: BiometricProfile;

  @Prop({ type: Object, default: {} })
  customFields: Record<string, any>;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: 1 })
  rev: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.plugin(softDeletePlugin);

// Compound indexes for optimal queries
CustomerSchema.index({ branchId: 1, status: 1 });
CustomerSchema.index({ assignedTo: 1, status: 1 });
CustomerSchema.index({ assignedRouteId: 1, status: 1 });
