import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IEffect } from '../types/effect.type';

export interface InMemoryEffectRepositoryPort {
  set(entityRef: IEntityRef, effect: IEffect): void;
  get(id: IEntityKey): IEffect | null;
  remove(id: IEntityKey): void;
}
