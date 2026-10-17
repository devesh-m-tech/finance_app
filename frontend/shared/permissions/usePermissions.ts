export interface UserRestrictions {
  blockedModules?: string[];
  blockedActions?: string[];
  blockedLoanTypes?: string[];
  maxApprovalAmountPaise?: number;
  allowedBranchIds?: string[];
  blockedFields?: string[];
}

export interface PermissionContextState {
  role: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
  permissions: string[];
  restrictions?: UserRestrictions | null;
  permissionsVersion: number;
}

/**
 * Core permission evaluation hook logic (consumed across Mobile & Web)
 */
export function evaluatePermissions(state: PermissionContextState) {
  const { role, permissions, restrictions } = state;

  function hasPermission(key: string): boolean {
    if (role === 'SUPER_ADMIN') return true;

    // Deny-wins: Check active restrictions
    if (restrictions) {
      const [moduleName] = key.split(':');
      if (restrictions.blockedModules?.includes(moduleName)) {
        return false;
      }
      if (restrictions.blockedActions?.includes(key)) {
        return false;
      }
      if (restrictions.blockedLoanTypes?.some((lt) => key.startsWith(`loans.${lt}`))) {
        return false;
      }
    }

    // Role-specific check
    if (role === 'SALESPERSON') {
      const allowedSalespersonPrefixes = [
        'customers:create',
        'customers:read',
        'collections:collect',
        'collections:visit',
        'dashboard:own',
        'documents:upload',
        'fingerprints:capture',
        'payments:read',
        'receipts:read',
        'receipts:reprint',
        'handover:submit',
      ];
      if (!allowedSalespersonPrefixes.some((p) => key.startsWith(p))) {
        return false;
      }
    }

    return permissions.includes(key);
  }

  function hasAnyPermission(keys: string[]): boolean {
    return keys.some((key) => hasPermission(key));
  }

  function hasAllPermissions(keys: string[]): boolean {
    return keys.every((key) => hasPermission(key));
  }

  function isModuleBlocked(moduleName: string): boolean {
    if (role === 'SUPER_ADMIN') return false;
    return !!restrictions?.blockedModules?.includes(moduleName);
  }

  return {
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isModuleBlocked,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isManager: role === 'MANAGER',
    isSalesperson: role === 'SALESPERSON',
  };
}
