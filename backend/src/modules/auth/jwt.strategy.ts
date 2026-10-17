import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/user.schema';
import { PermissionsService } from '../permissions/permissions.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    private permissionsService: PermissionsService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const user = await this.userModel.findById(payload.sub).exec();

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('User account is inactive or deleted');
    }

    // Verify token permissions version matches active database version
    if (user.permissionsVersion !== payload.permissionsVersion) {
      throw new UnauthorizedException(
        'User permissions or session has been modified. Please refresh authentication.'
      );
    }

    const { permissions, restrictions } =
      await this.permissionsService.getEffectivePermissions(
        user.role,
        user._id.toString()
      );

    return {
      userId: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId?.toString(),
      permissionsVersion: user.permissionsVersion,
      permissions,
      restrictions,
    };
  }
}
