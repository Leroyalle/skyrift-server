import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { EffectType } from 'src/realtime/skill-session/domain/types/skill-session.type';

export interface AoeZone {
  id: string;
  skillId: string;
  casterRef: IEntityRef;
  locationId: string;
  x: number;
  y: number;
  radius: number;
  effects: SkillEffectConfig[];
  lastUsedAt: number;
  expiresAt: number;
}

export interface SkillEffectConfig {
  type: EffectType;
  magnitude?: number;
  durationMs?: number;
  amount?: number;
  slowPercent?: number;
}
