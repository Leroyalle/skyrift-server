export type QuestStep = KillStep | CollectStep | TalkStep;

interface BaseQuestStep {
  id: string;
  description?: string;
}

export interface KillStep extends BaseQuestStep {
  type: 'kill';
  target: 'mob' | 'npc';
  mobTemplateId: string;
  count: number;
}
export interface CollectStep extends BaseQuestStep {
  type: 'collect';
  itemTemplateId: string;
  count: number;
}
export interface TalkStep extends BaseQuestStep {
  type: 'talk';
  npcId: string;
}
