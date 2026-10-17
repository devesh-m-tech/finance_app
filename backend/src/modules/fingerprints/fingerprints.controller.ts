import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FingerprintAdapter } from '../../integrations/fingerprint/fingerprint.adapter';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Fingerprints')
@ApiBearerAuth()
@Controller('fingerprints')
export class FingerprintsController {
  constructor(private readonly fingerprintAdapter: FingerprintAdapter) {}

  @Post('verify')
  @RequirePermission('fingerprints:verify')
  @ApiOperation({ summary: 'Compare live biometric capture against customer ISO template' })
  async verifyFingerprint(
    @Body('capturedTemplate') capturedTemplate: string,
    @Body('storedTemplate') storedTemplate: string,
    @Body('deviceModel') deviceModel?: string
  ) {
    return this.fingerprintAdapter.matchTemplates(capturedTemplate, storedTemplate, deviceModel);
  }
}
