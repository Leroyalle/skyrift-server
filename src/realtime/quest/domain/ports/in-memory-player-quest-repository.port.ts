import type { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';

export interface InMemoryPlayerQuestRepositoryPort {
  getById(id: string): PlayerQuest | undefined;
  save(quest: PlayerQuest, characterId: string): void;
  remove(id: string, characterId: string): void;
  findActiveByCharacterId(characterId: string): PlayerQuest[];
  findCompletedIdsByCharacterId(characterId: string): PlayerQuest[];
}
