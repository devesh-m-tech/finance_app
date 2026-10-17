import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_METADATA_KEY } from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no permission decorator is specified, block by default in strict mode
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new HttpException(
        {
          code: 'UNAUTHORIZED',
          message: 'Authentication required before permission evaluation',
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    // 1. SUPER_ADMIN has full, unrestricted access to everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // 2. Deny-Wins: Check Manager Restrictions
    if (user.restrictions) {
      const { blockedModules, blockedActions, blockedLoanTypes, workingHours } =
        user.restrictions;

      // Check working hours restriction
      if (workingHours) {
        const now = new Date();
        const currentDay = now.getDay();
        const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (
          !workingHours.days.includes(currentDay) ||
          currentHourMin < workingHours.start ||
          currentHourMin > workingHours.end
        ) {
          this.throwForbidden(
            requiredPermission,
            'Action blocked: Operating outside permitted working hours.'
          );
        }
      }

      // Check module-level block (e.g., 'pnl', 'expenses', 'reports')
      const [moduleName] = requiredPermission.split(':');
      if (blockedModules && blockedModules.includes(moduleName)) {
        this.throwForbidden(
          requiredPermission,
          `Module '${moduleName}' has been restricted for your account by Super Admin.`
        );
      }

      // Check action-level block (e.g., 'receipts:cancel', 'customers:delete')
      if (blockedActions && blockedActions.includes(requiredPermission)) {
        this.throwForbidden(
          requiredPermission,
          `Action '${requiredPermission}' is restricted for your account.`
        );
      }

      // Check loan-type block (e.g., 'metal')
      if (blockedLoanTypes && blockedLoanTypes.length > 0) {
        for (const blockedType of blockedLoanTypes) {
          if (requiredPermission.startsWith(`loans.${blockedType}`)) {
            this.throwForbidden(
              requiredPermission,
              `Product '${blockedType}' is restricted for your account.`
            );
          }
        }
      }
    }

    // 3. Check effective user permissions list
    const hasPermission = user.permissions && user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      this.throwForbidden(
        requiredPermission,
        `User lacks required permission: ${requiredPermission}`
      );
    }

    // 4. Salesperson specific hard boundary
    if (user.role === 'SALESPERSON') {
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

      const isAllowed = allowedSalespersonPrefixes.some((allowed) =>
        requiredPermission.startsWith(allowed)
      );

      if (!isAllowed) {
        this.throwForbidden(
          requiredPermission,
          'Salesperson is strictly authorized only to Add Customer and Collect Cash.'
        );
      }
    }

    return true;
  }

  private throwForbidden(requiredPermission: string, customMessage?: string): never {
    throw new HttpException(
      {
        code: 'PERMISSION_DENIED',
        message: customMessage || `Forbidden: ${requiredPermission} required`,
        requiredPermission,
        statusCode: HttpStatus.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN
    );
  }
}
