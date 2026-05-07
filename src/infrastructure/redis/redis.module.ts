import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { REDIS_ADAPTER_TOKEN } from './application/ports/tokens';
import { REDIS_CLIENT_CONFIG } from './infrastructure/client/redis-client.config';
import { RedisAdapter } from './infrastructure/client/redis.adapter';

@Module({
  imports: [ConfigModule],
  providers: [REDIS_CLIENT_CONFIG, { provide: REDIS_ADAPTER_TOKEN, useClass: RedisAdapter }],
  exports: [REDIS_ADAPTER_TOKEN],
})
export class RedisModule {}
