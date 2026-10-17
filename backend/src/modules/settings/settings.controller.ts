import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('branding')
  @ApiOperation({ summary: 'Get current branding and visual tokens for app and PDFs' })
  async getBranding() {
    const data = await this.settingsService.getBranding();
    return { success: true, data };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  @RequirePermission('settings:manage')
  async getSetting(@Param('key') key: string) {
    const data = await this.settingsService.getSetting(key);
    return { success: true, data };
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update system setting (Super Admin only)' })
  @RequirePermission('settings:manage')
  async setSetting(@Param('key') key: string, @Body('value') value: any) {
    const data = await this.settingsService.setSetting(key, value);
    return { success: true, data };
  }
}
