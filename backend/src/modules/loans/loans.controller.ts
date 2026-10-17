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
import { LoansService } from './loans.service';
import { CreateLoanDto, PreviewLoanDto, ApproveLoanDto } from './dto/create-loan.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Loans')
@ApiBearerAuth()
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Calculate loan schedule and repayment preview' })
  preview(@Body() dto: PreviewLoanDto) {
    return this.loansService.preview(dto);
  }

  @Post()
  @RequirePermission('loans.daily:create')
  @ApiOperation({ summary: 'Create a new loan application' })
  @ApiResponse({ status: 201, description: 'Loan application created' })
  create(@Body() dto: CreateLoanDto, @CurrentUser() user: any) {
    return this.loansService.create(dto, user);
  }

  @Get()
  @RequirePermission('loans.daily:read')
  @ApiOperation({ summary: 'List loans directory' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('routeId') routeId?: string,
    @Query('search') search?: string
  ) {
    return this.loansService.findAll(user, { page, limit, status, routeId, search });
  }

  @Get(':id')
  @RequirePermission('loans.daily:read')
  @ApiOperation({ summary: 'Get full loan details and repayment schedule' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.loansService.findOne(id, user);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('loans.daily:approve')
  @ApiOperation({ summary: 'Approve a loan application (Maker-Checker enforced)' })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveLoanDto,
    @CurrentUser() user: any
  ) {
    return this.loansService.approve(id, dto, user);
  }

  @Post(':id/disburse')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('loans.daily:disburse')
  @ApiOperation({ summary: 'Disburse an approved loan and activate repayment schedule' })
  disburse(@Param('id') id: string, @CurrentUser() user: any) {
    return this.loansService.disburse(id, user);
  }
}
