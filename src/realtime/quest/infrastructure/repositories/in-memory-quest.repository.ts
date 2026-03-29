import type { Quest } from 'src/modules/quest/domain/entities/quest.entity';

import type { InMemoryQuestRepositoryPort } from '../../domain/ports/in-memory-quest-repository.port';

export class InMemoryQuestRepository implements InMemoryQuestRepositoryPort {
  private readonly quests: Map<string, Quest> = new Map();

  public getById(id: string) {
    return this.quests.get(id);
  }

  public save(quest: Quest) {
    this.quests.set(quest.id, quest);
  }

  public remove(id: string) {
    this.quests.delete(id);
  }
}
