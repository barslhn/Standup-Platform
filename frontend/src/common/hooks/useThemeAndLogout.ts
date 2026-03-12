import { useEffect, useState } from "react";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { disconnectSocket } from "@/lib/socket";

export function useThemeAndLogout() {
  const { logout } = useAuthStore();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof globalThis === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
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
