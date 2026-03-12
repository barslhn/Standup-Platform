import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UserController],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
