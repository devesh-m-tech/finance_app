import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'workflow_instances', timestamps: true })
export class WorkflowInstance extends Document {
  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ required: true, index: true })
  currentState: string;

  @Prop({ required: true, default: 1 })
  definitionVersion: number;

  @Prop({ type: Date, default: null, index: true })
  slaDueAt?: Date;

  @Prop({ default: 0 })
  rev: number; // Optimistic concurrency lock
}

export const WorkflowInstanceSchema = SchemaFactory.createForClass(WorkflowInstance);
WorkflowInstanceSchema.index({ entityType: 1, entityId: 1 }, { unique: true });
