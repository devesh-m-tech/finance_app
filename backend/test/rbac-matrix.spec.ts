import {
  PERMISSION_CATALOG,
  DEFAULT_ROLE_PERMISSIONS,
} from '../src/modules/permissions/catalog';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

describe('RBAC Matrix & Security Boundaries', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user: any, requiredPermission?: string): ExecutionContext => {
    const mockRequest = { user };
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as any;
  };

  describe('Default Permission Matrix Integrity', () => {
    it('SUPER_ADMIN should have all catalog permissions', () => {
      const allCatalogKeys = PERMISSION_CATALOG.map((p) => p.key);
      expect(DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN.length).toBe(allCatalogKeys.length);
      expect(DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN).toEqual(expect.arrayContaining(allCatalogKeys));
    });

    it('MANAGER should have operational permissions but no Super Admin protected actions', () => {
      const managerPerms = DEFAULT_ROLE_PERMISSIONS.MANAGER;

      // Must have operational access
      expect(managerPerms).toContain('customers:create');
      expect(managerPerms).toContain('loans.daily:approve');
      expect(managerPerms).toContain('loans.metal:approve');
      expect(managerPerms).toContain('pnl:read');
      expect(managerPerms).toContain('reports:read');

      // Protected actions that Manager must NEVER have
      expect(managerPerms).not.toContain('loans:override');
      expect(managerPerms).not.toContain('users:managers');
      expect(managerPerms).not.toContain('restrictions:manage');
      expect(managerPerms).not.toContain('backup:run');
      expect(managerPerms).not.toContain('records:hardDelete');
    });

    it('SALESPERSON should strictly have ONLY Add Customer and Collect Cash workflows', () => {
      const salesPerms = DEFAULT_ROLE_PERMISSIONS.SALESPERSON;

      // Permitted field actions
      expect(salesPerms).toContain('customers:create');
      expect(salesPerms).toContain('customers:read');
      expect(salesPerms).toContain('collections:collect');
      expect(salesPerms).toContain('collections:visit');
      expect(salesPerms).toContain('dashboard:own');

      // Forbidden for Salesperson
      expect(salesPerms).not.toContain('loans.daily:create');
      expect(salesPerms).not.toContain('loans.daily:approve');
      expect(salesPerms).not.toContain('loans.daily:disburse');
      expect(salesPerms).not.toContain('pnl:read');
      expect(salesPerms).not.toContain('reports:read');
      expect(salesPerms).not.toContain('expenses:manage');
      expect(salesPerms).not.toContain('receipts:cancel');
      expect(salesPerms).not.toContain('users:salespersons');
      expect(salesPerms).not.toContain('settings:manage');
    });
  });

  describe('PermissionsGuard Enforcement & Deny-Wins', () => {
    it('should grant access to SUPER_ADMIN without restrictions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('pnl:read');

      const user = {
        role: 'SUPER_ADMIN',
        permissions: DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN,
      };

      const context = createMockContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow unrestricted MANAGER to view P&L', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('pnl:read');

      const user = {
        role: 'MANAGER',
        permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
        restrictions: null,
      };

      const context = createMockContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block P&L-restricted MANAGER with HTTP 403 (Deny-Wins)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('pnl:read');

      const user = {
        role: 'MANAGER',
        permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
        restrictions: {
          blockedModules: ['pnl', 'expenses'],
        },
      };

      const context = createMockContext(user);
      expect(() => guard.canActivate(context)).toThrow(HttpException);

      try {
        guard.canActivate(context);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(err.getResponse().requiredPermission).toBe('pnl:read');
      }
    });

    it('should block SALESPERSON from loan creation with HTTP 403', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('loans.daily:create');

      const user = {
        role: 'SALESPERSON',
        permissions: DEFAULT_ROLE_PERMISSIONS.SALESPERSON,
      };

      const context = createMockContext(user);
      expect(() => guard.canActivate(context)).toThrow(HttpException);

      try {
        guard.canActivate(context);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('should allow SALESPERSON to collect cash and record visits', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('collections:collect');

      const user = {
        role: 'SALESPERSON',
        permissions: DEFAULT_ROLE_PERMISSIONS.SALESPERSON,
      };

      const context = createMockContext(user);
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
