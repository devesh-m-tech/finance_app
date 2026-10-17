import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('me/permissions')
  @ApiOperation({ summary: 'Get current user effective permissions and active restrictions' })
  @RequirePermission('dashboard:own')
  async getMyPermissions(@CurrentUser() user: AuthenticatedUser) {
    const effective = await this.permissionsService.getEffectivePermissions(
      user.role,
      user.userId
    );
    return {
      success: true,
      data: effective,
    };
  }

  @Get('permissions')
  @ApiOperation({ summary: 'List all permission catalog keys (Super Admin only)' })
  @RequirePermission('settings:manage')
  getAllPermissions() {
    return {
      success: true,
      data: {
        catalog: this.permissionsService.getCatalog(),
        defaultMatrix: this.permissionsService.getDefaultRoleMatrix(),
      },
    };
  }
}
