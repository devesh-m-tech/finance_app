import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRestriction } from './restriction.schema';
import { User } from '../users/user.schema';
import { PermissionAudit } from '../audit/permission-audit.schema';

export interface SetRestrictionDto {
  presetName?: string;
  reason?: string;
  blockedModules?: string[];
  blockedActions?: string[];
  blockedLoanTypes?: string[];
  maxApprovalAmountPaise?: number;
  allowedBranchIds?: string[];
  blockedFields?: string[];
  workingHours?: {
    start: string;
    end: string;
    days: number[];
  };
  expiresAt?: string | Date;
}

@Injectable()
export class RestrictionsService {
  constructor(
    @InjectModel(UserRestriction.name) private restrictionModel: Model<UserRestriction>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(PermissionAudit.name) private auditModel: Model<PermissionAudit>
  ) {}

  async getRestrictions(managerId: string) {
    return this.restrictionModel.findOne({ managerId }).exec();
  }

  async setRestrictions(
    managerId: string,
    dto: SetRestrictionDto,
    assignedBy: string
  ) {
    const manager = await this.userModel.findById(managerId).exec();
    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    if (manager.role !== 'MANAGER') {
      throw new BadRequestException('Restrictions can only be applied to Manager accounts');
    }

    // Apply Preset defaults if requested
    let blockedModules = dto.blockedModules || [];
    let blockedActions = dto.blockedActions || [];
    let blockedLoanTypes = dto.blockedLoanTypes || [];
    let maxApprovalAmountPaise = dto.maxApprovalAmountPaise;

    if (dto.presetName === 'NO_PNL_EXPENSES') {
      blockedModules = Array.from(new Set([...blockedModules, 'pnl', 'expenses']));
    } else if (dto.presetName === 'OPERATIONS_ONLY') {
      blockedModules = Array.from(new Set([...blockedModules, 'pnl', 'expenses', 'reports', 'rates']));
      blockedActions = Array.from(new Set([...blockedActions, 'receipts:cancel', 'loans:override']));
    } else if (dto.presetName === 'JUNIOR_MANAGER') {
      maxApprovalAmountPaise = maxApprovalAmountPaise || 5000000; // 50,000 INR
      blockedLoanTypes = Array.from(new Set([...blockedLoanTypes, 'metal']));
    }

    const updated = await this.restrictionModel.findOneAndUpdate(
      { managerId },
      {
        managerId,
        assignedBy,
        reason: dto.reason || '',
        presetName: dto.presetName || null,
        blockedModules,
        blockedActions,
        blockedLoanTypes,
        maxApprovalAmountPaise,
        allowedBranchIds: dto.allowedBranchIds || [],
        blockedFields: dto.blockedFields || [],
        workingHours: dto.workingHours || null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      { upsert: true, new: true }
    );

    // Invalidate manager's active permissions version immediately
    await this.userModel.findByIdAndUpdate(managerId, {
      $inc: { permissionsVersion: 1 },
    });

    // Write audit trail
    await this.auditModel.create({
      userId: assignedBy,
      username: 'SUPER_ADMIN',
      route: `/restrictions/${managerId}`,
      requiredPermission: 'restrictions:manage',
      denialReason: `Assigned restriction [${dto.presetName || 'CUSTOM'}] to manager ${manager.username}. Reason: ${dto.reason || 'N/A'}`,
    });

    return updated;
  }

  async removeRestrictions(managerId: string, assignedBy: string) {
    const deleted = await this.restrictionModel.findOneAndDelete({ managerId }).exec();

    // Increment permissionsVersion to refresh session
    await this.userModel.findByIdAndUpdate(managerId, {
      $inc: { permissionsVersion: 1 },
    });

    await this.auditModel.create({
      userId: assignedBy,
      username: 'SUPER_ADMIN',
      route: `/restrictions/${managerId}`,
      requiredPermission: 'restrictions:manage',
      denialReason: `Removed all restrictions for manager ${managerId}`,
    });

    return { success: true, message: 'Manager restrictions removed successfully' };
  }
}
