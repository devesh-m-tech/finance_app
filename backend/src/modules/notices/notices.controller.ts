import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NoticesService } from './notices.service';
import { NoticeType } from './schemas/notice.schema';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Notices')
@ApiBearerAuth()
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post('generate')
  @RequirePermission('notices:manage')
  @ApiOperation({ summary: 'Generate and serve legal overdue recovery notice' })
  generate(
    @Body('loanId') loanId: string,
    @Body('noticeType') noticeType: NoticeType,
    @Body('sentVia') sentVia?: string
  ) {
    return this.noticesService.generateNotice(loanId, noticeType, sentVia);
  }

  @Get()
  @RequirePermission('notices:manage')
  @ApiOperation({ summary: 'List generated legal recovery notices' })
  findAll(@Query('loanId') loanId?: string, @Query('customerId') customerId?: string) {
    return this.noticesService.findAll({ loanId, customerId });
  }
}
