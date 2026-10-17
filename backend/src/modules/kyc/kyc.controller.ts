import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KycAdapter } from '../../integrations/kyc/kyc.adapter';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('KYC')
@ApiBearerAuth()
@Controller('kyc')
export class KycController {
  constructor(private readonly kycAdapter: KycAdapter) {}

  @Post('verify-pan')
  @RequirePermission('kyc:run')
  @ApiOperation({ summary: 'Verify PAN format and official registry match' })
  async verifyPan(@Body('pan') pan: string, @Body('claimedName') claimedName: string) {
    return this.kycAdapter.verifyPan(pan, claimedName || 'Customer Name');
  }

  @Post('verify-aadhaar')
  @RequirePermission('kyc:run')
  @ApiOperation({ summary: 'Verify Aadhaar Verhoeff checksum and initiate e-KYC' })
  async verifyAadhaar(@Body('aadhaar') aadhaar: string) {
    return this.kycAdapter.verifyAadhaar(aadhaar);
  }
}
