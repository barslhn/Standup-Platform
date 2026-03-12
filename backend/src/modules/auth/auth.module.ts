import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AppConfigModule } from '../../common/config/app-config.module';
import { AppConfigService } from '../../common/config/app-config.service';
import { StringValue } from 'ms';

@Module({
  imports: [
    PassportModule,
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => {
        const expiresIn = Number.isNaN(Number(configService.jwtExpiresIn))
          ? configService.jwtExpiresIn
          : Number(configService.jwtExpiresIn);

        return {
          secret: configService.jwtSecret,
          signOptions: { expiresIn: expiresIn as number | StringValue | undefined },
        };
      },
      inject: [AppConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
