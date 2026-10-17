import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: string;
  username: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
  branchId?: string;
  permissionsVersion: number;
  permissions: string[];
  restrictions?: {
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
  };
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    return data ? user?.[data] : user;
  }
);
