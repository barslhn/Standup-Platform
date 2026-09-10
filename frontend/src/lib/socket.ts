import { io, Socket } from "socket.io-client";
import { config } from "@/core/config";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket) {
    socket.auth = {
      token: `Bearer ${token}`,
    };

    return socket;
  }

  const socketOptions = {
    autoConnect: false,
    auth: {
      token: `Bearer ${token}`,
    },
    query: {
      token: `Bearer ${token}`,
    },
  };

  socket = config.NEXT_PUBLIC_WS_URL
    ? io(config.NEXT_PUBLIC_WS_URL, socketOptions)
    : io(socketOptions);

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}