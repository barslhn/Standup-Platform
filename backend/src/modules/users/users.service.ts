import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../common/exceptions/app.exceptions';
import { UserResponseDto } from './dto/user.dto';
import { UserRepository } from './user.repository';
import { toUserResponseDto } from './utils/user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    const dbUser = await this.userRepository.findById(userId);
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    return toUserResponseDto(dbUser);
  }

  async getTeams(): Promise<string[]> {
    return this.userRepository.findDistinctTeams();
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const allUsers = await this.userRepository.findAll();
    return allUsers.map(toUserResponseDto);
  }
}
