import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false })
export class ChecklistItem {
  @Prop({ required: true })
  itemKey: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: true })
  isMandatory: boolean;

  @Prop({ type: [String], default: ['image/jpeg', 'image/png', 'application/pdf'] })
  allowedFileTypes: string[];

  @Prop({ default: 10 })
  maxSizeMb: number;

  @Prop({ type: [String], default: ['SUPER_ADMIN', 'MANAGER'] })
  verifiedByRoles: string[];

  @Prop({ default: false })
  trackExpiry: boolean;
}

@Schema({ collection: 'document_checklist_templates', timestamps: true })
export class ChecklistTemplate extends Document {
  @Prop({ required: true, unique: true, index: true })
  loanType: string; // daily, weekly, monthly, two_wheeler, four_wheeler, metal

  @Prop({ required: true })
  title: string;

  @Prop({ type: [ChecklistItem], default: [] })
  items: ChecklistItem[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ChecklistTemplateSchema = SchemaFactory.createForClass(ChecklistTemplate);
