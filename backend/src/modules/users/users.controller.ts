import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user (Super Admin: any role; Manager: Salesperson only)' })
  @RequirePermission('users:salespersons')
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.usersService.createUser(dto, user);
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List users based on scope' })
  @RequirePermission('users:salespersons')
  async listUsers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('role') role?: string
  ) {
    const data = await this.usersService.listUsers(user, role);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @RequirePermission('users:salespersons')
  async getUser(@Param('id') id: string) {
    const data = await this.usersService.getUserById(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user demographic or status' })
  @RequirePermission('users:salespersons')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const data = await this.usersService.updateUser(id, dto, user);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @RequirePermission('users:salespersons')
  async deleteUser(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.usersService.softDeleteUser(id, user, reason || 'Administrative action');
  }
}
