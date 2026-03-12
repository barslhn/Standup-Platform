import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from './dto/user.dto';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from './users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.sub);
  }

  @Get('teams')
  @Roles('MANAGER')
  @ApiOperation({ summary: 'It returns the registered team list' })
  @ApiResponse({ status: 200, type: [String] })
  async getTeams(): Promise<string[]> {
    return this.usersService.getTeams();
  }

  @Get()
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Only Managers can access this endpoint and view all users' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.usersService.getAllUsers();
  }
}
