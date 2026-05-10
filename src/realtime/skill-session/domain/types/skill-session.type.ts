import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface ISkillSession {
  id: string;
  skill: ISkill;
  ownerRef: IEntityRef;
  lastUsedAt: number;
  cooldownEnd: number;
  level: number;
}

interface ISkill {
  id: string;
  classId: string;
  name: string;
  icon: string;
  cooldownMs: number;
  manaCost: number;
  damage: number;
  heal: number;
  range: number;
  effects: IEffect[];
  areaRadius?: number;
  damagePerSecond?: number;
  duration?: number;
  type: SkillType;
  tilesetKey: string;
  visualEffects?: SkillVisualEffect[];
  extraParams?: Record<string, unknown>;
}

export type SkillType = 'Target' | 'AoE' | 'Self' | 'Passive' | 'Buff' | 'Debuff';

export interface SkillVisualEffect {
  type: 'animation' | 'particle' | 'sound';
  assetKey: string;
  durationMs?: number;
  frameRate?: number;
  offset?: { x: number; y: number };
}

export interface IEffect {
  id: string;
  type: EffectType;
  damagePerSecond?: number;
  durationMs: number;
  amount?: number;
  slowPercent?: number;
  skillId: string;
}

export type EffectType =
  | 'instant_damage'
  | 'damage_over_time'
  | 'heal'
  | 'shield'
  | 'speed_boost'
  | 'slow'
  | 'stun';
