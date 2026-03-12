import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  team: z.string(),
  role: z.enum(['EMPLOYEE', 'MANAGER']),
  createdAt: z.string(),
  resetPasswordExpiresAt: z.string().nullable().optional(),
});

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
