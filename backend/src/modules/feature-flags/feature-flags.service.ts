import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeatureFlag } from './feature-flag.schema';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectModel(FeatureFlag.name)
    private flagModel: Model<FeatureFlag>
  ) {}

  async getAllFlags(): Promise<FeatureFlag[]> {
    return this.flagModel.find().exec();
  }

  async isEnabled(flagKey: string, defaultValue = false): Promise<boolean> {
    const flag = await this.flagModel.findOne({ flagKey }).exec();
    return flag ? flag.isEnabled : defaultValue;
  }

  async setFlag(flagKey: string, isEnabled: boolean, value?: string, description = ''): Promise<FeatureFlag> {
    return this.flagModel.findOneAndUpdate(
      { flagKey },
      { flagKey, isEnabled, value, description },
      { upsert: true, new: true }
    );
  }
}
