import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../../common/config/app-config.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
