import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Role, RoleSchema } from '../roles/role.schema';
import { UserRestriction, UserRestrictionSchema } from '../restrictions/restriction.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: UserRestriction.name, schema: UserRestrictionSchema },
    ]),
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService, MongooseModule],
})
export class PermissionsModule {}
