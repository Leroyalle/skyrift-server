// import { CharacterActionState } from 'src/characters/character/types/runtime-character';
// import { MobActionState } from 'src/game/services/characters/runtime-mob/types/runtime-mob.type';
// import { NpcActionState } from 'src/game/services/characters/runtime-npc/types/runtime-npc.type';
// import { EntityRef } from 'src/game/types/entity/entity-ref.type';
// import { EntityType } from 'src/game/types/entity/entity-type.type';
import type { IEntityRef, IEntityType } from 'src/realtime/shared/types/entity-ref.type';

export interface RuntimeActorEntity<E extends IEntityType>
  extends ActorRuntimeStats, UniqueFields, IActorState<E> {
  type: E;
}

export interface ActorRuntimeStats {
  lastHpRegenerationTime: number;
  lastAttackAt: number;
  lastMoveAt: number;
  isAttacking: boolean;
  currentTarget: IEntityRef | null;
}

interface IActorState<E extends keyof ActorStateMap> {
  state: ActorStateMap[E];
}

export interface UniqueFields {
  locationId: string;
}

type ActorStateMap = {
  player: never;
  mob: never;
  npc: never;
};
