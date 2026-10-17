import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MasterData } from './master-data.schema';
import { MetalRate } from './metal-rate.schema';

export interface PublishRateDto {
  metal: 'GOLD' | 'SILVER';
  purity: string;
  ratePerGramRupees: number;
  effectiveDate?: string;
}

@Injectable()
export class MastersService {
  constructor(
    @InjectModel(MasterData.name) private masterModel: Model<MasterData>,
    @InjectModel(MetalRate.name) private rateModel: Model<MetalRate>
  ) {}

  async getByCategory(category: string): Promise<MasterData[]> {
    return this.masterModel
      .find({ category, isActive: true })
      .sort({ sortOrder: 1, code: 1 })
      .exec();
  }

  async saveMasterItem(category: string, code: string, dto: any): Promise<MasterData> {
    return this.masterModel.findOneAndUpdate(
      { category, code },
      {
        category,
        code,
        label: dto.label,
        labelTamil: dto.labelTamil || '',
        metadata: dto.metadata || {},
        sortOrder: dto.sortOrder || 0,
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }

  async getLatestRates(): Promise<MetalRate[]> {
    const today = new Date().toISOString().split('T')[0];

    // Get the most recent rate for each metal + purity
    const distinctPurities = await this.rateModel.aggregate([
      { $sort: { effectiveDate: -1, createdAt: -1 } },
      {
        $group: {
          _id: { metal: '$metal', purity: '$purity' },
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { metal: 1, purity: 1 } },
    ]);

    return distinctPurities;
  }

  async publishRate(dto: PublishRateDto, userId: string): Promise<MetalRate> {
    const effectiveDate = dto.effectiveDate || new Date().toISOString().split('T')[0];
    const ratePerGramPaise = Math.round(dto.ratePerGramRupees * 100);

    return this.rateModel.findOneAndUpdate(
      {
        metal: dto.metal,
        purity: dto.purity,
        effectiveDate,
      },
      {
        metal: dto.metal,
        purity: dto.purity,
        ratePerGramPaise,
        effectiveDate,
        updatedBy: userId,
      },
      { upsert: true, new: true }
    );
  }

  async getRateHistory(metal: 'GOLD' | 'SILVER', limitDays = 30): Promise<MetalRate[]> {
    return this.rateModel
      .find({ metal })
      .sort({ effectiveDate: -1 })
      .limit(limitDays)
      .exec();
  }
}
