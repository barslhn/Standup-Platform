import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../common/redis/redis.service';

@Injectable()
export class DailyUpdateCacheService {
  private readonly logger = new Logger(DailyUpdateCacheService.name);

  constructor(private readonly redisService: RedisService) {}

  async invalidateListCache() {
    const deletedCount = await this.invalidateCachePatterns([
      'cache:http:GET:/updates*',
      'cache:http:GET:/updates/stats/team*',
    ]);

    this.logger.debug(`Updates list cache cleared. Deleted records: ${deletedCount}`);
  }

  async invalidateItemCache(id: string) {
    const deletedCount = await this.invalidateCachePatterns([
      `cache:http:GET:/updates/${id}*`,
      `cache:http:GET:/updates/${id}/versions*`,
    ]);

    this.logger.debug(`Update ${id} detail cache cleared. Deleted records: ${deletedCount}`);
  }

  async invalidatePolicyCache() {
    const deletedCount = await this.invalidateCachePatterns(['cache:http:GET:/updates/policy*']);
    this.logger.debug(`Stand-up policy cache cleared. Deleted records: ${deletedCount}`);
  }

  private async invalidateCachePatterns(patterns: string[]): Promise<number> {
    let totalDeleted = 0;

    for (const pattern of patterns) {
      totalDeleted += await this.redisService.deleteByPattern(pattern);
    }

    return totalDeleted;
  }
}
