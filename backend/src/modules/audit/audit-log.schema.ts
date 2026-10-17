import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'audit_logs', timestamps: { createdAt: true, updatedAt: false } })
export class AuditLog extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ required: false, index: true })
  entityId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  beforeState?: any;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  afterState?: any;

  @Prop({ default: '' })
  ipAddress?: string;

  @Prop({ default: '' })
  userAgent?: string;

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

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
