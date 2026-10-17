import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Backup & Disaster Recovery')
@ApiBearerAuth()
@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('run')
  @RequirePermission('backup:run') // Super Admin exclusive
  @ApiOperation({ summary: 'Execute manual database backup archive' })
  triggerBackup() {
    return this.backupService.triggerBackup();
  }

  @Get('status')
  @RequirePermission('backup:run')
  @ApiOperation({ summary: 'Get backup health and retention status' })
  getBackupStatus() {
    return this.backupService.getBackupStatus();
  }
}
