import { z } from 'zod';

export const idSchema = z.uuid('Please provide a valid UUID');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password can be at most 64 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one digit')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const emailSchema = z.email('Please provide a valid email address').toLowerCase();

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please provide a valid date in YYYY-MM-DD format');
