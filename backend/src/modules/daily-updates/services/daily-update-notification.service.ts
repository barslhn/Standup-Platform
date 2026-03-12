import { Injectable, Logger } from '@nestjs/common';
import { dailyUpdates } from '../../../core/database/schema';
import { EventsGateway } from '../../events/events.gateway';
import { UserRepository } from '../../users/user.repository';

@Injectable()
export class DailyUpdateNotificationService {
  private readonly logger = new Logger(DailyUpdateNotificationService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly gateway: EventsGateway,
  ) {}

  async notifyUpdateChanged(
    updateData: typeof dailyUpdates.$inferSelect,
    action: 'create' | 'patch',
  ) {
    try {
      const [managers, user] = await Promise.all([
        this.userRepo.findAllManagers(),
        this.userRepo.findById(updateData.userId),
      ]);

      const payload = {
        action,
        updateId: updateData.id,
        user: { id: user?.id, name: user?.name, email: user?.email },
        date: updateData.date,
        hasBlocker: updateData.hasBlocker,
      };

      managers.forEach((manager) => {
        this.gateway.sendToUser(manager.id, 'update_changed', payload);
      });
    } catch (error) {
      this.logger.error('Update changed notification failed:', error);
    }
  }

  async notifyManagersAboutBlocker(updateData: typeof dailyUpdates.$inferSelect) {
    try {
      const [managers, user] = await Promise.all([
        this.userRepo.findAllManagers(),
        this.userRepo.findById(updateData.userId),
      ]);

      const payload = {
        updateId: updateData.id,
        user: { id: user?.id, name: user?.name, email: user?.email },
        blockers: updateData.blockers,
        date: updateData.date,
      };

      managers.forEach((manager) => {
        this.gateway.sendToUser(manager.id, 'new_blocker', payload);
      });
    } catch (error) {
      this.logger.error('Blocker notification failed:', error);
    }
  }
}
