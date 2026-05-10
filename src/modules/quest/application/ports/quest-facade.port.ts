import { IQuest } from '../../domain/types/quest.type';

export interface QuestFacadePort {
  create(payload: Omit<IQuest, 'id'>): Promise<IQuest>;
  remove(id: string): Promise<void>;
}
