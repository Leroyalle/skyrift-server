import { TQuestState } from '../../characters/runtime-npc/types/npc-with-quest-state.type';
import { IRuntimeQuest } from '../services/quest/runtime-quest/types/runtime-quest.type';

export interface IQuestStartedPayload {
  quest: IRuntimeQuest;
  update: {
    npc: [
      {
        id: string;
        questState: TQuestState;
      },
    ];
  };
}
