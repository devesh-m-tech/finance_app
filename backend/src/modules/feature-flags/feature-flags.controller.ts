import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureFlagsService } from './feature-flags.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('FeatureFlags')
@ApiBearerAuth()
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly flagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all feature flags' })
  @RequirePermission('settings:manage')
  async getAllFlags() {
    const data = await this.flagsService.getAllFlags();
    return { success: true, data };
  }

  @Put(':flagKey')
  @ApiOperation({ summary: 'Toggle feature flag (Super Admin only)' })
  @RequirePermission('settings:manage')
  async setFlag(
    @Param('flagKey') flagKey: string,
    @Body('isEnabled') isEnabled: boolean,
    @Body('value') value?: string
  ) {
    const data = await this.flagsService.setFlag(flagKey, isEnabled, value);
    return { success: true, data };
  }
}
