import { SkillType } from 'src/common/enums/skill/skill-type.enum';

type ActionRule = {
  chainAutoAttack: boolean;
};

export const actionRules: Record<SkillType, ActionRule> = {
  [SkillType.Target]: { chainAutoAttack: true },
  [SkillType.AoE]: { chainAutoAttack: false },
  [SkillType.Self]: { chainAutoAttack: false },
  [SkillType.Passive]: { chainAutoAttack: false },
  [SkillType.Buff]: { chainAutoAttack: false },
  [SkillType.Debuff]: { chainAutoAttack: false },
};
