import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChecklistsService } from './checklists.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Checklists')
@ApiBearerAuth()
@Controller('checklists')
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all document checklist templates' })
  @RequirePermission('dashboard:own')
  async getAllTemplates() {
    const data = await this.checklistsService.getAllTemplates();
    return { success: true, data };
  }

  @Get(':loanType')
  @ApiOperation({ summary: 'Get document checklist for a loan product' })
  @RequirePermission('dashboard:own')
  async getTemplate(@Param('loanType') loanType: string) {
    const data = await this.checklistsService.getTemplate(loanType);
    return { success: true, data };
  }

  @Put(':loanType')
  @ApiOperation({ summary: 'Save or update checklist template (Super Admin only)' })
  @RequirePermission('settings:manage')
  async saveTemplate(
    @Param('loanType') loanType: string,
    @Body() dto: any
  ) {
    const data = await this.checklistsService.saveTemplate(loanType, dto);
    return { success: true, data };
  }
}
