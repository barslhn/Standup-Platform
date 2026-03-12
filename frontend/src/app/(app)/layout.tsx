"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { useSocket } from "@/common/hooks/useSocket";
import { deleteCookie } from "@/lib/cookies";
import { getTokenRole } from "@/lib/jwt";
import { updateKeys } from "@/modules/daily-updates/hooks/useUpdates";
import { toast } from "sonner";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, _hasHydrated } = useAuthStore();
  const role = token ? getTokenRole(token) : null;

  useSocket({
    token,
    enabled: _hasHydrated && !!token && role === "MANAGER",
    onNewBlocker: (payload) => {
      toast.warning(`New blocker: ${payload.user?.name ?? "Unknown user"}`);
      queryClient.invalidateQueries({ queryKey: updateKeys.all });
    },
    onUpdateChanged: (payload) => {
      const actionText = payload.action === "patch" ? "updated" : "submitted";
      toast.info(`Stand-up ${actionText}: ${payload.user?.name ?? "Unknown user"}`);
      queryClient.invalidateQueries({ queryKey: updateKeys.all });
    },
  });

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token) {
      deleteCookie("auth-token");
      router.replace("/login");
    }
  }, [_hasHydrated, token, pathname, router]);

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-muted/30 p-3">
      <div className="flex h-full overflow-hidden rounded-2xl bg-background/70 shadow-sm">
        <div className="hidden w-64 shrink-0 bg-muted/20 p-3 md:block">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 md:p-4">
            <div className="w-full rounded-xl bg-background p-4 shadow-sm md:p-5">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
