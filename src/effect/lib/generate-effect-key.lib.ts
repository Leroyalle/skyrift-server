import { EffectKey } from '../types/effect-key.type';
import { EffectRef } from '../types/effect-ref.type';

export function generateEffectKey<T extends EffectRef>(ref: T): EffectKey {
  return `${ref.type}:${ref.durationMs}`;
}
