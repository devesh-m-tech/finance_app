import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestrictionsService, SetRestrictionDto } from './restrictions.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Restrictions')
@ApiBearerAuth()
@Controller('restrictions')
export class RestrictionsController {
  constructor(private readonly restrictionsService: RestrictionsService) {}

  @Get(':managerId')
  @ApiOperation({ summary: 'Get active restrictions for a specific manager (Super Admin only)' })
  @RequirePermission('restrictions:manage')
  async getRestrictions(@Param('managerId') managerId: string) {
    const data = await this.restrictionsService.getRestrictions(managerId);
    return { success: true, data };
  }

  @Put(':managerId')
  @ApiOperation({ summary: 'Set or update manager restrictions (Super Admin only)' })
  @RequirePermission('restrictions:manage')
  async setRestrictions(
    @Param('managerId') managerId: string,
    @Body() dto: SetRestrictionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.restrictionsService.setRestrictions(
      managerId,
      dto,
      user.userId
    );
    return { success: true, data };
  }

  @Delete(':managerId')
  @ApiOperation({ summary: 'Remove all restrictions for a manager (Super Admin only)' })
  @RequirePermission('restrictions:manage')
  async removeRestrictions(
    @Param('managerId') managerId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.restrictionsService.removeRestrictions(
      managerId,
      user.userId
    );
    return data;
  }
}
