import axios from "axios";
import { config } from "@/core/config";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";

export const api = axios.create({
  baseURL: config.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((req) => {
  const token = useAuthStore.getState().token;
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-storage");
      if (typeof globalThis !== "undefined" && globalThis.window && globalThis.window.location.pathname !== "/login") {
        globalThis.window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);