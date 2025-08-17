import { BatchUpdateAction } from '../batch-update/batch-update-action.type';

export type ApplySkillResult = {
  attackResult: BatchUpdateAction;
  cooldown: CooldownResult;
};

export type CooldownResult = {
  skillId: string;
  cooldownEnd: number;
};
