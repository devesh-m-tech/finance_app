import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService, SyncPushPayload } from './sync.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Offline Sync')
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('pull')
  @RequirePermission('collections:collect')
  @ApiOperation({ summary: 'Pull delta updates since timestamp for offline SQLite cache' })
  pull(@Query('since') since: string, @CurrentUser() user: any) {
    return this.syncService.pull(since, user);
  }

  @Post('push')
  @RequirePermission('collections:collect')
  @ApiOperation({ summary: 'Batch push offline collection payments and field visits' })
  push(@Body() payload: SyncPushPayload, @CurrentUser() user: any) {
    return this.syncService.push(payload, user);
  }
}
