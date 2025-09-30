import { EffectType } from 'src/common/enums/skill/effect-type.enum';

export interface EffectRef {
  durationMs: number;
  type: EffectType;
}
