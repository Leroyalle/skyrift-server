import { LiveCharacter } from 'src/character/types/runtime-character';
import { WorldEntity } from 'src/game/types/entity/runtime-entity.type';

export const isPlayer = (entity: WorldEntity): entity is LiveCharacter => {
  return entity.type === 'player';
};
