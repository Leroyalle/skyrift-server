import { Effect } from 'src/effect/entities/effect.entity';

import { IRuntimeEffect } from '../types/runtime-effect.type';

export function buildRuntimeEffect(effect: Effect): IRuntimeEffect {
  const now = Date.now();
  return {
    ...effect,
    expiresAt: now + effect.durationMs,
    lastUsedAt: 0,
  };
}
