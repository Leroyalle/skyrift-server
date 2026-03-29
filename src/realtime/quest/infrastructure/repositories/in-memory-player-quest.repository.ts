import type { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';

import type { InMemoryPlayerQuestRepositoryPort } from '../../domain/ports/in-memory-player-quest-repository.port';

export class InMemoryPlayerQuestRepository implements InMemoryPlayerQuestRepositoryPort {
  private readonly quests: Map<string, PlayerQuest> = new Map();

  public getById(id: string) {
    return this.quests.get(id);
  }

  public save(quest: PlayerQuest) {
    this.quests.set(quest.id, quest);
  }

  public remove(id: string) {
    this.quests.delete(id);
  }
}
