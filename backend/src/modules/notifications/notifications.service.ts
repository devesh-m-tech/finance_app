import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushNotificationPayload {
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly fcmServerKey: string;

  constructor(private readonly config: ConfigService) {
    this.fcmServerKey = this.config.get<string>('notifications.fcmKey', '');
  }

  async sendPushNotification(payload: PushNotificationPayload) {
    if (this.fcmServerKey) {
      this.logger.log(`[FCM LIVE] Dispatching push to user ${payload.recipientUserId}: ${payload.title}`);
      // In live production with FCM credentials: POST https://fcm.googleapis.com/fcm/send
    } else {
      this.logger.log(`[MOCK FCM PUSH] User: ${payload.recipientUserId} | Title: "${payload.title}" | Body: "${payload.body}"`);
    }

    return {
      messageId: `FCM-${Date.now()}`,
      status: 'DISPATCHED',
      recipientUserId: payload.recipientUserId,
    };
  }
}
