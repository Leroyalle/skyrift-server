import { IRuntimeMob } from 'src/game/services/characters/runtime-mob/types/runtime-mob.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isMob = (entity: TRuntimeEntity): entity is IRuntimeMob => {
  return entity.type === 'mob';
};
