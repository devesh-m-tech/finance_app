import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendWhatsAppResult {
  messageId: string;
  recipientMobile: string;
  status: 'SENT' | 'MOCK_SENT';
}

@Injectable()
export class WhatsAppAdapter {
  private readonly logger = new Logger(WhatsAppAdapter.name);
  private readonly provider: string;
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(private readonly config: ConfigService) {
    this.provider = this.config.get<string>('whatsapp.provider', 'mock');
    this.apiUrl = this.config.get<string>('whatsapp.apiUrl', '');
    this.token = this.config.get<string>('whatsapp.token', '');
  }

  async sendReceiptMessage(data: {
    mobile: string;
    customerName: string;
    receiptNo: string;
    amountRupees: string;
    remainingBalanceRupees: string;
    thermalText: string;
  }): Promise<SendWhatsAppResult> {
    const formattedPhone = data.mobile.startsWith('+91')
      ? data.mobile
      : `+91${data.mobile.replace(/\D/g, '').slice(-10)}`;

    if (this.provider === 'meta' && this.token) {
      this.logger.log(`[WhatsApp Cloud API] Sending message template to ${formattedPhone}`);
      // In live mode with Meta token: POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
    } else {
      this.logger.log(`[MOCK WHATSAPP] To: ${formattedPhone}`);
      this.logger.log(`[MOCK WHATSAPP PAYLOAD]\n${data.thermalText}`);
    }

    return {
      messageId: `WA-${Date.now()}`,
      recipientMobile: formattedPhone,
      status: this.provider === 'meta' ? 'SENT' : 'MOCK_SENT',
    };
  }
}
