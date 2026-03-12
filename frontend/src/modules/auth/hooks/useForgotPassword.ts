import { useState } from "react";
import type { ForgotPasswordFormData } from "../schemas/forgot-password.schema";
import { toast } from "sonner";
import { forgotPasswordRequest } from "../api/auth.api";

export const useForgotPassword = () => {
    const [isSuccess, setIsSuccess] = useState(false);

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            await forgotPasswordRequest(data.email);

            setIsSuccess(true);
            toast.success("Password reset email sent successfully. Please check your mail.");
        } catch {
                toast.error("An error occurred. Please try again.");
            }
    };

    return { onSubmit, isSuccess };
};
