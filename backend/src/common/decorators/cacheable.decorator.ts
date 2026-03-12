import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_KEY = 'cache_ttl';

export const Cacheable = (ttlSeconds = 60) => SetMetadata(CACHE_TTL_KEY, ttlSeconds);
