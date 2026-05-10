import type { EffectType } from 'src/realtime/effect/domain/types/effect.type';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { ActionType } from './action-queue.type';

export interface BatchUpdateAction {
  targets: Target[];
  type: ActionType;
  skillId: string | null;
}

export interface Target extends IEntityRef {
  hp: number;
  isAlive: boolean;
  receivedDamage: number;
  appliedEffects?: EffectApplied[];
}

export interface EffectApplied {
  effectType: EffectType;
  magnitude?: number;
  durationMs: number;
  expiresAt: number;
}
