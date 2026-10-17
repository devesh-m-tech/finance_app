import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'permission_audit', timestamps: { createdAt: true, updatedAt: false } })
export class PermissionAudit extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'ANONYMOUS', index: true })
  username: string;

  @Prop({ required: true, index: true })
  route: string;

  @Prop({ required: true, index: true })
  requiredPermission: string;

  @Prop({ required: true })
  denialReason: string;

  @Prop({ default: '' })
  ipAddress?: string;

  @Prop({ default: '' })
  deviceId?: string;
}

export const PermissionAuditSchema = SchemaFactory.createForClass(PermissionAudit);
PermissionAuditSchema.index({ userId: 1, createdAt: -1 });
