"use client";

import { LogOut, ChevronDown, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeAndLogout } from "@/common/hooks/useThemeAndLogout";

export function Header() {
  const { user } = useAuthStore();
  const { theme, toggleTheme, handleLogout } = useThemeAndLogout();

  return (
    <header className="flex items-center justify-end p-3 md:p-4">
      <div className="flex items-center gap-2 rounded-2xl border bg-card px-3 py-2 shadow-sm">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          className="h-8 gap-1 px-3"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light" : "Dark"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1 outline-none">
            <div className="flex flex-col items-start">
              <span className="max-w-[130px] truncate text-sm font-medium leading-none">{user?.name}</span>
              <span className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{user?.role}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}