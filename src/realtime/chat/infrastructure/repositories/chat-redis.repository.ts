import { REDIS_ADAPTER_TOKEN, type RedisAdapterPort } from 'src/infrastructure/redis';

import { Inject, Injectable } from '@nestjs/common';

import type { Message } from '../../domain/entities/message.entity';
import type { ChatRepositoryPort } from '../../domain/ports/chat-repository.port';

import { getRedisKeyByMessageType } from './lib/get-regis-key-by-message-type.lib';

@Injectable()
export class ChatRedisRepository implements ChatRepositoryPort {
  constructor(@Inject(REDIS_ADAPTER_TOKEN) private readonly redisAdapter: RedisAdapterPort) {}

  public async add(message: Message, recipientId?: string) {
    const snapshot = message.snapshot();
    const redisKey = getRedisKeyByMessageType(snapshot, recipientId);
    await this.redisAdapter.lpush(redisKey, snapshot);
    await this.redisAdapter.ltrim(redisKey, 0, 99);
  }
}
