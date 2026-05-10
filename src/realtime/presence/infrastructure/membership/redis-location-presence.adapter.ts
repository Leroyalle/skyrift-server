import { REDIS_ADAPTER_TOKEN, type RedisAdapterPort } from 'src/infrastructure/redis';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';

import { Inject, Injectable } from '@nestjs/common';

import type { LocationPresenceAdapterPort } from '../../application/ports/location-presence-adapter.port';

@Injectable()
export class RedisLocationPresenceAdapter implements LocationPresenceAdapterPort {
  constructor(@Inject(REDIS_ADAPTER_TOKEN) private readonly redisAdapter: RedisAdapterPort) {}

  public addPlayer(playerId: string, locationId: string): Promise<void> {
    return this.redisAdapter.sadd(RedisKeys.Location + locationId, playerId);
  }

  public removePlayer(playerId: string, locationId: string) {
    return this.redisAdapter.srem(RedisKeys.Location + locationId, playerId);
  }

  public getPlayers(locationId: string) {
    return this.redisAdapter.smembers(RedisKeys.Location + locationId);
  }
}
