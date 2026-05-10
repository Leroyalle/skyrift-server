import { StepType } from './quest-step.type';

export type QuestProgress<T extends StepType> = QuestProgressByType[T];

export type QuestProgressByType = {
  [StepType.Kill]: KillProgress;
  [StepType.Talk]: TalkProgress;
  [StepType.Collect]: CollectProgress;
};

export type KillProgress = {
  current: number;
  required: number;
  type: 'kill';
};

export type TalkProgress = {
  npcId: string;
  type: 'talk';
};

export type CollectProgress = {
  current: number;
  required: number;
  type: 'collect';
};
