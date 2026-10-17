import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../../database/plugins/soft-delete.plugin';

export type CollectionVisitDocument = CollectionVisit & Document;

export enum VisitOutcome {
  COLLECTED = 'COLLECTED',
  PTP = 'PTP', // Promise to Pay
  CUSTOMER_ABSENT = 'CUSTOMER_ABSENT',
  REFUSED = 'REFUSED',
  DOOR_LOCKED = 'DOOR_LOCKED',
}

@Schema({ _id: false })
export class VisitGps {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: 0 })
  accuracy: number;
}

@Schema({ timestamps: true, collection: 'collection_visits' })
export class CollectionVisit {
  @Prop({ required: true, unique: true, index: true })
  visitCode: string;

  @Prop({ type: Types.ObjectId, ref: 'Loan', required: true, index: true })
  loanId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  agentId: Types.ObjectId;

  @Prop({ default: 'ROUTE-001', index: true })
  routeId: string;

  @Prop({ required: true, enum: VisitOutcome, index: true })
  outcome: VisitOutcome;

  @Prop({ default: null })
  ptpDate?: Date;

  @Prop({ default: 0 })
  ptpAmountPaise: number;

  @Prop({ default: 0 })
  collectedAmountPaise: number;

  @Prop({ type: VisitGps, required: true })
  gpsLocation: VisitGps;

  @Prop({ default: '' })
  notes?: string;

  @Prop({ default: Date.now, index: true })
  visitTimestamp: Date;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const CollectionVisitSchema = SchemaFactory.createForClass(CollectionVisit);
CollectionVisitSchema.plugin(softDeletePlugin);

CollectionVisitSchema.index({ agentId: 1, visitTimestamp: -1 });
CollectionVisitSchema.index({ routeId: 1, visitTimestamp: -1 });
