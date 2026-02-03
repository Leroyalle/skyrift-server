import { EntityRef } from 'src/game/types/entity/entity-ref.type';

export type QuestStep = KillStep | CollectStep | TalkStep;

interface BaseQuestStep {
  id: string;
  description?: string;
}

export interface KillStep extends BaseQuestStep {
  type: StepType.Kill;
  entityRef: EntityRef;
  count: number;
}
export interface CollectStep extends BaseQuestStep {
  type: StepType.Collect;
  itemTemplateId: string;
  count: number;
}
export interface TalkStep extends BaseQuestStep {
  type: StepType.Talk;
  npcId: string;
}

export enum StepType {
  Kill = 'kill',
  Collect = 'collect',
  Talk = 'talk',
}
