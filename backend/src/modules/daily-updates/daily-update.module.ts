import { Module } from '@nestjs/common';
import { DailyUpdateController } from './daily-update.controller';
import { DailyUpdateService } from './daily-update.service';
import { DailyUpdateRepository } from './daily-update.repository';
import { UsersModule } from '../users/users.module';
import { DailyUpdateCacheService } from './services/daily-update-cache.service';
import { DailyUpdateNotificationService } from './services/daily-update-notification.service';

@Module({
  imports: [UsersModule],
  controllers: [DailyUpdateController],
  providers: [
    DailyUpdateService,
    DailyUpdateRepository,
    DailyUpdateCacheService,
    DailyUpdateNotificationService,
  ],
  exports: [DailyUpdateService],
})
export class DailyUpdateModule {}
