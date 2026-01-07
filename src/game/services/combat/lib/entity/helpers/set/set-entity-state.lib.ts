import {
  CharacterActionState,
  IRuntimeCharacter,
} from 'src/characters/character/types/runtime-character';
import {
  IRuntimeMob,
  MobActionState,
} from 'src/game/services/characters/runtime-mob/types/runtime-mob.type';
import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

import { isMob } from '../../guards/is-mob.lib';

type EntityState<T> = T extends IRuntimeCharacter
  ? CharacterActionState
  : T extends IRuntimeMob
    ? MobActionState
    : BaseEntityStates;

export const setEntityState = <T>(entity: TRuntimeEntity, state: EntityState<T>) => {
  if (isMob(entity)) {
    entity.state = state;
  }
};
