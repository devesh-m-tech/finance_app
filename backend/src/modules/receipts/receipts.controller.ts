import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Receipts')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  @RequirePermission('receipts:read')
  @ApiOperation({ summary: 'List customer payment receipts' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('customerId') customerId?: string,
    @Query('loanId') loanId?: string
  ) {
    return this.receiptsService.findAll(user, { page, limit, customerId, loanId });
  }

  @Get(':id')
  @RequirePermission('receipts:read')
  @ApiOperation({ summary: 'Get single receipt details' })
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Get(':id/print')
  @RequirePermission('receipts:reprint')
  @ApiOperation({ summary: 'Get ESC/POS byte sequence and text payload for 58mm printer' })
  getPrintPayload(@Param('id') id: string) {
    return this.receiptsService.getPrintPayload(id);
  }

  @Post(':id/cancel')
  @RequirePermission('receipts:cancel')
  @ApiOperation({ summary: 'Cancel receipt and issue cancellation record' })
  cancelReceipt(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any
  ) {
    return this.receiptsService.cancelReceipt(id, reason, user);
  }
}
