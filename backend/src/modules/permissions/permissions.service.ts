import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PERMISSION_CATALOG, DEFAULT_ROLE_PERMISSIONS, PermissionItem } from './catalog';
import { Role } from '../roles/role.schema';
import { UserRestriction } from '../restrictions/restriction.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(UserRestriction.name) private restrictionModel: Model<UserRestriction>
  ) {}

  getCatalog(): PermissionItem[] {
    return PERMISSION_CATALOG;
  }

  getDefaultRoleMatrix(): typeof DEFAULT_ROLE_PERMISSIONS {
    return DEFAULT_ROLE_PERMISSIONS;
  }

  /**
   * Computes effective permissions for a user: (Role Permissions) MINUS (User Restrictions)
   * Deny-wins principle.
   */
  async getEffectivePermissions(
    roleName: string,
    managerId?: string
  ): Promise<{
    role: string;
    permissions: string[];
    restrictions: any | null;
  }> {
    // 1. Get base role permissions
    let rolePerms: string[] = [];
    const roleDoc = await this.roleModel.findOne({ name: roleName }).exec();

    if (roleDoc && roleDoc.permissions.length > 0) {
      rolePerms = roleDoc.permissions;
    } else {
      rolePerms = (DEFAULT_ROLE_PERMISSIONS as any)[roleName] || [];
    }

    // 2. If Super Admin, no restrictions ever apply
    if (roleName === 'SUPER_ADMIN') {
      return {
        role: roleName,
        permissions: rolePerms,
        restrictions: null,
      };
    }

    // 3. For Manager, evaluate manager restrictions
    let restrictionsDoc: any = null;
    if (roleName === 'MANAGER' && managerId) {
      restrictionsDoc = await this.restrictionModel.findOne({ managerId }).exec();

      if (restrictionsDoc) {
        // Filter out blocked actions and blocked modules
        const blockedSet = new Set<string>(restrictionsDoc.blockedActions || []);

        rolePerms = rolePerms.filter((perm) => {
          if (blockedSet.has(perm)) return false;

          const [moduleName] = perm.split(':');
          if (
            restrictionsDoc.blockedModules &&
            restrictionsDoc.blockedModules.includes(moduleName)
          ) {
            return false;
          }

          if (restrictionsDoc.blockedLoanTypes && restrictionsDoc.blockedLoanTypes.length > 0) {
            for (const blockedType of restrictionsDoc.blockedLoanTypes) {
              if (perm.startsWith(`loans.${blockedType}`)) {
                return false;
              }
            }
          }

          return true;
        });
      }
    }

    // 4. Salesperson is strictly capped to allowed two workflows
    if (roleName === 'SALESPERSON') {
      rolePerms = DEFAULT_ROLE_PERMISSIONS.SALESPERSON;
    }

    return {
      role: roleName,
      permissions: rolePerms,
      restrictions: restrictionsDoc,
    };
  }
}
