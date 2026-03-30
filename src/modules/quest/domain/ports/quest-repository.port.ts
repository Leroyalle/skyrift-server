import type { Quest } from '../entities/quest.entity';

export interface QuestRepositoryPort {
  findByCharacterId(characterId: string): Promise<Quest[]>;
  findById(id: string): Promise<Quest | null>;
  save(quest: Quest): Promise<void>;
  remove(id: string): Promise<void>;
  update(quest: Quest): Promise<void>;
}
