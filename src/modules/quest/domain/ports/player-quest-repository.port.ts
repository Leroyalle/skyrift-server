import type { PlayerQuest } from '../entities/player-quest.entity';

export interface PlayerQuestRepositoryPort {
  findByCharacterId(characterId: string): Promise<PlayerQuest[]>;
  findById(id: string): Promise<PlayerQuest | null>;
  save(playerQuest: PlayerQuest): Promise<void>;
}
