import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface BatchUpdateRegeneration extends IEntityRef {
  hp: number;
  hpDelta: number;
}
