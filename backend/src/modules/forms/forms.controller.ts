import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Forms')
@ApiBearerAuth()
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get(':formKey')
  @ApiOperation({ summary: 'Get dynamic form definition filtered by user role' })
  @RequirePermission('dashboard:own')
  async getForm(
    @Param('formKey') formKey: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.formsService.getForm(formKey, user?.role);
    return { success: true, data };
  }

  @Put(':formKey')
  @ApiOperation({ summary: 'Save or update dynamic form schema (Super Admin only)' })
  @RequirePermission('forms:manage')
  async saveForm(
    @Param('formKey') formKey: string,
    @Body() dto: any
  ) {
    const data = await this.formsService.saveForm(formKey, dto);
    return { success: true, data };
  }
}
