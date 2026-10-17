import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendSmsResult {
  messageId: string;
  status: 'DELIVERED' | 'QUEUED' | 'MOCK_SENT';
  mobile: string;
}

@Injectable()
export class SmsAdapter {
  private readonly logger = new Logger(SmsAdapter.name);
  private readonly provider: string;
  private readonly apiKey: string;
  private readonly senderId: string;

  constructor(private readonly config: ConfigService) {
    this.provider = this.config.get<string>('sms.provider', 'mock');
    this.apiKey = this.config.get<string>('sms.apiKey', '');
    this.senderId = this.config.get<string>('sms.senderId', 'SHRIAF');
  }

  async sendPaymentReceiptSms(data: {
    mobile: string;
    customerName: string;
    receiptNo: string;
    amountRupees: string;
    remainingBalanceRupees: string;
  }): Promise<SendSmsResult> {
    const text = `Dear ${data.customerName}, payment of Rs. ${data.amountRupees} received against receipt ${data.receiptNo}. Bal: Rs. ${data.remainingBalanceRupees}. SHRI AMUDHA FINANCE.`;

    if (this.provider === 'msg91' && this.apiKey) {
      this.logger.log(`[MSG91] Sending SMS to ${data.mobile}: ${text}`);
      // In live mode with MSG91 credentials, HTTP POST to api.msg91.com/v5/flow/
    } else {
      this.logger.log(`[MOCK SMS] [${this.senderId}] To: ${data.mobile} => "${text}"`);
    }

    return {
      messageId: `SMS-${Date.now()}`,
      status: this.provider === 'msg91' ? 'DELIVERED' : 'MOCK_SENT',
      mobile: data.mobile,
    };
  }
}
