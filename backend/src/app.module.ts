import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppConfigModule } from './common/config/app-config.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RedisModule } from './common/redis/redis.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { DailyUpdateModule } from './modules/daily-updates/daily-update.module';
import { EventsModule } from './modules/events/events.module';
import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';

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
    consumer.apply(RequestIdMiddleware).forRoutes({
      path: '{*splat}',
      method: RequestMethod.ALL,
    });
  }
}