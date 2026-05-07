import { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';
import type { DeepPartial } from 'typeorm';

import type { PlayerQuestOrmEntity } from '../entities/player-quest-orm.entity';

export class PlayerQuestMapper {
  public static toPersistence = (domain: PlayerQuest): DeepPartial<PlayerQuestOrmEntity> => {
    const snapshot = domain.snapshot();

    return {
      characterId: snapshot.characterId,
      stepIndex: snapshot.stepIndex,
      progress: snapshot.progress,
      questId: snapshot.questId,
      id: snapshot.id,
      completedAt: snapshot.completedAt,
    };
  };

  public static toDomain = (persistence: PlayerQuestOrmEntity): PlayerQuest => {
    return PlayerQuest.create({
      characterId: persistence.characterId,
      stepIndex: persistence.stepIndex,
      progress: persistence.progress,
      questId: persistence.questId,
      id: persistence.id,
      completedAt: persistence.completedAt,
    });
  };
}
