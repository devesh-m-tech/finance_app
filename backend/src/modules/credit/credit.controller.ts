import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CibilAdapter } from '../../integrations/cibil/cibil.adapter';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Credit')
@ApiBearerAuth()
@Controller('credit')
export class CreditController {
  constructor(private readonly cibilAdapter: CibilAdapter) {}

  @Post('cibil')
  @RequirePermission('credit:run')
  @ApiOperation({ summary: 'Pull CIBIL credit score and report' })
  async pullScore(@Body('panOrAadhaar') panOrAadhaar: string, @Body('mobile') mobile: string) {
    return this.cibilAdapter.pullCreditScore(panOrAadhaar || 'ABCDE1234F', mobile || '9876543210');
  }
}
