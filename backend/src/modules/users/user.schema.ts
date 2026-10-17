import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { softDeletePlugin } from '../../database/plugins/soft-delete.plugin';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: null })
  pinHash?: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({
    required: true,
    enum: ['SUPER_ADMIN', 'MANAGER', 'SALESPERSON'],
    index: true,
  })
  role: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Branch', default: null, index: true })
  branchId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: 1 })
  permissionsVersion: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: null })
  lastLoginAt?: Date;

  @Prop({ default: null })
  deviceId?: string;

  @Prop({ default: 1 })
  schemaVersion: number;

  // Soft delete fields provided by plugin
  deletedAt?: Date;
  deletedBy?: MongooseSchema.Types.ObjectId;
  deleteReason?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(softDeletePlugin);
