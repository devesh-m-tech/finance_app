import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormDefinition } from './form-definition.schema';
import { CryptoUtil } from '../../common/utils/crypto';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(FormDefinition.name)
    private formModel: Model<FormDefinition>
  ) {}

  async getForm(formKey: string, userRole?: string): Promise<FormDefinition> {
    const form = await this.formModel.findOne({ formKey, isActive: true }).exec();
    if (!form) {
      throw new NotFoundException(`Form definition for '${formKey}' not found`);
    }

    if (!userRole) return form;

    // Filter fields based on role visibility
    const filteredSteps = form.steps.map((step) => ({
      ...step,
      fields: step.fields.filter((field: any) => {
        if (!field.visibleToRoles || field.visibleToRoles.length === 0) return true;
        return field.visibleToRoles.includes(userRole);
      }),
    }));

    return {
      ...form.toObject(),
      steps: filteredSteps,
    } as any;
  }

  async saveForm(formKey: string, dto: any): Promise<FormDefinition> {
    const existing = await this.formModel.findOne({ formKey }).exec();
    const version = existing ? existing.version + 1 : 1;

    return this.formModel.findOneAndUpdate(
      { formKey },
      {
        formKey,
        title: dto.title || formKey,
        version,
        steps: dto.steps || [],
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Server-side validation of submitted form data against the dynamic schema.
   */
  async validateSubmission(formKey: string, data: Record<string, any>): Promise<void> {
    const form = await this.getForm(formKey);
    const errors: string[] = [];

    for (const step of form.steps) {
      for (const field of step.fields) {
        const val = data[field.name];
        const v = field.validation;

        if (v?.required && (val === undefined || val === null || val === '')) {
          errors.push(`Field '${field.label}' is required`);
          continue;
        }

        if (val !== undefined && val !== null && val !== '') {
          // Aadhaar Verhoeff Validation
          if (v?.isAadhaar) {
            const clean = String(val).replace(/\D/g, '');
            if (clean.length !== 12 || !CryptoUtil.validateAadhaarVerhoeff(clean)) {
              errors.push(`Invalid Aadhaar number for '${field.label}': Verhoeff checksum failed`);
            }
          }

          // PAN Validation
          if (v?.isPan) {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(String(val).trim().toUpperCase())) {
              errors.push(`Invalid PAN format for '${field.label}' (Expected e.g. ABCDE1234F)`);
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        code: 'VALIDATION_FAILED',
        message: errors.join('; '),
        errors,
      });
    }
  }
}
