import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().min(1).default("/api"),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
});

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    z.flattenError(parsed.error).fieldErrors,
  );

  throw new Error("Environment variables are missing or invalid.");
}

export const config = parsed.data;