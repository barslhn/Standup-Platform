import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const statusSchema = z.enum(['ACTIVE', 'ON_LEAVE']);

export const CreateDailyUpdateSchema = z
  .object({
    yesterday: z.string().optional(),
    today: z.string().optional(),
    blockers: z.string().optional().nullable(),
    hasBlocker: z.boolean().default(false),
    status: statusSchema.default('ACTIVE'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Should be in YYYY-MM-DD format'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'ACTIVE') {
      if (!data.yesterday || data.yesterday.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['yesterday'],
          message: 'Should be at least 3 characters long',
        });
      }

      if (!data.today || data.today.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['today'],
          message: 'Should be at least 3 characters long',
        });
      }
    }

    if (data.hasBlocker) {
      if (!data.blockers || data.blockers.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['blockers'],
          message: 'Blocker description is required',
        });
      }
    }
  });

export const UpdateDailyUpdateSchema = z
  .object({
    yesterday: z.string().optional(),
    today: z.string().optional(),
    blockers: z.string().optional().nullable(),
    hasBlocker: z.boolean().optional(),
    status: statusSchema.optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Should be in YYYY-MM-DD format')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.yesterday !== undefined && data.yesterday.trim().length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['yesterday'],
        message: 'Should be at least 3 characters long',
      });
    }

    if (data.today !== undefined && data.today.trim().length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['today'],
        message: 'Should be at least 3 characters long',
      });
    }

    if (data.hasBlocker === true) {
      if (!data.blockers || data.blockers.trim().length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ['blockers'],
          message: 'Blocker description is required',
        });
      }
    }
  });

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const UpdateStandupPolicySchema = z
  .object({
    workingDays: z.array(z.number().int().min(0).max(6)).min(1),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
    lateStart: z.string().regex(timeRegex),
    lateAfter: z.string().regex(timeRegex),
  })
  .refine(
    (data) => {
      const [lateStartHour, lateStartMinute] = data.lateStart.split(':').map(Number);
      const [lateAfterHour, lateAfterMinute] = data.lateAfter.split(':').map(Number);
      const startMinutes = lateStartHour * 60 + lateStartMinute;
      const endMinutes = lateAfterHour * 60 + lateAfterMinute;

      return endMinutes > startMinutes;
    },
    {
      message: 'The late notification end time must be after the start time.',
      path: ['lateAfter'],
    },
  );

export class CreateDailyUpdateDto extends createZodDto(CreateDailyUpdateSchema) {
  @ApiProperty({
    example: 'Backend architecture completed.',
    description: 'What was done yesterday?',
  })
  declare yesterday: string;

  @ApiProperty({
    example: 'API tests are being conducted.',
    description: 'What will be done today?',
  })
  declare today: string;

  @ApiProperty({
    example: 'There are some type errors.',
    description: 'Blocker descriptions',
    required: false,
  })
  declare blockers?: string | null;

  @ApiProperty({ example: true, description: 'Are there any blockers?' })
  declare hasBlocker: boolean;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'ON_LEAVE'],
    description: 'Daily status',
  })
  declare status: 'ACTIVE' | 'ON_LEAVE';

  @ApiProperty({ example: '2024-03-04', description: 'Report date (YYYY-MM-DD)' })
  declare date: string;
}

export class UpdateDailyUpdateDto extends createZodDto(UpdateDailyUpdateSchema) {}

export class UpdateStandupPolicyDto extends createZodDto(UpdateStandupPolicySchema) {
  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: 'Working days (0: Sunday, 6: Saturday)',
  })
  declare workingDays: number[];

  @ApiProperty({ example: '09:00', description: 'Start time for the form (HH:mm)' })
  declare startTime: string;

  @ApiProperty({ example: '18:00', description: 'End time for the form (HH:mm)' })
  declare endTime: string;

  @ApiProperty({ example: '09:00', description: 'Late notification start time (HH:mm)' })
  declare lateStart: string;

  @ApiProperty({ example: '09:30', description: 'Late acceptance threshold (HH:mm)' })
  declare lateAfter: string;
}
