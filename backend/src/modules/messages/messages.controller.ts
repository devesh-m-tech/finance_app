import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SmsAdapter } from '../../integrations/sms/sms.adapter';
import { WhatsAppAdapter } from '../../integrations/whatsapp/whatsapp.adapter';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly smsAdapter: SmsAdapter,
    private readonly whatsappAdapter: WhatsAppAdapter,
  ) {}

  @Post('sms')
  @RequirePermission('messages:manage')
  @ApiOperation({ summary: 'Send transaction or alert SMS' })
  sendSms(@Body() body: any) {
    return this.smsAdapter.sendPaymentReceiptSms(body);
  }

  @Post('whatsapp')
  @RequirePermission('messages:manage')
  @ApiOperation({ summary: 'Send receipt or reminder via WhatsApp' })
  sendWhatsApp(@Body() body: any) {
    return this.whatsappAdapter.sendReceiptMessage(body);
  }
}
