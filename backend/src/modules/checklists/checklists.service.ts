import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChecklistTemplate } from './checklist-template.schema';

@Injectable()
export class ChecklistsService {
  constructor(
    @InjectModel(ChecklistTemplate.name)
    private templateModel: Model<ChecklistTemplate>
  ) {}

  async getTemplate(loanType: string): Promise<ChecklistTemplate> {
    const template = await this.templateModel.findOne({ loanType, isActive: true }).exec();
    if (!template) {
      throw new NotFoundException(`Document checklist template for '${loanType}' not found`);
    }
    return template;
  }

  async getAllTemplates(): Promise<ChecklistTemplate[]> {
    return this.templateModel.find({ isActive: true }).exec();
  }

  async saveTemplate(loanType: string, dto: any): Promise<ChecklistTemplate> {
    return this.templateModel.findOneAndUpdate(
      { loanType },
      {
        loanType,
        title: dto.title || `${loanType.toUpperCase()} Document Checklist`,
        items: dto.items || [],
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }
}
