import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('portfolio')
  @RequirePermission('reports:read')
  @ApiOperation({ summary: 'Get overall portfolio health, active loans, and recovery metrics' })
  getPortfolio(@CurrentUser() user: any) {
    const branchId = user.roles?.includes('SUPER_ADMIN') ? undefined : user.branchId;
    return this.reportsService.getPortfolioSummary(branchId);
  }

  @Get('par')
  @RequirePermission('reports:read')
  @ApiOperation({ summary: 'Get Portfolio at Risk (PAR 1-30, 31-60, 61-90, NPA 90+) breakdown' })
  getParReport(@CurrentUser() user: any) {
    const branchId = user.roles?.includes('SUPER_ADMIN') ? undefined : user.branchId;
    return this.reportsService.getParReport(branchId);
  }

  @Get('route-performance')
  @RequirePermission('reports:read')
  @ApiOperation({ summary: 'Get collection recovery efficiency by field route' })
  getRoutePerformance(@CurrentUser() user: any) {
    const branchId = user.roles?.includes('SUPER_ADMIN') ? undefined : user.branchId;
    return this.reportsService.getRoutePerformance(branchId);
  }
}
