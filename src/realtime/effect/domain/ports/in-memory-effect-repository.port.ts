import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { EffectType, IEffect } from '../types/effect.type';

export interface InMemoryEffectRepositoryPort {
  add(entityRef: IEntityRef, effect: IEffect): void;
  get(ref: IEntityRef, type: EffectType): IEffect[] | null;
  remove(ref: IEntityRef): void;
  getAll(): Iterable<{ entityRef: IEntityRef; type: EffectType; effects: IEffect[] }>;
  set(entityRef: IEntityRef, map: Map<EffectType, IEffect[]>): void;
}
