import type {
  CooldownPrerequisite,
  LevelPrerequisite,
  QuestCompletedPrerequisite,
} from './prerequisites.type';
import type { CollectStep, KillStep, TalkStep } from './quest-step.type';

export interface IQuest {
  id: string;
  name: string;
  description: string;
  expReward: number;
  goldReward: number;
  itemRewards: {
    templateId: string;
    quantity: number;
  }[];
  steps: (KillStep | CollectStep | TalkStep)[];
  prerequisites: (QuestCompletedPrerequisite | LevelPrerequisite | CooldownPrerequisite)[] | null;
  giverNpcId: string;
}
