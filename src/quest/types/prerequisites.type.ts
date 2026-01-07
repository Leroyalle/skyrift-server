export type QuestPrerequisite =
  | QuestCompletedPrerequisite
  | LevelPrerequisite
  | CooldownPrerequisite;

export interface QuestCompletedPrerequisite {
  type: 'quest_completed';
  questId: string;
}

export interface LevelPrerequisite {
  type: 'level';
  minLevel: number;
}
export interface CooldownPrerequisite {
  type: 'cooldown';
  hours: number;
}
