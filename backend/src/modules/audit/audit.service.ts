import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './audit-log.schema';
import { PermissionAudit } from './permission-audit.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLog>,
    @InjectModel(PermissionAudit.name) private permAuditModel: Model<PermissionAudit>
  ) {}

  async logAction(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    beforeState?: any;
    afterState?: any;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    gpsCoordinates?: { lat: number; lng: number };
  }) {
    return this.auditLogModel.create(data);
  }

  async listAuditLogs(limit = 50, entityType?: string) {
    const query: any = {};
    if (entityType) query.entityType = entityType;
    return this.auditLogModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username fullName role')
      .exec();
  }

  async listPermissionDenials(limit = 50) {
    return this.permAuditModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'username fullName role')
      .exec();
  }
}
