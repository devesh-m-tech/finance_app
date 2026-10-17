import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MastersService, PublishRateDto } from './masters.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Masters')
@ApiBearerAuth()
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get('rates/latest')
  @ApiOperation({ summary: 'Get current daily gold and silver rates' })
  @RequirePermission('dashboard:own')
  async getLatestRates() {
    const data = await this.mastersService.getLatestRates();
    return { success: true, data };
  }

  @Post('rates')
  @ApiOperation({ summary: 'Publish new daily gold / silver rate' })
  @RequirePermission('rates:manage')
  async publishRate(
    @Body() dto: PublishRateDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.mastersService.publishRate(dto, user.userId);
    return { success: true, data };
  }

  @Get('rates/history')
  @ApiOperation({ summary: 'Get metal rate history for trend charts' })
  @RequirePermission('dashboard:own')
  async getRateHistory(@Query('metal') metal: 'GOLD' | 'SILVER') {
    const data = await this.mastersService.getRateHistory(metal || 'GOLD');
    return { success: true, data };
  }

  @Get(':category')
  @ApiOperation({ summary: 'Get master options by category' })
  @RequirePermission('dashboard:own')
  async getByCategory(@Param('category') category: string) {
    const data = await this.mastersService.getByCategory(category);
    return { success: true, data };
  }

  @Put(':category/:code')
  @ApiOperation({ summary: 'Save or update master option item' })
  @RequirePermission('masters:manage')
  async saveMasterItem(
    @Param('category') category: string,
    @Param('code') code: string,
    @Body() dto: any
  ) {
    const data = await this.mastersService.saveMasterItem(category, code, dto);
    return { success: true, data };
  }
}
