import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermission('collections:collect')
  @ApiOperation({ summary: 'Record field cash/UPI payment collection (ACID Transaction)' })
  @ApiResponse({ status: 201, description: 'Payment collected and receipt issued' })
  collectPayment(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.collectPayment(dto, user);
  }

  @Get()
  @RequirePermission('payments:read')
  @ApiOperation({ summary: 'List payments collection history' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('loanId') loanId?: string,
    @Query('date') date?: string
  ) {
    return this.paymentsService.findAll(user, { page, limit, loanId, date });
  }

  @Get(':id')
  @RequirePermission('payments:read')
  @ApiOperation({ summary: 'Get single payment transaction details' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentsService.findOne(id, user);
  }
}
