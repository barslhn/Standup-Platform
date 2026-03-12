import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../common/config/env';
import { createDrizzleClient } from './index';

export const DRIZZLE = 'DRIZZLE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => createDrizzleClient(config),
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
