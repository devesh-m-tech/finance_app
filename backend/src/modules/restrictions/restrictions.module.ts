import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRestriction, UserRestrictionSchema } from './restriction.schema';
import { RestrictionsService } from './restrictions.service';
import { RestrictionsController } from './restrictions.controller';
import { User, UserSchema } from '../users/user.schema';
import { PermissionAudit, PermissionAuditSchema } from '../audit/permission-audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserRestriction.name, schema: UserRestrictionSchema },
      { name: User.name, schema: UserSchema },
      { name: PermissionAudit.name, schema: PermissionAuditSchema },
    ]),
  ],
  providers: [RestrictionsService],
  controllers: [RestrictionsController],
  exports: [RestrictionsService, MongooseModule],
})
export class RestrictionsModule {}
