import type { EffectType } from 'src/realtime/skill-session/domain/types/skill-session.type';

export interface ActiveAoEZone {
  id: string;
  skillId: string;
  casterId: string;
  locationId: string;
  x: number;
  y: number;
  radius: number;
  effects: SkillEffectConfig[];
  lastUsedAt: number;
  expiresAt: number;
}

interface SkillEffectConfig {
  type: EffectType;
  damagePerSecond?: number;
  durationMs?: number;
  amount?: number;
  slowPercent?: number;
}
