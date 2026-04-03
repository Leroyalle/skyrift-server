import type { SkillType } from 'src/realtime/skill-session/domain/types/skill-session.type';

type ActionRule = {
  chainAutoAttack: boolean;
};

export const actionRules: Record<SkillType, ActionRule> = {
  Target: { chainAutoAttack: true },
  AoE: { chainAutoAttack: false },
  Self: { chainAutoAttack: false },
  Passive: { chainAutoAttack: false },
  Buff: { chainAutoAttack: false },
  Debuff: { chainAutoAttack: false },
};
