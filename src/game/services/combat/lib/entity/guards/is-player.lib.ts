import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isPlayer = (entity: TRuntimeEntity): entity is IRuntimeCharacter => {
  return entity.type === 'player';
};
