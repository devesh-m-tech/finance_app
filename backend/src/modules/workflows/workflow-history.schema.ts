import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'workflow_history', timestamps: { createdAt: true, updatedAt: false } })
export class WorkflowHistory extends Document {
  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ required: true })
  fromState: string;

  @Prop({ required: true })
  toState: string;

  @Prop({ required: true })
  actionLabel: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  performedBy: MongooseSchema.Types.ObjectId;

  @Prop({ default: '' })
  remark: string;

  @Prop({ default: '' })
  deviceId?: string;

  @Prop({
    type: {
      lat: Number,
      lng: Number,
    },
    default: null,
  })
  gpsCoordinates?: {
    lat: number;
    lng: number;
  };
}

export const WorkflowHistorySchema = SchemaFactory.createForClass(WorkflowHistory);
WorkflowHistorySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
