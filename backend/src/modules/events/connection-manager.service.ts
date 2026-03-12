import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionManagerService {
  private readonly userSockets = new Map<string, Set<string>>();

  addConnection(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  removeConnection(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  getSocketIds(userId: string): string[] {
    const sockets = this.userSockets.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  getOnlineCount(): number {
    return this.userSockets.size;
  }
}
