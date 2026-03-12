import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/auth/store/useAuthStore";
import { setCookie } from "@/lib/cookies";
import { registerRequest } from "@/modules/auth/api/auth.api";
import { getRedirectPathByToken } from "@/modules/auth/utils/auth-redirect";
import { parseApiError } from "@/lib/api-error";
import type { RegisterFormData } from "@/modules/auth/schemas/register.schema";

export function useRegister() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        const result = await registerRequest({
          name: data.name,
          team: data.role === "EMPLOYEE" ? data.team : undefined,
          role: data.role,
          email: data.email,
          password: data.password,
        });

        setCookie("auth-token", result.access_token, 7);
        login(result.user, result.access_token);

        toast.success("Account created successfully!");
        router.replace(getRedirectPathByToken(result.access_token));
      } catch (err) {
        toast.error(parseApiError(err, "Registration failed. Please check your information."));
      }
    },
    [login, router]
  );

  return { onSubmit };
}
