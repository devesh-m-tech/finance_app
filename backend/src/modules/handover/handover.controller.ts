import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { HandoverService } from './handover.service';
import { SubmitHandoverDto, AcceptHandoverDto } from './dto/submit-handover.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Cash Handover')
@ApiBearerAuth()
@Controller('handover')
export class HandoverController {
  constructor(private readonly handoverService: HandoverService) {}

  @Get('summary')
  @RequirePermission('handover:submit')
  @ApiOperation({ summary: "Get current agent's cash/UPI collection totals for today" })
  getTodaySummary(@CurrentUser() user: any) {
    return this.handoverService.getTodaySummary(user);
  }

  @Post('submit')
  @RequirePermission('handover:submit')
  @ApiOperation({ summary: 'Submit end-of-day cash handover with denomination breakdown' })
  @ApiResponse({ status: 201, description: 'Cash handover submitted' })
  submit(@Body() dto: SubmitHandoverDto, @CurrentUser() user: any) {
    return this.handoverService.submit(dto, user);
  }

  @Get()
  @RequirePermission('handover:accept')
  @ApiOperation({ summary: 'List cash handovers for manager verification' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string
  ) {
    return this.handoverService.findAll(user, { page, limit, status });
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('handover:accept')
  @ApiOperation({ summary: 'Accept and verify agent cash handover' })
  accept(
    @Param('id') id: string,
    @Body() dto: AcceptHandoverDto,
    @CurrentUser() user: any
  ) {
    return this.handoverService.accept(id, dto, user);
  }
}
