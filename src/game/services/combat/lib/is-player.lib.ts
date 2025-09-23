import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { RuntimeMob } from '../../runtime-mob/types/runtime-mob.type';

export const isPlayer = (
  entity: LiveCharacter | RuntimeMob,
): entity is LiveCharacter => {
  return entity.type === 'player';
};
