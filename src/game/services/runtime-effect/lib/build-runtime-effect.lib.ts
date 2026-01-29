import { Effect } from 'src/effect/entities/effect.entity';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';

import { IRuntimeEffect } from '../types/runtime-effect.type';

export function buildRuntimeEffect(
  effect: Effect & {
    attackerRef: EntityRef;
  },
): IRuntimeEffect {
  const now = Date.now();
  return {
    ...effect,
    expiresAt: now + effect.durationMs,
    lastUsedAt: 0,
  };
}
