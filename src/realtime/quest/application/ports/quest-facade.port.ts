import type { IQuest } from 'src/modules/quest';

export interface QuestFacadePort {
  save(payload: IQuest): void;
}
