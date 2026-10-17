import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('Collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post('visit')
  @RequirePermission('collections:visit')
  @ApiOperation({ summary: 'Record field visit outcome (GPS, PTP, absent, locked)' })
  @ApiResponse({ status: 201, description: 'Visit recorded successfully' })
  recordVisit(@Body() dto: CreateVisitDto, @CurrentUser() user: any) {
    return this.collectionsService.recordVisit(dto, user);
  }

  @Get('sheet')
  @RequirePermission('collections:collect')
  @ApiOperation({ summary: 'Get daily collection route sheet with due amounts and statuses' })
  getCollectionSheet(
    @CurrentUser() user: any,
    @Query('routeId') routeId?: string,
    @Query('date') date?: string
  ) {
    return this.collectionsService.getCollectionSheet(routeId, date, user);
  }

  @Get('visits')
  @RequirePermission('collections:visit')
  @ApiOperation({ summary: 'List recent field collection visits' })
  getVisits(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('date') date?: string
  ) {
    return this.collectionsService.getVisits(user, { page, limit, date });
  }
}
