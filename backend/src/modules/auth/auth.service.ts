import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';
import { PermissionsService } from '../permissions/permissions.service';

export interface LoginDto {
  username: string;
  password?: string;
  pin?: string;
  deviceId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private permissionsService: PermissionsService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ username: dto.username.toLowerCase(), deletedAt: null })
      .populate('branchId', 'name code city')
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    if (dto.password) {
      const match = await bcrypt.compare(dto.password, user.passwordHash);
      if (!match) {
        throw new UnauthorizedException('Invalid username or password');
      }
    } else if (dto.pin) {
      if (!user.pinHash) {
        throw new BadRequestException('PIN authentication not configured for this user');
      }
      const match = await bcrypt.compare(dto.pin, user.pinHash);
      if (!match) {
        throw new UnauthorizedException('Invalid 4-digit PIN');
      }
    } else {
      throw new BadRequestException('Password or PIN is required for login');
    }

    // Update login timestamp & device
    user.lastLoginAt = new Date();
    if (dto.deviceId) user.deviceId = dto.deviceId;
    await user.save();

    const { permissions, restrictions } =
      await this.permissionsService.getEffectivePermissions(
        user.role,
        user._id.toString()
      );

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
      branchId: user.branchId?._id?.toString() || null,
      permissionsVersion: user.permissionsVersion,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiration'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        mobile: user.mobile,
        role: user.role,
        branch: user.branchId,
        permissionsVersion: user.permissionsVersion,
      },
      permissions,
      restrictions,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userModel.findById(payload.sub).exec();
      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('User account no longer valid');
      }

      const newPayload = {
        sub: user._id.toString(),
        username: user.username,
        role: user.role,
        branchId: user.branchId?.toString() || null,
        permissionsVersion: user.permissionsVersion,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiration'),
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
      });

      const { permissions, restrictions } =
        await this.permissionsService.getEffectivePermissions(
          user.role,
          user._id.toString()
        );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        permissionsVersion: user.permissionsVersion,
        permissions,
        restrictions,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
