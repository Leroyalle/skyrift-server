import { Quest } from 'src/modules/quest/domain/entities/quest.entity';

import type { QuestOrmEntity } from '../entities/quest-orm.entity';

export class QuestMapper {
  public static toDomain = (entity: QuestOrmEntity): Quest => {
    return Quest.create({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      expReward: entity.expReward,
      steps: entity.steps,
      prerequisites: entity.prerequisites,
      itemRewards: entity.itemRewards,
      giverNpcId: entity.giverNpcId,
      goldReward: entity.goldReward,
    });
  };

  public static toPersistence = (quest: Quest): QuestOrmEntity => {
    const snapshot = quest.snapshot();
    return {
      prerequisites: snapshot.prerequisites,
      steps: snapshot.steps,
      name: snapshot.name,
      itemRewards: snapshot.itemRewards,
      id: snapshot.id,
      goldReward: snapshot.goldReward,
      giverNpcId: snapshot.giverNpcId,
      expReward: snapshot.expReward,
      description: snapshot.description,
    };
  };
}
