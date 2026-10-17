import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @RequirePermission('collections:assign')
  @ApiOperation({ summary: 'List all field collection routes' })
  findAll(@Query('branchId') branchId?: string) {
    return this.routesService.findAll(branchId);
  }

  @Post()
  @RequirePermission('masters:manage')
  @ApiOperation({ summary: 'Create a new field collection route' })
  create(@Body() data: any) {
    return this.routesService.create(data);
  }

  @Put(':id/assign')
  @RequirePermission('collections:assign')
  @ApiOperation({ summary: 'Assign a salesperson to a route' })
  assignAgent(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.routesService.assignAgent(id, agentId);
  }
}
