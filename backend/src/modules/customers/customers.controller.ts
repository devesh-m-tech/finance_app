import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, VerifyCustomerDto, AddDocumentDto } from './dto/create-customer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermission('customers:create')
  @ApiOperation({ summary: 'Onboard a new customer application' })
  @ApiResponse({ status: 201, description: 'Customer onboarded successfully' })
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.customersService.create(dto, user);
  }

  @Get()
  @RequirePermission('customers:read')
  @ApiOperation({ summary: 'List customer directory with pagination and search' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.customersService.findAll(user, { page, limit, search, status });
  }

  @Get('verification-queue')
  @RequirePermission('documents:verify')
  @ApiOperation({ summary: 'Get pending customer verification queue for managers' })
  async getVerificationQueue(@CurrentUser() user: any) {
    return this.customersService.getVerificationQueue(user);
  }

  @Get(':id')
  @RequirePermission('customers:read')
  @ApiOperation({ summary: 'Get full customer profile by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.findOne(id, user);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('documents:verify')
  @ApiOperation({ summary: 'Approve or reject customer verification (Manager/Admin)' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyCustomerDto,
    @CurrentUser() user: any
  ) {
    return this.customersService.verify(id, dto, user);
  }

  @Post(':id/documents')
  @RequirePermission('documents:upload')
  @ApiOperation({ summary: 'Attach a document/photo to customer' })
  async addDocument(
    @Param('id') id: string,
    @Body() dto: AddDocumentDto,
    @CurrentUser() user: any
  ) {
    return this.customersService.addDocument(id, dto, user);
  }

  @Post(':id/documents/:docType/verify')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('documents:verify')
  @ApiOperation({ summary: 'Verify or reject a specific customer document' })
  async verifyDocument(
    @Param('id') id: string,
    @Param('docType') docType: string,
    @Body('action') action: 'VERIFIED' | 'REJECTED',
    @CurrentUser() user: any,
    @Body('remarks') remarks?: string
  ) {
    return this.customersService.verifyDocument(id, docType, action, user, remarks);
  }
}
