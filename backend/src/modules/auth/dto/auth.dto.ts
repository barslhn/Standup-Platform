import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../common/validations/zod.utils';

import { ApiProperty } from '@nestjs/swagger';

const teamSchema = z.enum(['FULL_STACK_DEVELOPER', 'UI_UX', 'MOBILE']);

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: emailSchema,
    password: passwordSchema,
    team: teamSchema.optional(),
    role: z.enum(['EMPLOYEE', 'MANAGER']),
  })
  .refine((data) => data.role === 'MANAGER' || !!data.team, {
    message: 'Team is required for EMPLOYEE role',
    path: ['team'],
  });

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {
  @ApiProperty({ example: 'user@test.com', description: 'User email address' })
  declare email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  declare name: string;

  @ApiProperty({ example: 'Password123!', description: 'Strong password' })
  declare password: string;

  @ApiProperty({
    enum: ['FULL_STACK_DEVELOPER', 'UI_UX', 'MOBILE'],
    example: 'FULL_STACK_DEVELOPER',
    description: 'User team',
    required: false,
  })
  declare team?: 'FULL_STACK_DEVELOPER' | 'UI_UX' | 'MOBILE';

  @ApiProperty({ enum: ['EMPLOYEE', 'MANAGER'], example: 'EMPLOYEE' })
  declare role: 'EMPLOYEE' | 'MANAGER';
}

export class LoginDto extends createZodDto(LoginSchema) {
  @ApiProperty({ example: 'test@gmail.com' })
  declare email: string;

  @ApiProperty({ example: 'Neon@1234!' })
  declare password: string;
}

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {
  @ApiProperty({ example: 'user@test.com' })
  declare email: string;
}

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {
  @ApiProperty({ example: 'abc-123-token' })
  declare token: string;

  @ApiProperty({ example: 'NewSecret@123' })
  declare password: string;
}
