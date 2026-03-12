import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../common/config/app-config.service';
import { ConnectionManagerService } from './connection-manager.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface SocketClientData {
  user?: JwtPayload;
}

@WebSocketGateway({
  cors: {
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly connectionManager: ConnectionManagerService,
  ) {}

  afterInit() {
    this.server.engine.opts.cors = {
      origin: this.configService.frontendUrl,
      credentials: true,
    };
    this.logger.log('WebSocket Gateway started.');
  }

  handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new UnauthorizedException('Token not found.');

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.jwtSecret,
      });

      const data = client.data as SocketClientData;
      data.user = payload;

      void client.join(payload.sub);
      this.connectionManager.addConnection(payload.sub, client.id);

      this.logger.log(
        `Connected: ${payload.email} (${client.id}) — Online: ${this.connectionManager.getOnlineCount()}`,
      );
    } catch (error) {
      this.logger.warn(
        `Connection rejected: ${error instanceof Error ? error.message : 'Unknown error'} (${client.id})`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const data = client.data as SocketClientData;
    if (data.user) {
      this.connectionManager.removeConnection(data.user.sub, client.id);
      this.logger.log(
        `Disconnected: ${data.user.email} (${client.id}) — Online: ${this.connectionManager.getOnlineCount()}`,
      );
    }
  }

  sendToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(userId).emit(event, payload);
    this.logger.debug(`[WS] ${event} → userId: ${userId}`);
  }

  sendToAll(event: string, payload: unknown): void {
    this.server.emit(event, payload);
    this.logger.debug(`[WS] Broadcast: ${event}`);
  }

  sendToRole(role: 'MANAGER' | 'EMPLOYEE', event: string, payload: unknown): void {
    this.server.sockets.sockets.forEach((client) => {
      const data = client.data as SocketClientData;
      if (data.user?.role === role) {
        client.emit(event, payload);
      }
    });
    this.logger.debug(`[WS] Role Broadcast: ${event} → role: ${role}`);
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
