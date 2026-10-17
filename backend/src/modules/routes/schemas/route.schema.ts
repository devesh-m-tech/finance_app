import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from '../../database/plugins/soft-delete.plugin';

export type RouteDocument = Route & Document;

@Schema({ timestamps: true, collection: 'routes' })
export class Route {
  @Prop({ required: true, unique: true, index: true })
  routeCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  assignedAgentId?: Types.ObjectId;

  @Prop({ required: true })
  area: string;

  @Prop({ type: [String], default: [] })
  pincodes: string[];

  @Prop({ default: 0 })
  activeBorrowersCount: number;

  @Prop({ type: [String], default: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] })
  collectionDays: string[];

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const RouteSchema = SchemaFactory.createForClass(Route);
RouteSchema.plugin(softDeletePlugin);

RouteSchema.index({ branchId: 1, routeCode: 1 });
