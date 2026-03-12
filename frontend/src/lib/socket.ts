import { io, Socket } from "socket.io-client";
import { config } from "@/core/config";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket) {
    socket.auth = { token: `Bearer ${token}` };
  } else {
    socket = io(config.NEXT_PUBLIC_WS_URL, {
      autoConnect: false,
      auth: {
        token: `Bearer ${token}`,
      },
      query: {
        token: `Bearer ${token}`,
      },
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}