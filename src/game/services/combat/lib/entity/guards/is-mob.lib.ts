import { IRuntimeMob } from 'src/game/services/runtime-mob/types/runtime-mob.type';
import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isMob = (entity: RuntimeEntity): entity is IRuntimeMob => {
  return entity.type === 'mob';
};
