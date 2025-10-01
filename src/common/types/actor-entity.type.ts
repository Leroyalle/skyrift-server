import {
  CharacterActionState,
  IRuntimeCharacter,
} from 'src/character/types/runtime-character';
import {
  MobActionState,
  IRuntimeMob,
} from 'src/game/services/runtime-mob/types/runtime-mob.type';
import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';

export interface RuntimeActorEntity<E>
  extends ActorRuntimeStats<E>,
    UniqueFields {
  type: EntityType;
}

export interface ActorRuntimeStats<E> {
  lastHpRegenerationTime: number;
  lastAttackAt: number;
  lastMoveAt: number;
  isAttacking: boolean;
  currentTarget: EntityRef | null;
  state: ActorState<E>;
}

export interface UniqueFields {
  locationId: string;
}

type ActorState<E> = E extends IRuntimeCharacter
  ? CharacterActionState
  : E extends IRuntimeMob
    ? MobActionState
    : BaseEntityStates;
