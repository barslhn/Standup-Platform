import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../common/config/env';
import * as schema from './schema';

export const createDrizzleClient = (config: ConfigService<Env, true>) => {
  const databaseUrl = config.get<string>('DATABASE_URL');

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
  });

  return drizzle(pool, { schema });
};
