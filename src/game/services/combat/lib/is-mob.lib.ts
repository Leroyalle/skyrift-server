import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { RuntimeMob } from '../../runtime-mob/types/runtime-mob.type';

export const isMob = (
  entity: LiveCharacter | RuntimeMob,
): entity is RuntimeMob => {
  return entity.type === 'mob';
};
