export interface ISkill {
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

export type SkillType = 'Target' | 'AoE' | 'Self' | 'Passive' | 'Buff' | 'Debuff';

export interface SkillVisualEffect {
  type: 'animation' | 'particle' | 'sound';
  assetKey: string;
  durationMs?: number;
  frameRate?: number;
  offset?: { x: number; y: number };
}
