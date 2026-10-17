import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  mobile: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
  branchId?: string;
  pin?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  mobile?: string;
  branchId?: string;
  isActive?: boolean;
  password?: string;
  pin?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(dto: CreateUserDto, currentUser: AuthenticatedUser) {
    // 1. Role hierarchy checks
    if (currentUser.role === 'MANAGER' && dto.role !== 'SALESPERSON') {
      throw new ForbiddenException(
        'Managers are strictly permitted to create only Salesperson accounts'
      );
    }

    // 2. Check for duplicate username
    const existing = await this.userModel.findOne({ username: dto.username.toLowerCase() }).exec();
    if (existing) {
      throw new BadRequestException(`Username '${dto.username}' already exists`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    let pinHash: string | undefined = undefined;

    if (dto.pin) {
      pinHash = await bcrypt.hash(dto.pin, salt);
    }

    const user = new this.userModel({
      username: dto.username.toLowerCase(),
      passwordHash,
      pinHash,
      fullName: dto.fullName,
      mobile: dto.mobile,
      role: dto.role,
      branchId: dto.branchId || currentUser.branchId || null,
      isActive: true,
      permissionsVersion: 1,
    });

    return user.save();
  }

  async listUsers(currentUser: AuthenticatedUser, roleFilter?: string) {
    const query: any = { deletedAt: null };

    if (currentUser.role === 'MANAGER') {
      // Manager can only view Salespersons
      query.role = 'SALESPERSON';
      if (currentUser.branchId) {
        query.branchId = currentUser.branchId;
      }
    } else if (roleFilter) {
      query.role = roleFilter;
    }

    return this.userModel
      .find(query)
      .select('-passwordHash -pinHash')
      .populate('branchId', 'name code city')
      .exec();
  }

  async getUserById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash -pinHash')
      .populate('branchId', 'name code city')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    currentUser: AuthenticatedUser
  ) {
    const targetUser = await this.userModel.findById(id).exec();
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Role checks
    if (currentUser.role === 'MANAGER') {
      if (targetUser.role !== 'SALESPERSON') {
        throw new ForbiddenException(
          'Managers can only update Salesperson accounts'
        );
      }
    }

    // Protect last active Super Admin
    if (
      targetUser.role === 'SUPER_ADMIN' &&
      dto.isActive === false &&
      targetUser.isActive === true
    ) {
      const activeSuperAdmins = await this.userModel.countDocuments({
        role: 'SUPER_ADMIN',
        isActive: true,
        deletedAt: null,
      });

      if (activeSuperAdmins <= 1) {
        throw new BadRequestException(
          'Cannot deactivate the only remaining active Super Admin in the system'
        );
      }
    }

    if (dto.fullName) targetUser.fullName = dto.fullName;
    if (dto.mobile) targetUser.mobile = dto.mobile;
    if (dto.branchId) (targetUser as any).branchId = dto.branchId;
    if (dto.isActive !== undefined) targetUser.isActive = dto.isActive;

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      targetUser.passwordHash = await bcrypt.hash(dto.password, salt);
      targetUser.permissionsVersion += 1; // Invalidate active JWT sessions
    }

    if (dto.pin) {
      const salt = await bcrypt.genSalt(10);
      targetUser.pinHash = await bcrypt.hash(dto.pin, salt);
    }

    await targetUser.save();
    return this.getUserById(id);
  }

  async softDeleteUser(id: string, currentUser: AuthenticatedUser, reason: string) {
    const targetUser = await this.userModel.findById(id).exec();
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (currentUser.role === 'MANAGER' && targetUser.role !== 'SALESPERSON') {
      throw new ForbiddenException('Managers can only delete Salespersons');
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Super Admin accounts cannot be deleted');
    }

    await (targetUser as any).softDelete(currentUser.userId, reason);
    return { success: true, message: `User ${targetUser.username} deleted successfully` };
  }
}
