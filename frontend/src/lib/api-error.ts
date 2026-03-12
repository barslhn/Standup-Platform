import type { ApiError } from "@/core/types";

interface AxiosLikeError {
    response?: {
        data?: Partial<ApiError>;
        status?: number;
    };
    message?: string;
}

export function parseApiError(
    err: unknown,
    fallback = "An error occurred. Please try again.",
): string {
    const axiosErr = err as AxiosLikeError;
    const serverMessage = axiosErr?.response?.data?.message;

    if (serverMessage) {
        return serverMessage;
    }

    if (err instanceof Error && err.message) {
        return err.message;
    }

    return fallback;
}

export function isApiStatus(err: unknown, status: number): boolean {
    const axiosErr = err as AxiosLikeError;
    return axiosErr?.response?.status === status;
}
