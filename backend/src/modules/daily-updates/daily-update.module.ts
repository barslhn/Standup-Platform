import { Module } from '@nestjs/common';
import { DailyUpdateController } from './daily-update.controller';
import { DailyUpdateService } from './daily-update.service';
import { DailyUpdateRepository } from './daily-update.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [DailyUpdateController],
  providers: [DailyUpdateService, DailyUpdateRepository],
  exports: [DailyUpdateService],
})
export class DailyUpdateModule {}
