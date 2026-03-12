import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DailyUpdateModule } from './modules/daily-updates/daily-update.module';
import { MailModule } from './modules/mail/mail.module';
import { AppConfigModule } from './common/config/app-config.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { DatabaseModule } from './core/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { EventsModule } from './modules/events/events.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

import { CacheInterceptor } from './common/interceptors/cache.interceptor';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RedisModule,
    EventsModule,
    UsersModule,
    AuthModule,
    DailyUpdateModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
