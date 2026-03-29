import type { Quest } from 'src/modules/quest/domain/entities/quest.entity';

export interface InMemoryQuestRepositoryPort {
  getById(id: string): Quest | undefined;
  save(quest: Quest): void;
  remove(id: string): void;
}
