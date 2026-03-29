import type { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';

export interface InMemoryPlayerQuestRepositoryPort {
  getById(id: string): PlayerQuest | undefined;
  save(quest: PlayerQuest): void;
  remove(id: string): void;
}
