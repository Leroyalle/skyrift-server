import type { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import type { InMemoryPlayerQuestRepositoryPort } from '../../domain/ports/in-memory-player-quest-repository.port';

export class InMemoryPlayerQuestRepository implements InMemoryPlayerQuestRepositoryPort {
  private readonly questById: Map<string, PlayerQuest> = new Map();
  private readonly questsByCharacterId: Map<string, Set<string>> = new Map();

  public getById(id: string) {
    return this.questById.get(id);
  }

  public save(quest: PlayerQuest) {
    this.questById.set(quest.id, quest);

    const characterQuests = getOrCreate(
      this.questsByCharacterId,
      quest.characterId,
      () => new Set(),
    );

    characterQuests.add(quest.id);
  }

  public remove(id: string, characterId: string) {
    this.questById.delete(id);
    const characterQuests = this.questsByCharacterId.get(characterId);
    if (characterQuests) {
      characterQuests.delete(id);
    }
  }

  private getAllByCharacterId(characterId: string, status: 'active' | 'completed') {
    const questIds = this.questsByCharacterId.get(characterId);
    if (!questIds) return [];
    return Array.from(questIds)
      .map(id => this.questById.get(id))
      .filter(
        (quest): quest is PlayerQuest =>
          !!quest && (status === 'completed' ? !!quest.completedAt : !quest.completedAt),
      );
  }

  public findActiveByCharacterId(characterId: string) {
    return this.getAllByCharacterId(characterId, 'active');
  }

  public findCompletedIdsByCharacterId(characterId: string) {
    return this.getAllByCharacterId(characterId, 'completed');
  }
}
