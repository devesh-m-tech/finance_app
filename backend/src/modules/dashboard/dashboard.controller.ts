import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('portfolio')
  @RequirePermission('dashboard:portfolio')
  @ApiOperation({ summary: 'Company-wide active loan portfolio and metrics' })
  getPortfolioMetrics() {
    return this.dashboardService.getPortfolioMetrics();
  }

  @Get('own')
  @RequirePermission('dashboard:own')
  @ApiOperation({ summary: "Field agent's personal summary and daily performance" })
  getPersonalSummary(@CurrentUser() user: any) {
    return this.dashboardService.getPersonalSummary(user);
  }
}
