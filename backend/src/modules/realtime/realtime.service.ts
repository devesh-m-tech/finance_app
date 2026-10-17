import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

export interface RealtimeEvent {
  type:
    | 'WORKFLOW_STATE_CHANGED'
    | 'PAYMENT_COLLECTED'
    | 'RATE_UPDATED'
    | 'PERMISSIONS_CHANGED'
    | 'APPROVAL_PENDING'
    | 'NOTIFICATION';
  payload: any;
  targetRole?: 'SUPER_ADMIN' | 'MANAGER' | 'SALESPERSON';
  targetBranchId?: string;
  targetUserId?: string;
  requiredPermission?: string;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly eventSubject = new Subject<RealtimeEvent>();

  /**
   * Broadcast an event to connected clients.
   */
  emitEvent(event: RealtimeEvent): void {
    this.logger.debug(`Broadcasting event: ${event.type}`);
    this.eventSubject.next(event);
  }

  /**
   * Returns an Observable stream filtered specifically for the requesting user.
   */
  getEventStream(user: AuthenticatedUser): Observable<any> {
    return this.eventSubject.asObservable().pipe(
      filter((event) => {
        // 1. Direct user target
        if (event.targetUserId && event.targetUserId !== user.userId) {
          return false;
        }

        // 2. Role target
        if (event.targetRole && event.targetRole !== user.role && user.role !== 'SUPER_ADMIN') {
          return false;
        }

        // 3. Branch scope filter
        if (
          event.targetBranchId &&
          user.role !== 'SUPER_ADMIN' &&
          user.branchId &&
          user.branchId !== event.targetBranchId
        ) {
          return false;
        }

        // 4. Required permission filter
        if (event.requiredPermission && !user.permissions.includes(event.requiredPermission)) {
          return false;
        }

        return true;
      }),
      map((event) => ({
        data: {
          type: event.type,
          payload: event.payload,
          timestamp: new Date().toISOString(),
        },
      }))
    );
  }
}
