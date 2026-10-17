import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @RequirePermission('expenses:manage')
  @ApiOperation({ summary: 'Record a branch operational expense' })
  @ApiResponse({ status: 201, description: 'Expense recorded successfully' })
  create(@Body() dto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.create(dto, user);
  }

  @Get()
  @RequirePermission('expenses:manage')
  @ApiOperation({ summary: 'List branch expenses with filters' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('month') month?: string
  ) {
    return this.expensesService.findAll(user, { page, limit, category, month });
  }

  @Get(':id')
  @RequirePermission('expenses:manage')
  @ApiOperation({ summary: 'Get single expense voucher' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }
}
