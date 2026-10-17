import React from 'react';
import { PermissionKey } from '../generated/permission-types';

export interface CanProps {
  permission: PermissionKey | string;
  userPermissions: string[];
  userRestrictions?: {
    blockedModules?: string[];
    blockedActions?: string[];
  } | null;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  userPermissions,
  userRestrictions,
  role,
  fallback = null,
  children,
}) => {
  if (role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Deny-wins check
  if (userRestrictions) {
    const [moduleName] = permission.split(':');
    if (userRestrictions.blockedModules?.includes(moduleName)) {
      return <>{fallback}</>;
    }
    if (userRestrictions.blockedActions?.includes(permission)) {
      return <>{fallback}</>;
    }
  }

  if (userPermissions.includes(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
