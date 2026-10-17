import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'List recent system audit activity' })
  @RequirePermission('audit:read')
  async listLogs(@Query('entityType') entityType?: string, @Query('limit') limit?: number) {
    const data = await this.auditService.listAuditLogs(limit ? Number(limit) : 50, entityType);
    return { success: true, data };
  }

  @Get('denials')
  @ApiOperation({ summary: 'List unauthorized permission denial attempts (Super Admin only)' })
  @RequirePermission('audit:read')
  async listDenials(@Query('limit') limit?: number) {
    const data = await this.auditService.listPermissionDenials(limit ? Number(limit) : 50);
    return { success: true, data };
  }
}
