import { REDIS_ADAPTER_TOKEN, type RedisAdapterPort } from 'src/infrastructure/redis';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';

import { Inject, Injectable } from '@nestjs/common';

import { ConnectionPresenceAdapterPort } from '../../application/ports/connection-presence-adapter.port';

@Injectable()
export class RedisConnectionPresenceAdapter implements ConnectionPresenceAdapterPort {
  constructor(@Inject(REDIS_ADAPTER_TOKEN) private readonly redisAdapter: RedisAdapterPort) {}

  public async onConnect(userId: string, socketId: string): Promise<void> {
    await this.redisAdapter.set(RedisKeys.UserIdToSocketId + userId, socketId);
  }

  public async onDisconnect(userId: string): Promise<void> {
    await this.redisAdapter.get(RedisKeys.UserIdToSocketId + userId);
  }

  public get(userId: string): Promise<string | undefined | null> {
    return this.redisAdapter.get(RedisKeys.UserIdToSocketId + userId);
  }
}
