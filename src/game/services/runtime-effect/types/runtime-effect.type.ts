import { Effect } from 'src/effect/entities/effect.entity';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { IRuntimeExpirable } from 'src/game/types/runtime-expirable.type';

export interface IRuntimeEffect extends Effect, IRuntimeExpirable {
  attackerRef: EntityRef;
}
