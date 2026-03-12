import type { users } from '../../../core/database/schema';
import type { UserResponseDto } from '../dto/user.dto';

export function toUserResponseDto(user: typeof users.$inferSelect): UserResponseDto {
  const { passwordHash: _passwordHash, createdAt, ...rest } = user;
  return { ...rest, createdAt: createdAt.toISOString() } as UserResponseDto;
}
