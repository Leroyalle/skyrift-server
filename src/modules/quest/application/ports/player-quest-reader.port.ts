import type { IPlayerQuest } from '../../domain/types/player-quest.type';

export interface PlayerQuestReaderPort {
  findById(id: string): Promise<IPlayerQuest | null>;
  findByCharacterId(characterId: string): Promise<IPlayerQuest[]>;
}
