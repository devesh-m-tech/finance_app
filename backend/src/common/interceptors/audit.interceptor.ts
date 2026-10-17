import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    // Only audit mutating HTTP methods (POST, PUT, PATCH, DELETE)
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(() => {
        if (isMutation && user) {
          const entityType = url.split('/')[2] || 'UNKNOWN';
          this.auditService.logAction({
            userId: user.userId,
            action: method,
            entityType,
            ipAddress: ip,
            userAgent: request.headers['user-agent'],
          }).catch(() => {
            // Non-blocking background log
          });
        }
      })
    );
  }
}
