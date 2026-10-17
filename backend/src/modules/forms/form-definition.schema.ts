import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'form_definitions', timestamps: true })
export class FormDefinition extends Document {
  @Prop({ required: true, unique: true, index: true })
  formKey: string; // e.g. customer_onboarding, loan_daily, loan_metal

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: 1 })
  version: number;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  steps: any[]; // Array of FormStepDefinition

  @Prop({ default: true })
  isActive: boolean;
}

export const FormDefinitionSchema = SchemaFactory.createForClass(FormDefinition);
