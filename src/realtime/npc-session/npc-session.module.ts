import { Module } from '@nestjs/common';

import { NpcSessionFacade } from './application/facades/npc-session.facade';
import { NpcSessionReader } from './application/facades/npc-session.reader';
import {
  NPC_SESSION_FACADE_TOKEN,
  NPC_SESSION_READER_TOKEN,
  NPC_SESSION_REPOSITORY_TOKEN,
  SPAWN_NPC_SESSION_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { SpawnNpcSessionUseCase } from './application/use-cases/spawn-npc-session.use-case';
import { NpcSessionRepository } from './infrastructure/repositories/npc-session.repository';

@Module({
  providers: [
    {
      provide: NPC_SESSION_REPOSITORY_TOKEN,
      useClass: NpcSessionRepository,
    },
    {
      provide: NPC_SESSION_READER_TOKEN,
      useClass: NpcSessionReader,
    },
    {
      provide: SPAWN_NPC_SESSION_USE_CASE_TOKEN,
      useClass: SpawnNpcSessionUseCase,
    },
    {
      provide: NPC_SESSION_FACADE_TOKEN,
      useClass: NpcSessionFacade,
    },
  ],
  exports: [NPC_SESSION_READER_TOKEN, SPAWN_NPC_SESSION_USE_CASE_TOKEN, NPC_SESSION_FACADE_TOKEN],
})
export class NpcSessionModule {}
