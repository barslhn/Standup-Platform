import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET should be at least 16 characters long'),
  JWT_EXPIRES_IN: z.string(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  SWAGGER_USER: z.string().default('admin'),
  SWAGGER_PASSWORD: z.string().min(6, 'SWAGGER_PASSWORD should be at least 6 characters long'),

  GCS_BUCKET_NAME: z.string().optional(),
  GCS_PROJECT_ID: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  MAIL_FROM: z.string().default('onboarding@resend.dev'),
});

export type Env = z.infer<typeof envSchema>;
