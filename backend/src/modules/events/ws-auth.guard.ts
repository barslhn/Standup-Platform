import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { AppConfigService } from '../../common/config/app-config.service';

export interface WsUser {
  userId: string;
  email: string;
  role: string;
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(token, {
        secret: this.configService.jwtSecret,
      });

      (client.data as Record<string, unknown>).user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      } satisfies WsUser;

      return true;
    } catch {
      client.disconnect();
      return false;
    }
  }

  private extractToken(client: Socket): string | undefined {
    const auth = client.handshake.auth as Record<string, unknown>;
    const header = client.handshake.headers.authorization;
    const query = client.handshake.query as Record<string, unknown>;

    const raw = auth['token'] ?? query['token'] ?? header;
    if (typeof raw !== 'string') return undefined;

    return raw.replace('Bearer ', '');
  }
}
