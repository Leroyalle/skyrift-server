import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { SocketModule } from 'src/infrastructure/ws/socket.module';

import { Module } from '@nestjs/common';

import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';

import { CHAT_REPOSITORY_TOKEN, SEND_MESSAGE_USE_CASE_TOKEN } from './application/ports/tokens';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { ChatRedisRepository } from './infrastructure/repositories/chat-redis.repository';

@Module({
  imports: [RedisModule, EntityRegistryModule, SocketModule],
  providers: [
    {
      provide: CHAT_REPOSITORY_TOKEN,
      useClass: ChatRedisRepository,
    },
    {
      provide: SEND_MESSAGE_USE_CASE_TOKEN,
      useClass: SendMessageUseCase,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [SEND_MESSAGE_USE_CASE_TOKEN],
})
export class ChatModule {}
