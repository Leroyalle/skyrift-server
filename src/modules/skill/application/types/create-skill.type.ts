import { SkillType, SkillVisualEffect } from '../../domain/types/skill.type';

export interface CreateSkillProps {
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
