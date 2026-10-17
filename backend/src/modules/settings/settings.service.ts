import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from './setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<Setting>) {}

  async getSetting(key: string, defaultValue?: any): Promise<any> {
    const doc = await this.settingModel.findOne({ key }).exec();
    return doc ? doc.value : defaultValue;
  }

  async setSetting(key: string, value: any, description = ''): Promise<Setting> {
    return this.settingModel.findOneAndUpdate(
      { key },
      { key, value, description },
      { upsert: true, new: true }
    );
  }

  async getBranding() {
    const branding = await this.getSetting('branding', {
      companyName: 'SHRI AMUDHA SMALL FINANCE',
      tagline: 'Trusted Loan Management System',
      primaryHex: '#FFC107',
      primaryDarkHex: '#E0A800',
      address: '124 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu - 641012',
      phone: '+91 98765 43210',
      noGstDefault: true,
      logoUrl: '',
    });
    return branding;
  }
}
