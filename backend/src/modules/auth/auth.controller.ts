import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @RateLimit({ limit: 5, window: 60 })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@test.com' },
        password: { type: 'string', example: 'Test@1234' },
        name: { type: 'string', example: 'Test User' },
        team: { type: 'string', example: 'Backend Team' },
        role: { type: 'string', enum: ['EMPLOYEE', 'MANAGER'], example: 'EMPLOYEE' },
      },
      required: ['email', 'password', 'name', 'team', 'role'],
    },
  })
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, window: 60 })
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@test.com' },
        password: { type: 'string', example: 'Test@1234' },
      },
      required: ['email', 'password'],
    },
  })
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 3, window: 60 })
  @ApiOperation({ summary: 'Send password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, window: 60 })
  @ApiOperation({ summary: 'Reset password with new value' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }
}
