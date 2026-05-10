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
