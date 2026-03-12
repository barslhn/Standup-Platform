import { useTheme } from "next-themes";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { disconnectSocket } from "@/lib/socket";

export function useThemeAndLogout() {
  const { logout } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();
  const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function handleLogout() {
    disconnectSocket();
    logout();
    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "auth-role=; path=/; max-age=0";
    globalThis.location.assign("/login");
  }

  return { theme, toggleTheme, handleLogout };
}
