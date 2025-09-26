import { IRuntimeCharacter } from 'src/character/types/runtime-character';
import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isPlayer = (
  entity: RuntimeEntity,
): entity is IRuntimeCharacter => {
  return entity.type === 'player';
};
