import type { IQuest } from '../../domain/types/quest.type';

export interface QuestReaderPort {
  findByGiverId(giverId: string): Promise<IQuest[]>;
  findById(id: string): Promise<IQuest | null>;
  findAll(): Promise<IQuest[]>;
}
