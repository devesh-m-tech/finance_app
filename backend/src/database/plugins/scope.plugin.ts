import { Schema } from 'mongoose';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

/**
 * Mongoose Scope Plugin: Enforces data tenancy and role isolation automatically on queries.
 */
export function scopePlugin(schema: Schema) {
  // Method to apply user scope criteria to a query
  schema.query.withScope = function (this: any, user: AuthenticatedUser) {
    if (!user || user.role === 'SUPER_ADMIN') {
      return this; // Super Admin sees all data
    }

    if (user.role === 'MANAGER') {
      // If manager has restricted branch IDs
      if (
        user.restrictions?.allowedBranchIds &&
        user.restrictions.allowedBranchIds.length > 0
      ) {
        return this.where({
          branchId: { $in: user.restrictions.allowedBranchIds },
        });
      }
      if (user.branchId) {
        return this.where({ branchId: user.branchId });
      }
      return this;
    }

    if (user.role === 'SALESPERSON') {
      // Salesperson sees only assigned or created-by records
      return this.where({
        $or: [
          { assignedTo: user.userId },
          { createdBy: user.userId },
          { collectedBy: user.userId },
        ],
      });
    }

    return this;
  };
}
