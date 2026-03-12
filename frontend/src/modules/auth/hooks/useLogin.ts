import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { setCookie } from "@/lib/cookies";
import { loginRequest } from "@/modules/auth/api/auth.api";
import { getRedirectPathByToken } from "@/modules/auth/utils/auth-redirect";
import { parseApiError, isApiStatus } from "@/lib/api-error";
import type { LoginFormData } from "@/modules/auth/schemas/login.schema";

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        const result = await loginRequest(data);
        setCookie("auth-token", result.access_token, 7);
        login(result.user, result.access_token);

        toast.success("Login successful!");
        router.replace(getRedirectPathByToken(result.access_token));
      } catch (err) {
        if (isApiStatus(err, 401)) {
          toast.error("Invalid email or password.");
          return;
        }
        toast.error(parseApiError(err, "Login failed. Please try again."));
      }
    },
    [login, router]
  );

  return { onSubmit };
}
