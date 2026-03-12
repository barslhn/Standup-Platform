import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV') ?? 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get('PORT') ?? 3001;
  }

  get databaseUrl(): string {
    return this.config.getOrThrow('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.config.getOrThrow('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.config.getOrThrow('JWT_EXPIRES_IN');
  }

  get frontendUrl(): string {
    return this.config.get('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  get redisHost(): string {
    return this.config.getOrThrow('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.config.getOrThrow('REDIS_PORT', 6379);
  }

  get swaggerUser(): string {
    return this.config.getOrThrow('SWAGGER_USER');
  }

  get swaggerPassword(): string {
    return this.config.getOrThrow('SWAGGER_PASSWORD');
  }

  get resendApiKey(): string {
    return this.config.getOrThrow('RESEND_API_KEY');
  }

  get mailFrom(): string {
    return this.config.get('MAIL_FROM') || 'onboarding@resend.dev';
  }
}
