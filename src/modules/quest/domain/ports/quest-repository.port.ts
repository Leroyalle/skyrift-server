import type { Quest } from '../entities/quest.entity';

export interface QuestRepositoryPort {
  findByGiverId(giverId: string): Promise<Quest[]>;
  findById(id: string): Promise<Quest | null>;
  findAll(): Promise<Quest[]>;
  save(quest: Quest): Promise<Quest>;
  remove(id: string): Promise<void>;
  update(quest: Quest): Promise<void>;
}
