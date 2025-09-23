import { RuntimeMob } from 'src/game/services/runtime-mob/types/runtime-mob.type';
import { WorldEntity } from 'src/game/types/entity/world-entity.type';

export const isMob = (entity: WorldEntity): entity is RuntimeMob => {
  return entity.type === 'mob';
};
