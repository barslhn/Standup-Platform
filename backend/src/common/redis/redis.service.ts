import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(private readonly configService: AppConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.redisHost,
      port: this.configService.redisPort,
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let totalDeleted = 0;

    do {
      const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        totalDeleted += await this.client.del(...keys);
      }
    } while (cursor !== '0');

    return totalDeleted;
  }

  async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const luaScript = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      local clearBefore = now - window

      -- Pencere dışındaki eski kayıtları temizle

      redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
      
      -- Mevcut istek sayısını al

      local amount = redis.call('ZCARD', key)

      if amount < limit then
        -- Limit aşılmadıysa yeni isteği ekle

          redis.call('ZADD', key, now, now)
          redis.call('PEXPIRE', key, window)
          return {1, 0}
      else
          -- Limit aşıldıysa en eski isteğin window dışında kalacağı süreyi hesapla
        
          local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
          local retryAfter = 0
          if #oldest > 0 then
              retryAfter = math.ceil((tonumber(oldest[2]) + window - now) / 1000)
          end
          return {0, retryAfter}
      end
    `;

    const result = (await this.client.eval(
      luaScript,
      1,
      key,
      now.toString(),
      windowMs.toString(),
      limit.toString(),
    )) as [number, number];

    return {
      allowed: result[0] === 1,
      retryAfter: result[1] > 0 ? result[1] : undefined,
    };
  }
}
