import {
  CharacterActionState,
  LiveCharacter,
} from 'src/character/types/runtime-character';
import {
  MobActionState,
  RuntimeMob,
} from 'src/game/services/runtime-mob/types/runtime-mob.type';
import { WorldEntity } from 'src/game/types/entity/runtime-entity.type';
import { isMob } from '../../guards/is-mob.lib';
import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';

type EntityState<T> = T extends LiveCharacter
  ? CharacterActionState
  : T extends RuntimeMob
    ? MobActionState
    : BaseEntityStates;

export const setEntityState = <T>(
  entity: WorldEntity,
  state: EntityState<T>,
) => {
  if (isMob(entity)) {
    entity.mob.state = state;
  }
};
