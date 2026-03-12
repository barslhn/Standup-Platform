import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'node:crypto';
import { UserRepository } from '../users/user.repository';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import type { JwtPayload } from './strategies/jwt.strategy';
import { users } from '../../core/database/schema';
import { hashPassword, comparePasswords } from './utils/password.util';
import {
  AuthenticationException,
  BusinessRuleException,
} from '../../common/exceptions/app.exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) return { success: true };

    const plainToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(plainToken).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await this.userRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: expiresAt,
    });

    await this.mailService.sendResetPasswordEmail(user.email, plainToken, user.name);

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = createHash('sha256').update(dto.token).digest('hex');
    const user = await this.userRepository.findByResetToken(hashedToken);

    if (!user?.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      throw new BusinessRuleException('Invalid or expired reset link.');
    }

    const newPasswordHash = await hashPassword(dto.password);

    await this.userRepository.update(user.id, {
      passwordHash: newPasswordHash,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });

    return { success: true };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);

    if (existing) {
      throw new BusinessRuleException('Email is already registered');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      team: dto.role === 'MANAGER' ? 'GENERAL' : dto.team,
      role: dto.role,
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new AuthenticationException('Invalid email or password');
    }

    const isMatch = await comparePasswords(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new AuthenticationException('Invalid email or password');
    }

    return this.generateToken(user);
  }

  private generateToken(user: typeof users.$inferSelect) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        team: user.team,
        role: user.role,
      },
    };
  }
}
