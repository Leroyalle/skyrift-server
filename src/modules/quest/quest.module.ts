import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlayerQuestReader } from './application/facades/player-quest.reader';
import { QuestFacade } from './application/facades/quest.facade';
import { QuestReader } from './application/facades/quest.reader';
import {
  PLAYER_QUEST_READER_TOKEN,
  PLAYER_QUEST_REPOSITORY_TOKEN,
  QUEST_FACADE_TOKEN,
  QUEST_READER_TOKEN,
  QUEST_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { PlayerQuestOrmEntity } from './infrastructure/persistence/entities/player-quest-orm.entity';
import { QuestOrmEntity } from './infrastructure/persistence/entities/quest-orm.entity';
import { PlayerQuestRepository } from './infrastructure/persistence/repositories/player-quest.repository';
import { QuestPersistenceRepository } from './infrastructure/persistence/repositories/quest.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerQuestOrmEntity, QuestOrmEntity])],
  providers: [
    {
      provide: QUEST_REPOSITORY_TOKEN,
      useClass: QuestPersistenceRepository,
    },
    {
      provide: QUEST_READER_TOKEN,
      useClass: QuestReader,
    },
    {
      provide: PLAYER_QUEST_REPOSITORY_TOKEN,
      useClass: PlayerQuestRepository,
    },
    {
      provide: PLAYER_QUEST_READER_TOKEN,
      useClass: PlayerQuestReader,
    },
    {
      provide: QUEST_FACADE_TOKEN,
      useClass: QuestFacade,
    },
  ],
  exports: [QUEST_READER_TOKEN, PLAYER_QUEST_READER_TOKEN, QUEST_FACADE_TOKEN],
})
export class QuestModule {}
