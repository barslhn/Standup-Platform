import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET should be at least 32 characters long'),

  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis URL'),

  SWAGGER_USER: z.string().default('admin'),

  SWAGGER_PASSWORD: z
    .string()
    .min(8, 'SWAGGER_PASSWORD should be at least 8 characters long'),

  GCS_BUCKET_NAME: z.string().optional(),
  GCS_PROJECT_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  MAIL_FROM: z.string().default('onboarding@resend.dev'),
});

export type Env = z.infer<typeof envSchema>;