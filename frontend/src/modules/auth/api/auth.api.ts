import { api } from "@/lib/axios";
import type { AuthResponse, UserRole } from "@/core/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  team?: string;
  role: UserRole;
  email: string;
  password: string;
}

export async function loginRequest(payload: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function registerRequest(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function forgotPasswordRequest(email: string): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPasswordRequest(payload: { token: string; password: string }): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/auth/reset-password", payload);
  return response.data;
}
