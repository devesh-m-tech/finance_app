import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService, TransitionPayload } from './workflows.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('definitions')
  @ApiOperation({ summary: 'List all published workflow definitions' })
  @RequirePermission('workflows:manage')
  async getAllDefinitions() {
    const data = await this.workflowsService.getAllDefinitions();
    return { success: true, data };
  }

  @Get('definitions/:entityType')
  @ApiOperation({ summary: 'Get workflow definition for an entity type' })
  @RequirePermission('workflows:manage')
  async getDefinition(@Param('entityType') entityType: string) {
    const data = await this.workflowsService.getDefinition(entityType);
    return { success: true, data };
  }

  @Put('definitions/:entityType')
  @ApiOperation({ summary: 'Update or publish workflow definition (Super Admin only)' })
  @RequirePermission('workflows:manage')
  async saveDefinition(
    @Param('entityType') entityType: string,
    @Body() dto: any
  ) {
    const data = await this.workflowsService.saveDefinition(entityType, dto);
    return { success: true, data };
  }

  @Get(':entityType/:entityId/transitions')
  @ApiOperation({ summary: 'Get allowed transitions for current user on an entity' })
  @RequirePermission('dashboard:own')
  async getAllowedTransitions(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: any
  ) {
    const data = await this.workflowsService.getAllowedTransitions(
      entityType,
      entityId,
      user,
      query
    );
    return { success: true, data };
  }

  @Post(':entityType/:entityId/transition')
  @ApiOperation({ summary: 'Execute workflow transition' })
  @RequirePermission('dashboard:own')
  async executeTransition(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() payload: TransitionPayload,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.workflowsService.executeTransition(
      entityType,
      entityId,
      payload,
      user
    );
    return { success: true, data };
  }

  @Get(':entityType/:entityId/history')
  @ApiOperation({ summary: 'Get workflow audit history timeline' })
  @RequirePermission('dashboard:own')
  async getHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ) {
    const data = await this.workflowsService.getHistory(entityType, entityId);
    return { success: true, data };
  }
}
