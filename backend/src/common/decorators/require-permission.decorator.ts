import { SetMetadata } from '@nestjs/common';

export const PERMISSION_METADATA_KEY = 'required_permission';

/**
 * Decorator to enforce fine-grained module:action permission check on controller endpoints.
 * e.g., @RequirePermission('customers:create')
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_METADATA_KEY, permission);
