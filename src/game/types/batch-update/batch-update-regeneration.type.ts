import { EntityRef } from '../entity/entity-ref.type';

export interface BatchUpdateRegeneration extends EntityRef {
  hp: number;
  hpDelta: number;
}
