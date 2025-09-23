import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { WorldEntity } from 'src/game/types/entity/world-entity.type';

export const isPlayer = (entity: WorldEntity): entity is LiveCharacter => {
  return entity.type === 'player';
};
