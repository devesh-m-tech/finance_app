import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, PushNotificationPayload } from './notifications.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push')
  @RequirePermission('messages:manage')
  @ApiOperation({ summary: 'Dispatch FCM push notification to agent device' })
  sendPush(@Body() payload: PushNotificationPayload) {
    return this.notificationsService.sendPushNotification(payload);
  }
}
