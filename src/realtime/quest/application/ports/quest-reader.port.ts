import type { IQuest } from 'src/modules/quest';

export interface QuestReaderPort {
  findByGiverId(giverId: string): IQuest[];
}
