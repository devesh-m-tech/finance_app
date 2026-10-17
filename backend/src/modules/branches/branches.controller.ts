import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService, CreateBranchDto } from './branches.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new branch (Super Admin only)' })
  @RequirePermission('settings:manage')
  async createBranch(@Body() dto: CreateBranchDto) {
    const data = await this.branchesService.createBranch(dto);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List all active branches' })
  @RequirePermission('dashboard:own')
  async listBranches() {
    const data = await this.branchesService.listBranches();
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  @RequirePermission('dashboard:own')
  async getBranch(@Param('id') id: string) {
    const data = await this.branchesService.getBranchById(id);
    return { success: true, data };
  }
}
