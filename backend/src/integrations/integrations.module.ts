import { Module, Global } from '@nestjs/common';
import { CibilAdapter } from './cibil/cibil.adapter';
import { KycAdapter } from './kyc/kyc.adapter';
import { SmsAdapter } from './sms/sms.adapter';
import { WhatsAppAdapter } from './whatsapp/whatsapp.adapter';
import { FingerprintAdapter } from './fingerprint/fingerprint.adapter';

@Global()
@Module({
  providers: [
    CibilAdapter,
    KycAdapter,
    SmsAdapter,
    WhatsAppAdapter,
    FingerprintAdapter,
  ],
  exports: [
    CibilAdapter,
    KycAdapter,
    SmsAdapter,
    WhatsAppAdapter,
    FingerprintAdapter,
  ],
})
export class IntegrationsModule {}
