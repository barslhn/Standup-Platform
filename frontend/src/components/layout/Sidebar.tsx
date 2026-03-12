"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, Bell, Sun, Moon, LogOut } from "lucide-react";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useThemeAndLogout } from "@/common/hooks/useThemeAndLogout";

const employeeMenu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

const managerMenu = [
  { label: "Home", href: "/manager/dashboard", icon: Users },
  { label: "Stand-up", href: "/manager/updates", icon: ClipboardList },
  { label: "Notifications", href: "/manager/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { theme, toggleTheme, handleLogout } = useThemeAndLogout();

  const menuItems = user?.role === "MANAGER" ? managerMenu : employeeMenu;

  return (
    <aside className="flex h-full w-full max-w-56 shrink-0 flex-col rounded-2xl border bg-background/95 p-4 shadow-sm backdrop-blur dark:bg-background/85">
      <div>
        <div className="mb-4 px-1">
          <h1 className="text-lg font-bold tracking-tight">Standup</h1>
          <p className="text-xs text-muted-foreground">Async Daily Platform</p>
        </div>

        <div className="mb-4 rounded-xl border bg-card px-3 py-2">
          <p className="truncate text-sm font-semibold">{user?.name ?? "User"}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{user?.role ?? "-"}</p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menuItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/70 hover:text-accent-foreground",
                pathname === href
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                  : "text-foreground/90"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="mt-8 h-9 w-full justify-start gap-2 text-foreground hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light Mood" : "Dark Mood"}
        </Button>
      </div>

      <div className="mt-3 rounded-xl border bg-card px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="mt-2 h-8 w-full justify-start px-2 text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}