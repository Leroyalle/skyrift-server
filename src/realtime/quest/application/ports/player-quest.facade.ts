import type { IPlayerQuest } from 'src/modules/quest';

export interface PlayerQuestFacadePort {
  save(payload: IPlayerQuest): void;
}
