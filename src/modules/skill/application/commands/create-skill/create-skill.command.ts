import type { SkillType, SkillVisualEffect } from 'src/modules/skill/domain/types/skill.type';

interface Props {
  id: string;
  classId: string;
  name: string;
  icon: string;
  cooldownMs: number;
  manaCost: number;
  damage: number;
  heal: number;
  range: number;
  areaRadius?: number;
  damagePerSecond?: number;
  duration?: number;
  type: SkillType;
  tilesetKey: string;
  visualEffects?: SkillVisualEffect[];
  extraParams?: Record<string, any>;
}

export class CreateSkillCommand {
  constructor(public readonly props: Props) {}
}
