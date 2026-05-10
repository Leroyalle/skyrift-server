import type { Quest } from 'src/modules/quest/domain/entities/quest.entity';

export interface InMemoryQuestRepositoryPort {
  getById(id: Quest['id']): Quest | undefined;
  save(quest: Quest): void;
  remove(id: Quest['id'], giverId: Quest['giverId']): void;
  getByGiverId(giverId: Quest['giverId']): Quest[];
}
