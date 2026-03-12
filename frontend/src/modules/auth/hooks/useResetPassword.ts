import type { ResetPasswordFormData } from "../schemas/reset-password.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetPasswordRequest } from "../api/auth.api";

export const useResetPassword = (token: string | null) => {
    const router = useRouter();

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error("Invalid or missing token. Please try the password reset process again.");
            return;
        }

        try {
            await resetPasswordRequest({
                token,
                password: data.password,
            });

            toast.success("Password updated successfully.");
            router.push("/login");
        } catch {
            toast.error("An error occurred while resetting the password. Please try again.");
        }
    };

    return { onSubmit };
};
