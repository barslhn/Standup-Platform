import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, mergeMap, map } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { CACHE_TTL_KEY } from '../decorators/cacheable.decorator';
import type { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!ttl) {
      return next.handle();
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { sub?: string; role?: string } }>();
    const cacheKey = this.buildCacheKey(request);

    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`[CACHE HIT]  ${cacheKey}`);
      const data = JSON.parse(cachedData) as unknown;
      return of({
        data,
        meta: {
          isCached: true,
          cachedAt: new Date().toISOString(),
        },
      });
    }

    this.logger.debug(`[CACHE MISS] ${cacheKey} (TTL: ${ttl}s)`);

    return next.handle().pipe(
      mergeMap(async (data: unknown) => {
        if (data !== undefined && data !== null) {
          await this.redisService.set(cacheKey, JSON.stringify(data), ttl);
        }
        return data;
      }),
      map((data) => ({
        data,
        meta: {
          isCached: false,
        },
      })),
    );
  }

  private buildCacheKey(request: Request & { user?: { sub?: string; role?: string } }): string {
    const method = request.method.toUpperCase();
    const path = request.path;
    const query = this.serializeQuery(request.query);
    const role = request.user?.role;
    const userId = request.user?.sub;

    const keyParts = [`cache:http:${method}:${path}`];

    if (query) {
      keyParts.push(`?${query}`);
    }

    if (role) {
      keyParts.push(`:role=${role}`);
    }

    if (userId) {
      keyParts.push(`:user=${userId}`);
    }

    return keyParts.join('');
  }

  private serializeQuery(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serializeQuery(item)).join(',');
    }

    if (typeof value !== 'object') {
      return '';
    }

    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null)
      .sort(([a], [b]) => a.localeCompare(b));

    return entries
      .map(
        ([key, entryValue]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(this.serializeQuery(entryValue))}`,
      )
      .join('&');
  }
}
