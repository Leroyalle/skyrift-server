import { Module } from '@nestjs/common';

import { PlayerQuestFacade } from './application/facades/player-quest.facade';
import { QuestFacade } from './application/facades/quest.facade';
import { QuestReader } from './application/facades/quest.reader';
import {
  ACCEPT_QUEST_USE_CASE_TOKEN,
  HANDLE_ENTITY_KILLED_USE_CASE_TOKEN,
  PLAYER_QUEST_FACADE_TOKEN,
  PLAYER_QUEST_REPOSITORY_TOKEN,
  QUEST_FACADE_TOKEN,
  QUEST_READER_TOKEN,
  QUEST_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { AcceptQuestUseCase } from './application/use-cases/accept-quest.use-case';
import { HandleEntityKilledUseCase } from './application/use-cases/handle-entity-killed.use-case';
import { InMemoryPlayerQuestRepository } from './infrastructure/repositories/in-memory-player-quest.repository';
import { InMemoryQuestRepository } from './infrastructure/repositories/in-memory-quest.repository';

@Module({
  providers: [
    {
      provide: PLAYER_QUEST_REPOSITORY_TOKEN,
      useClass: InMemoryPlayerQuestRepository,
    },
    {
      provide: QUEST_REPOSITORY_TOKEN,
      useClass: InMemoryQuestRepository,
    },
    {
      provide: QUEST_FACADE_TOKEN,
      useClass: QuestFacade,
    },
    {
      provide: PLAYER_QUEST_FACADE_TOKEN,
      useClass: PlayerQuestFacade,
    },
    {
      provide: QUEST_READER_TOKEN,
      useClass: QuestReader,
    },
    {
      provide: ACCEPT_QUEST_USE_CASE_TOKEN,
      useClass: AcceptQuestUseCase,
    },
    {
      provide: HANDLE_ENTITY_KILLED_USE_CASE_TOKEN,
      useClass: HandleEntityKilledUseCase,
    },
  ],
  exports: [
    QUEST_FACADE_TOKEN,
    PLAYER_QUEST_FACADE_TOKEN,
    QUEST_READER_TOKEN,
    ACCEPT_QUEST_USE_CASE_TOKEN,
    HANDLE_ENTITY_KILLED_USE_CASE_TOKEN,
  ],
})
export class QuestModule {}
