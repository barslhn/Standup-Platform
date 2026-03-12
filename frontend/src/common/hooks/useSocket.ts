"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export interface NewBlockerEvent {
  updateId: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  blockers?: string | null;
  date: string;
}

export interface UpdateChangedEvent {
  action: "create" | "patch";
  updateId: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  date: string;
  hasBlocker: boolean;
}

interface UseSocketOptions {
  token?: string | null;
  enabled?: boolean;
  onNewBlocker?: (payload: NewBlockerEvent) => void;
  onUpdateChanged?: (payload: UpdateChangedEvent) => void;
}

export function useSocket({
  token,
  enabled = true,
  onNewBlocker,
  onUpdateChanged,
}: UseSocketOptions) {
  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    const socket = getSocket(token);

    const handleNewBlocker = (payload: NewBlockerEvent) => {
      onNewBlocker?.(payload);
    };

    const handleUpdateChanged = (payload: UpdateChangedEvent) => {
      onUpdateChanged?.(payload);
    };

    socket.on("new_blocker", handleNewBlocker);
    socket.on("update_changed", handleUpdateChanged);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("new_blocker", handleNewBlocker);
      socket.off("update_changed", handleUpdateChanged);
    };
  }, [enabled, token, onNewBlocker, onUpdateChanged]);
}
