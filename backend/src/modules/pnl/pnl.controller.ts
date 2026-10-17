import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PnlService } from './pnl.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Profit & Loss')
@ApiBearerAuth()
@Controller('pnl')
export class PnlController {
  constructor(private readonly pnlService: PnlService) {}

  @Get()
  @RequirePermission('pnl:read')
  @ApiOperation({ summary: 'Get monthly or custom period Profit & Loss statement' })
  getPnl(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const branchId = user.roles?.includes('SUPER_ADMIN') ? undefined : user.branchId;
    return this.pnlService.calculatePnl(startDate, endDate, branchId);
  }
}
