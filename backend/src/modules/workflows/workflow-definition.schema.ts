import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export interface WorkflowTransitionGuard {
  minAmountPaise?: number;
  maxAmountPaise?: number;
  maxLtvPercent?: number;
  minCibilScore?: number;
  requireKycVerified?: boolean;
  requireFingerprint?: boolean;
  requireMandatoryDocsVerified?: boolean;
}

@Schema({ _id: false })
export class WorkflowTransition {
  @Prop({ required: true })
  fromState: string;

  @Prop({ required: true })
  toState: string;

  @Prop({ required: true })
  actionLabel: string;

  @Prop({ type: [String], required: true }) // Roles allowed to trigger transition: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON'
  allowedRoles: string[];

  @Prop({ default: false })
  requireRemark: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  guards: WorkflowTransitionGuard;
}

@Schema({ collection: 'workflow_definitions', timestamps: true })
export class WorkflowDefinition extends Document {
  @Prop({ required: true, unique: true, index: true })
  entityType: string; // e.g., CUSTOMER_ONBOARDING, LOAN_DAILY, LOAN_METAL, PAYMENT, CASH_HANDOVER

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ required: true })
  initialState: string;

  @Prop({ type: [String], required: true })
  states: string[];

  @Prop({ type: [WorkflowTransition], default: [] })
  transitions: WorkflowTransition[];

  @Prop({ default: true })
  isActive: boolean;
}

export const WorkflowDefinitionSchema = SchemaFactory.createForClass(WorkflowDefinition);
