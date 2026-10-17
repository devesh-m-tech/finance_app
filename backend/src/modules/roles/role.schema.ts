import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'roles', timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true, enum: ['SUPER_ADMIN', 'MANAGER', 'SALESPERSON'] })
  name: string;

  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
