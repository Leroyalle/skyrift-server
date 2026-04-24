import { RedisModule } from 'src/infrastructure/redis/redis.module';

import { Module } from '@nestjs/common';

import { LOCATION_PRESENCE_ADAPTER_TOKEN } from './application/ports/tokens';
import { RedisLocationPresenceAdapter } from './infrastructure/membership/redis-location-presence.adapter';

@Module({
  imports: [RedisModule],
  providers: [{ provide: LOCATION_PRESENCE_ADAPTER_TOKEN, useClass: RedisLocationPresenceAdapter }],
  exports: [LOCATION_PRESENCE_ADAPTER_TOKEN],
})
export class PresenceModule {}
