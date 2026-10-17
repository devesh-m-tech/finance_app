import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CronService } from './cron.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Cron & Automation')
@ApiBearerAuth()
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('run-overdue')
  @RequirePermission('backup:run') // Restricted to Super Admin
  @ApiOperation({ summary: 'Trigger daily overdue scan and penalty accrual manually' })
  runDailyOverdue() {
    return this.cronService.processDailyOverdueAndPenalties();
  }
}
