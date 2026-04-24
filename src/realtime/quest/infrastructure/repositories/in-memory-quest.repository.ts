import type { Quest } from 'src/modules/quest/domain/entities/quest.entity';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import type { InMemoryQuestRepositoryPort } from '../../domain/ports/in-memory-quest-repository.port';

export class InMemoryQuestRepository implements InMemoryQuestRepositoryPort {
  private readonly quests: Map<string, Quest> = new Map();
  private readonly questsByGiverId: Map<string, Set<string>> = new Map();

  public getById(id: string) {
    return this.quests.get(id);
  }

  public save(quest: Quest) {
    const giverQuests = getOrCreate(this.questsByGiverId, quest.giverId, () => new Set());
    giverQuests.add(quest.id);
    this.quests.set(quest.id, quest);
  }

  public remove(id: string, giverId: string) {
    this.questsByGiverId.get(giverId)?.delete(id);
    this.quests.delete(id);
  }

  public getByGiverId(giverId: Quest['giverId']): Quest[] {
    const questsIds = this.questsByGiverId.get(giverId);

    if (!questsIds) return [];

    return [...questsIds].map(id => this.quests.get(id) as Quest);
  }
}
