import { RedisModule } from 'src/infrastructure/redis/redis.module';

import { Module } from '@nestjs/common';

import {
  CONNECTION_PRESENCE_ADAPTER_TOKEN,
  LOCATION_PRESENCE_ADAPTER_TOKEN,
} from './application/ports/tokens';
import { RedisConnectionPresenceAdapter } from './infrastructure/membership/redis-connection-presence.adapter';
import { RedisLocationPresenceAdapter } from './infrastructure/membership/redis-location-presence.adapter';

@Module({
  imports: [RedisModule],
  providers: [
    { provide: LOCATION_PRESENCE_ADAPTER_TOKEN, useClass: RedisLocationPresenceAdapter },
    { provide: CONNECTION_PRESENCE_ADAPTER_TOKEN, useClass: RedisConnectionPresenceAdapter },
  ],
  exports: [LOCATION_PRESENCE_ADAPTER_TOKEN, CONNECTION_PRESENCE_ADAPTER_TOKEN],
})
export class PresenceModule {}
