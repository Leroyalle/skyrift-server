import {
  CharacterActionState,
  IRuntimeCharacter,
} from 'src/character/types/runtime-character';
import {
  MobActionState,
  IRuntimeMob,
} from 'src/game/services/runtime-mob/types/runtime-mob.type';
import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { isMob } from '../../guards/is-mob.lib';
import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';

type EntityState<T> = T extends IRuntimeCharacter
  ? CharacterActionState
  : T extends IRuntimeMob
    ? MobActionState
    : BaseEntityStates;

export const setEntityState = <T>(
  entity: RuntimeEntity,
  state: EntityState<T>,
) => {
  if (isMob(entity)) {
    entity.mob.state = state;
  }
};
