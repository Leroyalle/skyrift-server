import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface IEffect {
  type: EffectType;
  magnitude?: number;
  durationMs: number;
  amount?: number;
  slowPercent?: number;
  skillId: string;
  attackerRef: IEntityRef;
  lastUsedAt: number;
  expiresAt: number;
}

export type EffectType =
  | 'instant_damage'
  | 'damage_over_time'
  | 'heal'
  | 'shield'
  | 'speed_boost'
  | 'slow'
  | 'stun';
