import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './audit-log.schema';
import { PermissionAudit, PermissionAuditSchema } from './permission-audit.schema';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: PermissionAudit.name, schema: PermissionAuditSchema },
    ]),
  ],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService, MongooseModule],
})
export class AuditModule {}
